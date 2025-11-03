import React, { useState, useEffect } from "react";
import { BellOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Dropdown, Badge, List, message, Spin } from "antd";
import "./Notify.css";
import { getNotification, deleteNotification } from "../../services/notificationService";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom"; 

const getReadIdsFromStorage = () => {
  const storedIds = localStorage.getItem("readNotificationIds");
  return new Set(storedIds ? JSON.parse(storedIds) : []); 
};

const saveReadIdsToStorage = (idSet) => {
  localStorage.setItem("readNotificationIds", JSON.stringify(Array.from(idSet)));
};

const timeSince = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "Vừa xong";
};

export default function Notify() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useUser();
  const [unseenCount, setUnseenCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const [readIds, setReadIds] = useState(() => getReadIdsFromStorage());

  const fetchNotifications = async () => {
    if (!isAuthenticated) return; 
    setLoading(true);
    try {
      const res = await getNotification();
      if (res.status === 'success') {
        const newNotifications = res.notifications || [];
        setNotifications(newNotifications);
        const localReadIds = getReadIdsFromStorage();
        let newUnseenCount = 0;
        for (const notif of newNotifications) {
          if (!localReadIds.has(notif.notificationId)) {
            newUnseenCount++;
          }
        }
        setUnseenCount(newUnseenCount);
        setReadIds(localReadIds); 
      }
    } catch (error) {
      message.error("Không thể tải thông báo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); 
    try {
      const res = await deleteNotification(id);
      if(res.status === 'success') {
        message.success("Đã xóa thông báo.");
        const newReadIds = getReadIdsFromStorage();
        newReadIds.delete(id);
        saveReadIdsToStorage(newReadIds);
        fetchNotifications(); 
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error("Xóa thông báo thất bại!");
    }
  };

  const handleOpenChange = (open) => {
    setIsDropdownOpen(open);
    if (open) {
      setUnseenCount(0); 
      
      const allCurrentIds = notifications.map(n => n.notificationId);
      const newReadIds = new Set([...readIds, ...allCurrentIds]);
      
      saveReadIdsToStorage(newReadIds);
      setReadIds(newReadIds);
    }
  };

  const handleNotificationClick = (link, notificationId) => {
    if (!readIds.has(notificationId)) {
        const newReadIds = new Set(readIds);
        newReadIds.add(notificationId);
        saveReadIdsToStorage(newReadIds);
        setReadIds(newReadIds);
    }

    if (link && link !== "#") {
      navigate(link); 
      setIsDropdownOpen(false); 
    }
  };

  const menuItems = (
    <div className="notify-dropdown">
      <div className="notify__header">
        <div className="notify__header-title">
          <BellOutlined />
          Thông báo
        </div>
        <Button type="link" onClick={fetchNotifications}>Làm mới</Button>
      </div>
      <div className="notify__body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spin /></div>
        ) : (
          <List
            dataSource={notifications}
            locale={{ emptyText: 'Không có thông báo nào' }}
            renderItem={(item) => {
              const isRead = readIds.has(item.notificationId);
              
              return (
                <List.Item 
                  className="notify__item"
                  onClick={() => handleNotificationClick(item.link, item.notificationId)}
                  style={{ 
                    cursor: item.link && item.link !== "#" ? 'pointer' : 'default',
                    backgroundColor: isRead ? 'transparent' : 'var(--bg-secondary)' 
                  }}
                >
                  <div className="notify__item-content">
                    <div className="notify__item-title">
                      {!isRead && (
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          backgroundColor: '#1677ff', 
                          borderRadius: '50%', 
                          display: 'inline-block', 
                          marginRight: '8px' 
                        }}></span>
                      )}
                      {item.title}
                    </div>
                    <div className="notify__item-desc">{item.description}</div>
                    <div className="notify__item-time">{timeSince(item.createdTime)}</div>
                  </div>
                  <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    size="small" 
                    onClick={(e) => handleDelete(item.notificationId, e)}
                    className="delete-btn"
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => menuItems}
      trigger={["click"]}
      onOpenChange={handleOpenChange}
      open={isDropdownOpen}
    >
      <Badge count={unseenCount}>
        <Button 
          type="text" 
          icon={<BellOutlined 
            style={{ color: 'var(--text-primary)', fontSize: '20px' }} 
          />} 
        />
      </Badge>
    </Dropdown>
  );
}
import React, { useState, useEffect } from "react";
import { BellOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Dropdown, Badge, List, message, Spin } from "antd";
import "./Notify.css";
import { getNotification, deleteNotification } from "../../services/notificationService";
import { useUser } from "../../contexts/UserContext";

// Hàm tính thời gian tương đối (ví dụ: "5 phút trước")
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
  const { isAuthenticated } = useUser(); // Lấy trạng thái đăng nhập từ context

  const fetchNotifications = async () => {
    if (!isAuthenticated) return; // Không gọi API nếu chưa đăng nhập
    setLoading(true);
    try {
      const res = await getNotification();
      if (res.status === 'success') {
        setNotifications(res.notifications || []);
      }
    } catch (error) {
      message.error("Không thể tải thông báo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Thiết lập tự động làm mới thông báo sau mỗi 1 phút
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Ngăn dropdown đóng lại khi nhấn nút xóa
    try {
      const res = await deleteNotification(id);
      if(res.status === 'success') {
        message.success("Đã xóa thông báo.");
        fetchNotifications(); // Tải lại danh sách sau khi xóa
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error("Xóa thông báo thất bại!");
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
            renderItem={(item) => (
              <List.Item className="notify__item">
                <div className="notify__item-content">
                  <div className="notify__item-title">{item.title}</div>
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
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => menuItems}
      trigger={["click"]}
    >
      <Badge count={notifications.length}>
        <Button type="text" icon={<BellOutlined style={{ color: 'var(--text-primary)', fontSize: '20px' }} />} />
      </Badge>
    </Dropdown>
  );
}
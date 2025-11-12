import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Table, Badge, Tag, message, Switch, Popconfirm, Space, Button, Input, Tabs } from "antd";
import UserDetailModal from "./components/UserDetailModal";
import { getAllUser, getAllCustomer, lockUserById, getUser, getCustomer } from "../../../services/userService";

export default function UserManagement() {
  const [allUsers, setAllUsers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const [activeTabKey, setActiveTabKey] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const location = useLocation();
  const isManager = location.pathname.startsWith('/manager');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = isManager ? await getAllUser() : await getAllCustomer();
      if (res && res.status === 'success') {
        setAllUsers(res.users.map(u => ({ ...u, key: u.userId })));
      } else {
        message.error(res.message || "Không thể tải danh sách người dùng!");
      }
    } catch (error) {
      message.error("Lỗi kết nối khi tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isManager]);

  const displayedUsers = useMemo(() => {
    let filtered = [...allUsers];

    if (!isManager) {
        if (activeTabKey === 'buyer') {
            filtered = filtered.filter(user => user.roles.includes('BUYER') && !user.roles.includes('SELLER'));
        } else if (activeTabKey === 'seller') {
            filtered = filtered.filter(user => user.roles.includes('SELLER'));
        }
    }

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(lowercasedSearchTerm) ||
        (user.displayName && user.displayName.toLowerCase().includes(lowercasedSearchTerm)) ||
        user.email.toLowerCase().includes(lowercasedSearchTerm)
      );
    }
    
    return filtered;
  }, [allUsers, activeTabKey, searchTerm, isManager]);

  const handleLockToggle = async (userId, isCurrentlyActive) => {
    try {
      const isLock = isCurrentlyActive;
      const response = await lockUserById(userId, isLock);
      if (response === "User locked/unlocked") {
        message.success(`Đã ${isLock ? 'khóa' : 'mở khóa'} tài khoản thành công!`);
        fetchUsers();
      } else {
        throw new Error("Phản hồi từ server không hợp lệ.");
      }
    } catch (error) {
      message.error("Thao tác thất bại, vui lòng thử lại!");
    }
  };

  const handleViewDetails = async (userId) => {
    try {
        const res = isManager ? await getUser(userId) : await getCustomer(userId);
        if(res.status === 'success'){
            setSelectedUser(res.user);
            setIsDetailModalVisible(true);
        } else {
            message.error(res.message);
        }
    } catch (error) {
        message.error("Không thể tải chi tiết người dùng!");
    }
  };

  const columns = [
    { title: "Mã User", dataIndex: "userId", key: "userId" },
    { title: "Tên đăng nhập", dataIndex: "username", key: "username" },
    { title: "Tên hiển thị", dataIndex: "displayName", key: "displayName", render: (name) => name || 'Chưa cập nhật' },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Vai trò", dataIndex: "roles", key: "roles",
      render: (roles) => (
        <>
          {roles.map(role => {
            let color = "default";
            if (role === "MANAGER") color = "volcano";
            else if (role === "STAFF") color = "blue";
            else if (role === "SELLER") color = "green";
            return <Tag color={color} key={role}>{role}</Tag>;
          })}
        </>
      ),
    },
    {
      title: "Trạng thái", dataIndex: "isActive", key: "isActive",
      render: (isActive) => isActive ? <Badge status="success" text="Hoạt động" /> : <Badge status="error" text="Bị khóa" />,
    },
    {
      title: "Hành động", key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleViewDetails(record.userId)}>Xem chi tiết</Button>
          {isManager && !record.roles.includes("MANAGER") && (
            <Popconfirm title={`Bạn chắc muốn ${record.isActive ? 'khóa' : 'mở khóa'} tài khoản này?`} onConfirm={() => handleLockToggle(record.userId, record.isActive)}>
              <Switch checked={record.isActive} size="small" />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: 'Tất cả',
    },
    {
      key: 'buyer',
      label: 'Người Mua (Buyer)',
    },
    {
      key: 'seller',
      label: 'Người Bán (Seller)',
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input.Search
            placeholder="Tìm kiếm theo tên, email..."
            onSearch={setSearchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 400 }}
        />
      </div>

      {!isManager ? (
        <Tabs 
          defaultActiveKey="all" 
          onChange={setActiveTabKey} 
          items={tabItems} 
        />
      ) : null}

      <Table
        dataSource={displayedUsers}
        columns={columns}
        rowKey="userId"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
      
      <UserDetailModal 
        user={selectedUser}
        visible={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
      />
    </>
  );
}
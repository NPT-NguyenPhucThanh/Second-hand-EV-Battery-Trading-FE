import React, { useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Descriptions,
  Image,
  Tag,
  Space,
  message,
} from "antd";
import {
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import AdminBreadcrumb from "../../components/admin/AdminBreadcrumb";
import { userData } from "../../dataAdmin";

export default function UserManagement() {
  const [users, setUsers] = useState(userData);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showDetails = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const toggleActive = (userid) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.userid === userid ? { ...u, isactive: !u.isactive } : u
      )
    );
    message.success("Cập nhật trạng thái tài khoản thành công!");
  };

  const approveSeller = (userid) => {
    setUsers((prev) =>
      prev.map((u) => (u.userid === userid ? { ...u, role: "buyer" } : u))
    );
    message.success("Đã duyệt seller mới thành công!");
  };

  const pendingColumns = [
    { title: "User ID", dataIndex: "userid", key: "userid" },
    { title: "Tên hiển thị", dataIndex: "displayname", key: "displayname" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },
    {
      title: "Trạng thái",
      dataIndex: "isactive",
      key: "isactive",
      render: (active) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Bị khóa</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
            type="primary"
          >
            Xem
          </Button>
          <Button
            icon={<CheckOutlined />}
            type="default"
            onClick={() => approveSeller(record.userid)}
            style={{ backgroundColor: "#52c41a", color: "white" }}
          >
            Duyệt seller mới
          </Button>
          <Button
            danger={record.isactive}
            icon={record.isactive ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => toggleActive(record.userid)}
          >
            {record.isactive ? "Khóa" : "Mở khóa"}
          </Button>
        </Space>
      ),
    },
  ];

  const allColumns = [
    { title: "User ID", dataIndex: "userid", key: "userid" },
    { title: "Tên hiển thị", dataIndex: "displayname", key: "displayname" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },
    {
      title: "Quyền",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        if (role === "buyer") return <Tag color="blue">Buyer</Tag>;
        if (role === "pending_buyer")
          return <Tag color="orange">Chờ duyệt</Tag>;
        return <Tag color="default">User</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isactive",
      key: "isactive",
      render: (active) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Bị khóa</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
            type="primary"
          >
            Xem
          </Button>
          <Button
            danger={record.isactive}
            icon={record.isactive ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => toggleActive(record.userid)}
          >
            {record.isactive ? "Khóa" : "Mở khóa"}
          </Button>
        </Space>
      ),
    },
  ];

  const pendingBuyers = users.filter((u) => u.role === "pending_buyer");
  const allUsers = users;

  return (
    <>
      <AdminBreadcrumb />
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Yêu cầu cấp quyền Buyer",
            children: (
              <Table
                columns={pendingColumns}
                dataSource={pendingBuyers}
                rowKey="userid"
                pagination={{ pageSize: 5 }}
              />
            ),
          },
          {
            key: "2",
            label: "Tất cả người dùng",
            children: (
              <Table
                columns={allColumns}
                dataSource={allUsers}
                rowKey="userid"
                pagination={{ pageSize: 5 }}
              />
            ),
          },
        ]}
      />

      <Modal
        title="Thông tin chi tiết người dùng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedUser && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Hình ảnh">
              <Image
                width={100}
                src={selectedUser.avatar}
                alt={selectedUser.displayname}
                style={{ borderRadius: "8px" }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Tên hiển thị">
              {selectedUser.displayname}
            </Descriptions.Item>
            <Descriptions.Item label="Tên đăng nhập">
              {selectedUser.username}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedUser.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {selectedUser.dateofbirth}
            </Descriptions.Item>
            <Descriptions.Item label="Quyền hiện tại">
              {selectedUser.role}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selectedUser.isactive ? "Hoạt động" : "Bị khóa"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedUser.created_at}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật gần nhất">
              {selectedUser.updated_at}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
}

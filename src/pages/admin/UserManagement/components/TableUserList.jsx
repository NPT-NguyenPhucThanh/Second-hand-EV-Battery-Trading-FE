import React from "react";
import { Table, Badge, Tag } from "antd";

export default function TableUserList({ users }) {
  
  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Tên hiển thị",
      dataIndex: "displayName",
      key: "displayName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      render: (roles) =>
        roles.map((role) => (
          <Tag
            color={
              role === "MANAGER"
                ? "volcano"
                : role === "STAFF"
                ? "blue"
                : role === "SELLER"
                ? "green"
                : "default"
            }
            key={role}
          >
            {role}
          </Tag>
        )),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) =>
        isActive ? (
          <Badge status="success" text="Đang hoạt động" />
        ) : (
          <Badge status="error" text="Bị khóa" />
        ),
    },
  ];

  return <Table dataSource={users} columns={columns} rowKey="userId" />;
}

import React from "react";
import { Table, Image, Button, Space } from "antd";
import ApproveSeller from "./ApproveSeller";
import RejectSeller from "./RejectSeller";

export default function TableSellerUpgrade({ sellerUpgrade, onReload }) {
  const columns = [
    {
      title: "STT",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 70,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
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
      render: (phone) => phone || "Chưa cung cấp",
    },
    {
      title: "Ngày gửi yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Ảnh CCCD mặt trước",
      dataIndex: "cccdFrontUrl",
      key: "cccdFrontUrl",
      render: (url) =>
        url ? <Image src={url} alt="CCCD Trước" width={80} /> : "Không có ảnh",
    },
    {
      title: "Ảnh CCCD mặt sau",
      dataIndex: "cccdBackUrl",
      key: "cccdBackUrl",
      render: (url) =>
        url ? <Image src={url} alt="CCCD Sau" width={80} /> : "Không có ảnh",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <ApproveSeller record={record} onReload={onReload} />
          <RejectSeller record={record} onReload={onReload} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={sellerUpgrade}
        columns={columns}
        rowKey="userId"
        pagination={{ pageSize: 5 }}
      />
    </>
  );
}

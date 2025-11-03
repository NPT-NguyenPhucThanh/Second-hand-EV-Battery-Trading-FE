import React, { useState } from "react";
import { Table, Button, Modal, Input, Tag, Form } from "antd";
import { disputeData } from "../../../dataAdmin"; 
import AdminBreadcrumb from '../../../components/admin/AdminBreadcrumb';

export default function DisputeManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [form] = Form.useForm();

  const handleView = (record) => {
    setSelectedDispute(record);
    setIsModalOpen(true);
  };



  const columns = [
    { title: "Mã tranh chấp", dataIndex: "id", key: "id" },
    { title: "Người mua", dataIndex: "buyer", key: "buyer" },
    { title: "Người bán", dataIndex: "seller", key: "seller" },
    { title: "Lý do", dataIndex: "reason", key: "reason" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "Pending"
            ? "orange"
            : status === "Resolved"
            ? "green"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleView(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
    <AdminBreadcrumb />
      <Table
        columns={columns}
        dataSource={disputeData}
        pagination={{ pageSize: 7 }}
        scroll={{ x: "max-content" }}
        rowKey="id"
      />

      <Modal
        title="Giải quyết tranh chấp"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        
        okText="Xác nhận giải quyết"
        cancelText="Hủy"
      >
        {selectedDispute && (
          <>
            <p>
              <b>Mã tranh chấp:</b> {selectedDispute.id}
            </p>
            <p>
              <b>Lý do:</b> {selectedDispute.reason}
            </p>
            <Form layout="vertical" form={form}>
              <Form.Item
                name="resolution"
                label="Hướng xử lý"
                rules={[{ required: true, message: "Nhập hướng xử lý!" }]}
              >
                <Input.TextArea rows={3} placeholder="Nhập cách giải quyết..." />
              </Form.Item>

              <Form.Item name="amount" label="Số tiền hoàn trả (nếu có)">
                <Input type="number" placeholder="Nhập số tiền..." />
              </Form.Item>

              <Form.Item name="reason" label="Lý do hoàn tiền">
                <Input placeholder="Lý do hoàn tiền (nếu có)" />
              </Form.Item>

              <Form.Item name="status" label="Trạng thái hoàn tiền">
                <Input placeholder="Approved / Rejected" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
}

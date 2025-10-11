import React, { useState } from "react";
import { Table, Button, Modal, Upload, Form, Select, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { vehicleInspection } from "../../dataAdmin";

export default function VehicleInspection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    { title: "ID", dataIndex: "productid", key: "productid" },
    { title: "Tên xe", dataIndex: "productname", key: "productname" },
    { title: "Model", dataIndex: "model", key: "model" },
    { title: "Loại xe", dataIndex: "type", key: "type" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleOpenModal(record)}>
          Nhập kết quả
        </Button>
      ),
    },
  ];

  const handleOpenModal = (record) => {
    setSelectedProduct(record);
    setIsModalOpen(true);
  };

  return (
    <>
      <Table columns={columns} dataSource={vehicleInspection} rowKey="productid" />

      <Modal
        title={`Nhập kết quả kiểm định: ${selectedProduct?.productname}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Upload file chứng nhận" name="certificate">
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Kết quả"
            name="result"
            rules={[{ required: true, message: "Vui lòng chọn kết quả kiểm định" }]}
          >
            <Select
              options={[
                { label: "Đạt", value: "pass" },
                { label: "Không đạt", value: "fail" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu có..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

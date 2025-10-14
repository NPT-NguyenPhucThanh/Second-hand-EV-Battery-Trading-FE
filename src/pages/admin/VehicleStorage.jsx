import React, { useState } from "react";
import { Table, Button, Tag, Select, Space, Modal, message, Input, Form } from "antd";
import { productsData } from "../../dataAdmin";
import AdminBreadcrumb from "../../components/admin/AdminBreadcrumb";

export default function VehicleStorage() {
  const [products, setProducts] = useState(productsData);
  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: null,
    status: null,
  });
  const [form] = Form.useForm();

  const filteredData = products.filter(
    (p) =>
      p.in_warehouse &&
      (!filters.type || p.type === filters.type) &&
      (!filters.status || p.status === filters.status)
  );

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên xe", dataIndex: "productname", key: "productname" },
    { title: "Model", dataIndex: "model", key: "model" },
    { title: "Loại", dataIndex: "type", key: "type" },
    { title: "File chứng nhận", dataIndex: "file", key: "file" },
    {
      title: "Giá (VNĐ)",
      dataIndex: "cost",
      key: "cost",
      render: (c) => c.toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "inspection_passed" ? "green" : "volcano"}>
          {status === "inspection_passed" ? "Đạt kiểm định" : "Không đạt"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleDetail(record)}>
            Xem / Sửa
          </Button>
          <Button danger onClick={() => handleRemove(record.productid)}>
            Xóa khỏi kho
          </Button>
        </Space>
      ),
    },
  ];

  const handleDetail = (record) => {
    setSelected(record);
    form.setFieldsValue(record); // gán giá trị vào form
    setIsModalOpen(true);
  };

  const handleRemove = (id) => {
    setProducts(products.filter((p) => p.productid !== id));
    message.success("Xe đã được xóa khỏi kho!");
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const updated = products.map((p) =>
        p.productid === selected.productid ? { ...p, ...values } : p
      );
      setProducts(updated);
      message.success("Cập nhật thông tin xe thành công!");
      setIsModalOpen(false);
    });
  };

  return (
    <>
      <AdminBreadcrumb />

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="productid"
        scroll={{ x: "max-content" }}
      />

      {/* Modal chỉnh sửa thông tin xe */}
      <Modal
        title={`Thông tin xe: ${selected?.productname || ""}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={600}
      >
        {selected && (
          <Form form={form} layout="vertical">
            <Form.Item
              label="Tên xe"
              name="productname"
              rules={[{ required: true, message: "Nhập tên xe!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="Model" name="model">
              <Input />
            </Form.Item>

            <Form.Item label="Loại xe" name="type">
              <Input />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              label="Giá (VNĐ)"
              name="cost"
              rules={[{ required: true, message: "Nhập giá xe!" }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item label="Trạng thái" name="status">
              <Select
                options={[
                  { label: "Đạt kiểm định", value: "inspection_passed" },
                  { label: "Không đạt", value: "inspection_failed" },
                ]}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}

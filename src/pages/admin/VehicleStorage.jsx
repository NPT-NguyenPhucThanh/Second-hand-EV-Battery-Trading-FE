import React, { useState } from "react";
import { Table, Button, Tag, Select, Space, Modal, message } from "antd";
import { productsData } from "../../dataAdmin";
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb';

export default function VehicleStorage() {
  const [products, setProducts] = useState(productsData);
  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: null,
    status: null,
  });

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
    { title: "Giá (VNĐ)", dataIndex: "cost", key: "cost", render: (c) => c.toLocaleString() },
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
          <Button type="link" onClick={() => handleDetail(record)}>Xem chi tiết</Button>
          <Button danger onClick={() => handleRemove(record.productid)}>Xóa khỏi kho</Button>
        </Space>
      ),
    },
  ];

  const handleDetail = (record) => {
    setSelected(record);
    setIsModalOpen(true);
  };

  const handleRemove = (id) => {
    setProducts(products.filter((p) => p.productid !== id));
    message.success("Xe đã được xóa khỏi kho!");
  };

  return (
    <>
    <AdminBreadcrumb />

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Lọc theo loại xe"
          allowClear
          onChange={(v) => setFilters({ ...filters, type: v })}
          options={[
            { label: "Sedan", value: "Sedan" },
            { label: "SUV", value: "SUV" },
            { label: "Truck", value: "Truck" },
          ]}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          onChange={(v) => setFilters({ ...filters, status: v })}
          options={[
            { label: "Đạt kiểm định", value: "inspection_passed" },
            { label: "Không đạt", value: "inspection_failed" },
          ]}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="productid"
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={selected?.productname}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {selected && (
          <>
            <p><strong>Model:</strong> {selected.model}</p>
            <p><strong>Mô tả:</strong> {selected.description}</p>
            <p><strong>Loại:</strong> {selected.type}</p>
            <p><strong>Giá:</strong> {selected.cost.toLocaleString()} VNĐ</p>
            <p><strong>Trạng thái:</strong> {selected.status}</p>
          </>
        )}
      </Modal>
    </>
  );
}

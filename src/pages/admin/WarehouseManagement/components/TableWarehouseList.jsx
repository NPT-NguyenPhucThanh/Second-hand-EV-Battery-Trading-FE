import { Table, Badge, Tag, Button, Space } from "antd";
import WarehouseAdd from "./WarehouseAdd";
import WarehouseUpdate from "./WarehouseUpdate";
import WarehouseRemove from "./WarehouseRemove";

export default function TableWarehouseList({
  products,
  onViewDetail,
  onReload,
  tabType,
}) {
  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productname",
      key: "productname",
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "cost",
      key: "cost",
      render: (cost) => cost.toLocaleString("vi-VN"),
    },
    {
      title: "Người bán",
      key: "seller",
      render: (_, record) =>
        record.users?.displayname || record.users?.username,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "DANG_BAN"
            ? "green"
            : status === "DA_BAN"
            ? "volcano"
            : "default";
        const label =
          status === "DANG_BAN"
            ? "Đang bán"
            : status === "DA_BAN"
            ? "Đã bán"
            : status;
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Trong kho",
      dataIndex: "inWarehouse",
      key: "inWarehouse",
      render: (inWarehouse) =>
        inWarehouse ? (
          <Badge status="processing" text="Còn trong kho" />
        ) : (
          <Badge status="default" text="Đã xuất kho" />
        ),
    },
    {
      title: "Thông tin",
      key: "view",
      render: (_, record) => (
        <Button type="link" onClick={() => onViewDetail(record)}>
          Xem chi tiết
        </Button>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          {tabType === "pending" && (
            <WarehouseAdd record={record} onReload={onReload} type="primary" />
          )}
          {tabType === "inWarehouse" && (
            <>
              <WarehouseUpdate
                record={record}
                onReload={onReload}
                type="success"
              />
              <WarehouseRemove
                record={record}
                onReload={onReload}
                type="danger"
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={products}
      columns={columns}
      rowKey="productid"
      pagination={{ pageSize: 10 }}
    />
  );
}

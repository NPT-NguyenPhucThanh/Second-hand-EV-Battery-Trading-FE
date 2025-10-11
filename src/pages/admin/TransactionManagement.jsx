import React, {  useState } from "react";
import { Table, Button, Modal, Input, Tag } from "antd";
import { orders } from "../../dataAdmin"; // Dữ liệu giả lập

export default function TransactionManagement() {

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [note, setNote] = useState("");
  const [modalVisible, setModalVisible] = useState(false);



  const columns = [
    { title: "Mã đơn", dataIndex: "id", key: "id" },
    { title: "Xe", dataIndex: "productName", key: "productName" },
    { title: "Người mua", dataIndex: "buyerName", key: "buyerName" },
    { title: "Người bán", dataIndex: "sellerName", key: "sellerName" },
    { title: "Tổng giá", dataIndex: "totalPrice", key: "totalPrice" },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt" },
    { title: "Số tiền đặt cọc", dataIndex: "deposit", key: "deposit" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "PENDING" ? "orange" : "green"}>{status}</Tag>
      ),
    },
    {
  title: "Hành động",
  render: (_, record) =>
    record.status === "PENDING" ? (
      <Button
        type="primary"
        onClick={() => {
          setSelectedOrder(record);
          setModalVisible(true);
        }}
      >
        Duyệt / Từ chối
      </Button>
    ) : (
      <Tag color="default">Đã xử lý</Tag>
    ),
},

  ];

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Duyệt giao dịch xe</h2>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
      />

      <Modal
        title={`Duyệt giao dịch #${selectedOrder?.id}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="reject" danger >
            Từ chối
          </Button>,
          <Button key="approve" type="primary" >
            Duyệt
          </Button>,
        ]}
      >
        <p>Ghi chú (tùy chọn):</p>
        <Input.TextArea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập ghi chú cho quyết định này..."
        />
      </Modal>
    </>
  );
}

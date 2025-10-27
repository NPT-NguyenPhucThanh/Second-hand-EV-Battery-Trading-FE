import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Tag, message, Space } from "antd";
import { getPendingApprovalOrders, approveOrder } from "../../../services/orderService";
import AdminBreadcrumb from "../../../components/admin/AdminBreadcrumb";

export default function TransactionManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [note, setNote] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('approve'); // 'approve' or 'reject'

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getPendingApprovalOrders();
      setOrders(data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách giao dịch!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showModal = (record) => {
    setSelectedOrder(record);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setNote("");
    setSelectedOrder(null);
  };

  const handleProcess = async (isApproved) => {
    if (!selectedOrder) return;

    if (!isApproved && !note.trim()) {
      message.warning("Vui lòng nhập lý do từ chối!");
      return;
    }

    const payload = {
      approved: isApproved,
      note: note,
    };

    try {
      const success = await approveOrder(selectedOrder.orderid, payload);
      if (success) {
        message.success(`Đã ${isApproved ? 'duyệt' : 'từ chối'} giao dịch thành công!`);
        fetchOrders();
        handleCancel();
      } else {
        throw new Error("Phản hồi từ server không hợp lệ.");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const columns = [
    { title: "Mã Đơn", dataIndex: "orderid", key: "orderid" },
    { title: "Người mua", dataIndex: ["users", "username"], key: "buyerName" },
    {
      title: "Tổng Giá (VNĐ)",
      dataIndex: "totalfinal",
      key: "totalPrice",
      render: (price) => price.toLocaleString('vi-VN')
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdat",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString('vi-VN')
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "CHO_DUYET" ? "orange" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => showModal(record)}
        >
          Xử lý
        </Button>
      ),
    },
  ];

  return (
    <>
      <AdminBreadcrumb />
      <h2>Quản lý Giao dịch (Duyệt đơn hàng)</h2>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="orderid"
        loading={loading}
        pagination={{ pageSize: 7 }}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={`Xử lý giao dịch #${selectedOrder?.orderid}`}
        open={modalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="reject" danger onClick={() => handleProcess(false)}>
            Từ chối
          </Button>,
          <Button key="approve" type="primary" onClick={() => handleProcess(true)}>
            Duyệt
          </Button>,
        ]}
      >
        {selectedOrder && (
            <>
                <p><strong>Người mua:</strong> {selectedOrder.users?.username}</p>
                <p><strong>Tổng tiền:</strong> {selectedOrder.totalfinal?.toLocaleString('vi-VN')} ₫</p>
                <p>Vui lòng nhập ghi chú (bắt buộc nếu từ chối):</p>
                <Input.TextArea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập lý do/ghi chú cho quyết định này..."
                />
            </>
        )}
      </Modal>
    </>
  );
}
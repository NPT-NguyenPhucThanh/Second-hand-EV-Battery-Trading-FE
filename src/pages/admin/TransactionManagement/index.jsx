import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Tag, message, Space } from "antd";
// Sửa lại import để phù hợp với yêu cầu của bạn
import { getOrders, getOrderDetails, approveOrder } from "../../../services/orderService"; 
import AdminBreadcrumb from "../../../components/admin/AdminBreadcrumb";
import TransactionDetailModal from "./components/TransactionDetailModal";

export default function TransactionManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [note, setNote] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false); // State mới

  // Hàm tải dữ liệu từ API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      // *** SỬA LỖI Ở ĐÂY ***
      // Truy cập vào mảng 'orders' bên trong object trả về
      if (response && response.status === 'success') {
        setOrders(response.orders || []);
      } else {
        message.error(response.message || "Không thể tải danh sách giao dịch!");
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách giao dịch!");
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu khi trang được mở
  useEffect(() => {
    fetchOrders();
  }, []);

  const showModal = (record) => {
    setSelectedOrder(record);
    setModalVisible(true);
  };

  // Hàm mở modal chi tiết
  const showDetailModal = async (orderId) => {
    try {
        const res = await getOrderDetails(orderId);
        if (res.status === 'success') {
            setSelectedOrder(res.order);
            setIsDetailModalVisible(true);
        } else {
            message.error("Không thể tải chi tiết đơn hàng!");
        }
    } catch (error) {
         message.error("Lỗi khi tải chi tiết đơn hàng!");
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setNote("");
    setSelectedOrder(null);
  };

  // Hàm xử lý khi nhấn nút "Duyệt" hoặc "Từ chối"
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
      // Giả sử hàm approveOrder đã được định nghĩa đúng
      const success = await approveOrder(selectedOrder.orderid, payload);
      if (success) {
        message.success(`Đã ${isApproved ? 'duyệt' : 'từ chối'} giao dịch thành công!`);
        fetchOrders(); // Tải lại danh sách để cập nhật
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
      render: (status) => {
          let color = "default";
          if (status === "CHO_DUYET") color = "orange";
          else if (status === "DA_HOAN_TAT") color = "green";
          else if (status === "BI_TU_CHOI") color = "red";
          return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: "Hành động",
      render: (_, record) => (
       <Space>
            <Button size="small" onClick={() => showDetailModal(record.orderid)}>
                Xem chi tiết
            </Button>
            <Button type="primary" size="small" onClick={() => showModal(record)}>
                Xử lý
            </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
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
          <Button key="cancel" onClick={handleCancel}>Hủy</Button>,
          <Button key="reject" danger onClick={() => handleProcess(false)}>Từ chối</Button>,
          <Button key="approve" type="primary" onClick={() => handleProcess(true)}>Duyệt</Button>,
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
      <TransactionDetailModal 
        order={selectedOrder}
        visible={isDetailModalVisible}
        onClose={handleCancel}
      />
    </>
  );
}
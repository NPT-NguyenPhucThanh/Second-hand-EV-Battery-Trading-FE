import React, { useState, useEffect, useCallback } from "react";
// Sửa đổi 1: Bỏ 'Select' và 'Typography' nếu không dùng (giữ lại cho bộ lọc)
import { Table, Button, Modal, Input, Tag, message, Space, Select, Typography } from "antd";
// Sửa đổi 2: Bỏ import getOrderDetails
import { getOrders, approveOrder, getOrdersByStatus } from "../../../services/orderService"; 
// Sửa đổi 3: Bỏ import Modal chi tiết
// import TransactionDetailModal from "./components/TransactionDetailModal";

const { Text } = Typography; 

const ORDER_STATUS = {
  CHO_DUYET: "CHO_DUYET",
  CHO_THANH_TOAN: "CHO_THANH_TOAN",
  DA_DAT_COC: "DA_DAT_COC", 
  DA_THANH_TOAN: "DA_THANH_TOAN", 
  DA_HOAN_TAT: "DA_HOAN_TAT",
  BI_TU_CHOI: "BI_TU_CHOI",
  TRANH_CHAP: "TRANH_CHAP",
  DA_GIAO: "DA_GIAO",
  DA_HUY: "DA_HUY"
};

const filterOptions = [
  { value: "ALL", label: "Tất cả đơn hàng" },
  { value: ORDER_STATUS.CHO_DUYET, label: "Chờ duyệt" },
  { value: ORDER_STATUS.DA_DAT_COC, label: "Đã đặt cọc" }, 
  { value: ORDER_STATUS.DA_THANH_TOAN, label: "Đã thanh toán" }, 
  { value: ORDER_STATUS.TRANH_CHAP, label: "Đang tranh chấp" },
  { value: ORDER_STATUS.DA_HOAN_TAT, label: "Đã hoàn tất" },
  { value: ORDER_STATUS.BI_TU_CHOI, label: "Bị từ chối" },
  { value: ORDER_STATUS.DA_HUY, label: "Đã hủy" },
];

export default function TransactionManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [note, setNote] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  
  // Sửa đổi 4: Xóa state 'isDetailModalVisible'
  // const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState("ALL"); 

  const fetchOrders = useCallback(async (filterKey) => { 
    setLoading(true);
    try {
      let response;
      if (filterKey === "ALL") {
        response = await getOrders();
      } else {
        response = await getOrdersByStatus(filterKey); 
      }
      
      if (response && response.status === 'success') {
        const fetchedOrders = response.orders || [];
        fetchedOrders.sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
         setOrders(fetchedOrders);
      } else {
        message.error(response.message || "Không thể tải danh sách giao dịch!");
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách giao dịch!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter, fetchOrders]); 

  const showModal = (record) => {
    setSelectedOrder(record);
    setModalVisible(true);
  };

  // Sửa đổi 5: Xóa hàm 'showDetailModal'
  /*
  const showDetailModal = async (orderId) => {
    // ... (code đã bị xóa)
  };
  */

  const handleCancel = () => {
    setModalVisible(false);
    setNote("");
    setSelectedOrder(null);
    // Sửa đổi 6: Xóa dòng set 'isDetailModalVisible'
    // setIsDetailModalVisible(false);
  };

  const handleProcess = async (isApproved) => {
    if (!selectedOrder) return;
    if (!isApproved && !note.trim()) {
      message.warning("Vui lòng nhập lý do từ chối!");
      return;
    }
    const payload = { approved: isApproved, note: note };

    try {
      const success = await approveOrder(selectedOrder.orderid, payload);
      if (success === "Order processed") {
        message.success(`Đã ${isApproved ? 'duyệt' : 'từ chối'} giao dịch thành công!`);
        fetchOrders(statusFilter); 
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
      render: (price) => (price ? price.toLocaleString('vi-VN') : '0')
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
          if (status === ORDER_STATUS.CHO_DUYET) color = "orange";
          else if (status === ORDER_STATUS.DA_DAT_COC) color = "blue"; 
          else if (status === ORDER_STATUS.DA_THANH_TOAN) color = "processing"; 
          else if (status === ORDER_STATUS.DA_HOAN_TAT) color = "green";
          else if (status === ORDER_STATUS.BI_TU_CHOI) color = "red";
          else if (status === ORDER_STATUS.TRANH_CHAP) color = "volcano";
          return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: "Hành động",
      render: (_, record) => (
       <Space>
            {/*
            <Button size="small" onClick={() => showDetailModal(record.orderid)}>
                Xem chi tiết
            </Button>
            */}

            {(record.status === ORDER_STATUS.CHO_DUYET || record.status === ORDER_STATUS.DA_DAT_COC) && (
              <Button type="primary" size="small" onClick={() => showModal(record)}>
                  Xử lý
              </Button>
            )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <h2>Quản lý Giao dịch (Duyệt đơn hàng)</h2>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Text strong>Lọc theo trạng thái:</Text>
        <Select
          value={statusFilter} 
          style={{ width: 200 }}
          onChange={setStatusFilter}
          options={filterOptions}
        />
      </div>
      
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
    </>
  );
}
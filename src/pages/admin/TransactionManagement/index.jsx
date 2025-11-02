import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Input, Tag, message, Space, Tabs } from "antd";
import { getOrders, getOrderDetails, approveOrder, getOrdersByStatus } from "../../../services/orderService"; 
import TransactionDetailModal from "./components/TransactionDetailModal";

const ORDER_STATUS = {
  CHO_DUYET: "CHO_DUYET",
  CHO_THANH_TOAN: "CHO_THANH_TOAN",
  DA_HOAN_TAT: "DA_HOAN_TAT",
  BI_TU_CHOI: "BI_TU_CHOI",
  TRANH_CHAP: "TRANH_CHAP",
  DA_GIAO: "DA_GIAO",
  DA_HUY: "DA_HUY"
};

export default function TransactionManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [note, setNote] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(ORDER_STATUS.CHO_DUYET); 

  const fetchOrders = useCallback(async (tabKey) => {
    setLoading(true);
    try {
      let response;
      if (tabKey === "ALL") {
        response = await getOrders();
      } else {
        response = await getOrdersByStatus(tabKey);
      }
      
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
  }, []);

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab, fetchOrders]); 

  const showModal = (record) => {
    setSelectedOrder(record);
    setModalVisible(true);
  };

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
    setIsDetailModalVisible(false);
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
        fetchOrders(activeTab); 
        handleCancel();
      } else {
        throw new Error("Phản hồi từ server không hợp lệ.");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
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
            <Button size="small" onClick={() => showDetailModal(record.orderid)}>
                Xem chi tiết
            </Button>

            {record.status === ORDER_STATUS.CHO_DUYET && (
              <Button type="primary" size="small" onClick={() => showModal(record)}>
                  Xử lý
              </Button>
            )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: ORDER_STATUS.CHO_DUYET,
      label: "Chờ duyệt",
    },
    {
      key: ORDER_STATUS.TRANH_CHAP,
      label: "Đang tranh chấp",
    },
    {
      key: ORDER_STATUS.DA_HOAN_TAT,
      label: "Đã hoàn tất",
    },
    {
      key: ORDER_STATUS.BI_TU_CHOI,
      label: "Bị từ chối",
    },
    {
      key: ORDER_STATUS.DA_HUY,
      label: "Đã hủy",
    },
     {
      key: "ALL", 
      label: "Tất cả đơn hàng",
    },
  ];

  return (
    <>
      <h2>Quản lý Giao dịch (Duyệt đơn hàng)</h2>

      <Tabs 
        defaultActiveKey={ORDER_STATUS.CHO_DUYET} 
        items={tabItems} 
        onChange={handleTabChange} 
      />
      
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
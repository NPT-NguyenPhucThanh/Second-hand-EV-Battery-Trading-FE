import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Tabs, message, Tag } from "antd";
import { getAllRefund, getRefundPending, getRefund, processRefund } from "../../../services/refundService";

const { TabPane } = Tabs;

export default function RefundManagement() {
  const [refunds, setRefunds] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Load dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      const all = await getAllRefund();
      const pending = await getRefundPending();
      setRefunds(all.refunds || []);
      setPendingRefunds(pending.refunds || []);
    } catch (error) {
      message.error("Không thể tải dữ liệu refund");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modal chi tiết refund
  const handleView = async (id) => {
    try {
      const data = await getRefund(id);
      setSelectedRefund(data.refund);
      setModalVisible(true);
    } catch (error) {
      message.error("Không thể tải chi tiết refund");
    }
  };

  // Xử lý approve/deny
  const handleProcess = async (approve) => {
    if (!selectedRefund) return;
    setProcessing(true);
    try {
      const payload = {
        approve,
        refundMethod: "VNPay",
        note: approve ? "Đã chấp nhận hoàn tiền" : "Từ chối hoàn tiền",
      };
      await processRefund(selectedRefund.id || selectedRefund.refundId, payload);
      message.success("Đã xử lý refund thành công");
      setModalVisible(false);
      fetchData(); // reload dữ liệu
    } catch (error) {
      message.error("Xử lý refund thất bại");
    }
    setProcessing(false);
  };

  const columns = [
    { title: "ID", dataIndex: "refundId", key: "id" },
    { title: "Order ID", dataIndex: "orderId", key: "orderId" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Status", dataIndex: "status", key: "status", 
      render: (status) => <Tag color={status === "PENDING" ? "orange" : "green"}>{status}</Tag>
    },
    { title: "Action", key: "action", render: (_, record) => (
      <Button onClick={() => handleView(record.refundId)}>Chi tiết</Button>
    )}
  ];

  return (
    <div>
      <h2>Refund Management</h2>
      <Tabs defaultActiveKey="1">
        <TabPane tab={`Tất cả (${refunds.length})`} key="1">
          <Table columns={columns} dataSource={refunds} rowKey="refundId" loading={loading} />
        </TabPane>
        <TabPane tab={`Đang chờ xử lý (${pendingRefunds.length})`} key="2">
          <Table columns={columns} dataSource={pendingRefunds} rowKey="refundId" loading={loading} />
        </TabPane>
      </Tabs>

      <Modal
        title={`Chi tiết Refund #${selectedRefund?.refundId}`}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="deny" danger onClick={() => handleProcess(false)} loading={processing}>
            Từ chối
          </Button>,
          <Button key="approve" type="primary" onClick={() => handleProcess(true)} loading={processing}>
            Chấp nhận
          </Button>
        ]}
      >
        {selectedRefund && (
          <div>
            <p><b>Order ID:</b> {selectedRefund.orderId}</p>
            <p><b>Amount:</b> {selectedRefund.amount}</p>
            <p><b>Status:</b> {selectedRefund.status}</p>
            <p><b>Reason:</b> {selectedRefund.reason}</p>
            <p><b>Requested At:</b> {selectedRefund.requestedAt}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Tabs, message, Tag, Descriptions } from "antd";
import { getAllRefund, getRefundPending, getRefund, processRefund } from "../../../services/refundService";

export default function RefundManagement() {
  const [allRefunds, setAllRefunds] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    setLoading(true);
    try {
      const allRes = await getAllRefund();
      const pendingRes = await getRefundPending();
      setAllRefunds(allRes.refunds || []);
      setPendingRefunds(pendingRes.refunds || []);
    } catch (error) {
      messageApi.error("Không thể tải dữ liệu yêu cầu hoàn tiền!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetails = async (refundId) => {
    try {
      const res = await getRefund(refundId);
      if (res.status === 'success') {
        setSelectedRefund(res.refund);
        setModalVisible(true);
      } else {
        messageApi.error(res.message || "Không tìm thấy chi tiết yêu cầu."); 
      }
    } catch (error) {
      messageApi.error("Lỗi khi tải chi tiết yêu cầu hoàn tiền!");
    }
  };

  const handleProcess = async (approveAction) => {
    if (!selectedRefund) return;

    setProcessing(true);
    const payload = {
      approve: approveAction,
      refundMethod: "VNPay", 
      note: approveAction ? "Chấp nhận hoàn tiền" : "Từ chối yêu cầu hoàn tiền",
    };

    try {
      const response = await processRefund(selectedRefund.refundid, payload);
      if (response.status === 'success') {
          messageApi.success(response.message); 
      } else {
          throw new Error(response.message);
      }
      setModalVisible(false);
      fetchData(); 
    } catch (error) {
      messageApi.error(error.message || "Xử lý yêu cầu thất bại!"); 
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { title: "Mã Yêu Cầu", dataIndex: "refundid", key: "refundid" },
    {
      title: "Mã Đơn Hàng",
      dataIndex: ["orders", "orderid"], 
      key: "orderid",
    },
    {
      title: "Số Tiền (VNĐ)",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => amount.toLocaleString('vi-VN'),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "PENDING") color = "orange";
        else if (status === "COMPLETED") color = "green";
        else if (status === "REJECTED") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Ngày Yêu Cầu",
      dataIndex: "createdat",
      key: "createdat",
      render: (text) => new Date(text).toLocaleString('vi-VN'),
    },
    {
      title: "Hành Động",
      key: "action",
      render: (_, record) => (
        <Button onClick={() => handleViewDetails(record.refundid)}>Xem Chi Tiết</Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'pending',
      label: `Đang chờ xử lý (${pendingRefunds.length})`,
      children: <Table columns={columns} dataSource={pendingRefunds} rowKey="refundid" loading={loading} />
    },
    {
      key: 'all',
      label: `Tất cả (${allRefunds.length})`,
      children: <Table columns={columns} dataSource={allRefunds} rowKey="refundid" loading={loading} />
    }
  ];

  return (
    <>
      {contextHolder}
      <h2>Quản lý Hoàn tiền</h2>
      <Tabs defaultActiveKey="pending" items={tabItems} />
      <Modal
        title={`Chi Tiết Yêu Cầu Hoàn Tiền #${selectedRefund?.refundid}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
          selectedRefund?.status === 'PENDING' && (
            <Button key="deny" danger onClick={() => handleProcess(false)} loading={processing}>
              Từ chối
            </Button>
          ),
          selectedRefund?.status === 'PENDING' && (
            <Button key="approve" type="primary" onClick={() => handleProcess(true)} loading={processing}>
              Chấp nhận hoàn tiền
            </Button>
          ),
        ]}
      >
        {selectedRefund && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã Đơn Hàng">{selectedRefund.orders?.orderid}</Descriptions.Item>
            <Descriptions.Item label="Số Tiền">{selectedRefund.amount?.toLocaleString('vi-VN')} ₫</Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">
              <Tag color={selectedRefund.status === "PENDING" ? "orange" : "green"}>{selectedRefund.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do">{selectedRefund.reason}</Descriptions.Item>
            <Descriptions.Item label="Ngày Yêu Cầu">{new Date(selectedRefund.createdat).toLocaleString('vi-VN')}</Descriptions.Item>
            {selectedRefund.processedAt && (
                 <Descriptions.Item label="Ngày Xử Lý">{new Date(selectedRefund.processedAt).toLocaleString('vi-VN')}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </>
  );
}
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Tabs, message, Tag, Descriptions } from "antd";
import { getAllRefund, getRefundPending, getRefund, processRefund } from "../../../services/refundService";
import AdminBreadcrumb from "../../../components/admin/AdminBreadcrumb";

const { TabPane } = Tabs;

export default function RefundManagement() {
  const [allRefunds, setAllRefunds] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Hàm tải dữ liệu từ API
  const fetchData = async () => {
    setLoading(true);
    try {
      const allRes = await getAllRefund();
      const pendingRes = await getRefundPending();
      setAllRefunds(allRes.refunds || []);
      setPendingRefunds(pendingRes.refunds || []);
    } catch (error) {
      message.error("Không thể tải dữ liệu yêu cầu hoàn tiền!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu khi component được mount lần đầu
  useEffect(() => {
    fetchData();
  }, []);

  // Mở modal và tải chi tiết một yêu cầu
  const handleViewDetails = async (refundId) => {
    try {
      const res = await getRefund(refundId);
      if (res.status === 'success') {
        setSelectedRefund(res.refund);
        setModalVisible(true);
      } else {
        message.error(res.message || "Không tìm thấy chi tiết yêu cầu.");
      }
    } catch (error) {
      message.error("Lỗi khi tải chi tiết yêu cầu hoàn tiền!");
    }
  };

  // Xử lý Chấp nhận hoặc Từ chối
  const handleProcess = async (approveAction) => {
    if (!selectedRefund) return;

    setProcessing(true);
    const payload = {
      approve: approveAction,
      refundMethod: "VNPay", // Hoặc có thể thêm lựa chọn trên modal
      note: approveAction ? "Chấp nhận hoàn tiền" : "Từ chối yêu cầu hoàn tiền",
    };

    try {
      const response = await processRefund(selectedRefund.refundid, payload);
      // Backend trả về message trong response, chúng ta sẽ dùng nó
      if (response.status === 'success') {
          message.success(response.message);
      } else {
          throw new Error(response.message);
      }
      setModalVisible(false);
      fetchData(); // Tải lại dữ liệu mới
    } catch (error) {
      message.error(error.message || "Xử lý yêu cầu thất bại!");
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { title: "Mã Yêu Cầu", dataIndex: "refundid", key: "refundid" },
    {
      title: "Mã Đơn Hàng",
      dataIndex: ["orders", "orderid"], // Lấy orderid từ object orders lồng nhau
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

  return (
    <>
      <AdminBreadcrumb />
      <h2>Quản lý Hoàn tiền</h2>
      <Tabs defaultActiveKey="pending">
        <TabPane tab={`Đang chờ xử lý (${pendingRefunds.length})`} key="pending">
          <Table columns={columns} dataSource={pendingRefunds} rowKey="refundid" loading={loading} />
        </TabPane>
        <TabPane tab={`Tất cả (${allRefunds.length})`} key="all">
          <Table columns={columns} dataSource={allRefunds} rowKey="refundid" loading={loading} />
        </TabPane>
      </Tabs>

      <Modal
        title={`Chi Tiết Yêu Cầu Hoàn Tiền #${selectedRefund?.refundid}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
          // Chỉ hiển thị nút xử lý cho các yêu cầu PENDING
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
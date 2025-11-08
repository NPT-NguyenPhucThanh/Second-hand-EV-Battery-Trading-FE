// src/components/profile/TransactionContent.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Card, Table, Tag, Statistic, Row, Col, Empty, Divider, Button } from "antd";
import { get } from "../../utils/api";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value ?? 0);
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TransactionStatusTag = ({ status }) => {
  const map = {
    SUCCESS: { text: "Thành công", color: "success" },
    PENDING: { text: "Đang xử lý", color: "processing" },
    CANCELLED: { text: "Đã hủy", color: "error" },
    FAILED: { text: "Thất bại", color: "error" },
  };
  const item = map[status] || { text: status, color: "default" };
  return <Tag color={item.color}>{item.text}</Tag>;
};

const TransactionTypeTag = ({ type }) => {
  const map = {
    DEPOSIT: { text: "Đặt cọc", color: "blue" },
    FINAL_PAYMENT: { text: "Thanh toán cuối", color: "green" },
    REFUND: { text: "Hoàn tiền", color: "orange" },
    COMMISSION: { text: "Hoa hồng", color: "purple" },
    BATTERY_PAYMENT: { text: "Thanh toán pin", color: "cyan" },
    PACKAGE_PURCHASE: { text: "Mua gói", color: "gold" },
  };
  const item = map[type] || { text: type, color: "default" };
  return <Tag color={item.color}>{item.text}</Tag>;
};

export default function TransactionContent() {
  const { orderId } = useParams(); // Lấy từ URL
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchTransactions = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await get(`api/buyer/orders/${orderId}/transactions`);
        if (res.status === "success" && res.summary) {
          setData(res);
        } else {
          throw new Error(res.message || "Không thể tải giao dịch");
        }
      } catch (err) {
        console.error("Lỗi:", err);
        message.error("Không thể tải giao dịch");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [orderId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <p className="mt-3 text-gray-500">Đang tải giao dịch...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <Empty
        description="Không có dữ liệu giao dịch"
        className="py-12"
      />
    );
  }

  const { summary, allTransactions } = data;

  const columns = [
    {
      title: "Loại",
      dataIndex: "transactionType",
      key: "type",
      render: (type) => <TransactionTypeTag type={type} />,
      width: 130,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "desc",
      render: (text) => <div className="max-w-xs line-clamp-2">{text}</div>,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>,
      width: 140,
    },
    {
      title: "Phương thức",
      key: "method",
      render: (_, r) => (
        <div>
          <Tag color="blue">{r.method || "—"}</Tag>
          {r.bankCode && <Tag>{r.bankCode}</Tag>}
        </div>
      ),
      width: 130,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <TransactionStatusTag status={status} />,
      width: 110,
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_, r) => (
        <div className="text-xs text-gray-600">
          <div>Tạo: {formatDate(r.createdAt)}</div>
          {r.paymentDate && <div>TT: {formatDate(r.paymentDate)}</div>}
        </div>
      ),
      width: 160,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Giao Dịch Đơn Hàng #{orderId}
        </h2>
        <Button onClick={() => navigate(-1)} icon={<i className="fa-solid fa-arrow-left mr-1"></i>}>
          Quay lại
        </Button>
      </div>

      {/* Tổng quan */}
      <Card className="mb-8 shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic title="Tổng thanh toán" value={summary.totalFinalPayment} formatter={formatCurrency} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic title="Tổng tiền hàng" value={summary.netAmount} formatter={formatCurrency} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic title="Tổng đặt cọc" value={summary.totalDeposit} formatter={formatCurrency} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic title="Hoàn tiền" value={summary.totalRefund} formatter={formatCurrency} />
          </Col>
        </Row>
      </Card>

      <Divider />

      <h3 className="text-lg font-semibold text-blue-700 mb-4">
        Lịch Sử Giao Dịch ({allTransactions.length})
      </h3>

      <Table
        dataSource={allTransactions}
        columns={columns}
        rowKey="transactionId"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
        bordered
        size="middle"
      />
    </div>
  );
}
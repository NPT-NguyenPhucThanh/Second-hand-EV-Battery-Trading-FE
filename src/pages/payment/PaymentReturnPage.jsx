import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../utils/api"; // Import file api.js của bạn
import { Result, Spin, Button } from "antd";

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      // 1. Lấy tất cả các tham số từ URL
      const params = Object.fromEntries(searchParams.entries());
      
      // 2. Tạo chuỗi query string
      const queryString = new URLSearchParams(params).toString();

      try {
        // 3. Gọi API về Backend (chính là endpoint /api/payment/vnpay-return)
        // Dùng `api.get` từ file `api.js` của bạn
        const response = await api.get(
          `api/payment/vnpay-return?${queryString}`
        );

        if (response.status === "success") {
          setPaymentData(response);
        } else {
          setError(response.message || "Thanh toán không thành công.");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối đến máy chủ để xác thực.");
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Spin size="large" />
        <p className="mt-4 text-lg">Đang xác thực thanh toán, vui lòng chờ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Thanh toán Thất bại"
        subTitle={error}
        extra={[
          <Button type="primary" key="console">
            <Link to="/">Quay về trang chủ</Link>
          </Button>,
          <Button key="buy">
            <Link to="/cart">Thử lại</Link>
          </Button>,
        ]}
      />
    );
  }

  if (paymentData) {
    return (
      <Result
        status="success"
        title="Thanh toán Thành công!"
        subTitle={`Đơn hàng #${paymentData.orderId} đã được thanh toán. Số tiền: ${Number(
          paymentData.amount
        ).toLocaleString("vi-VN")} ₫.`}
        extra={[
          <Button type="primary" key="console">
            <Link to="/">Tiếp tục mua sắm</Link>
          </Button>,
          <Button key="buy">
            <Link to="/profile">Xem lịch sử đơn hàng</Link>
          </Button>,
        ]}
      />
    );
  }

  return null; // Trường hợp không mong muốn
}
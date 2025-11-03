// src/components/seller/PaymentResult.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Result, Button, Spin } from "antd";
import { getTransactionStatus } from "../../services/packagePayment";

export default function PaymentResult() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const transactionCode = new URLSearchParams(location.search).get("transactionCode");

  useEffect(() => {
    if (!transactionCode) {
      navigate("/seller/packages");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await getTransactionStatus(transactionCode);
        setResult(data);
      } catch (err) {
        setResult({ status: "error" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [transactionCode, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-20 bg-gradient-to-br from-blue-50 to-green-50">
        <Spin size="large" tip="Đang kiểm tra kết quả..." />
      </div>
    );
  }

  const isSuccess = result?.status === "success" && result.transaction?.status === "SUCCESS";

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 p-6 bg-gradient-to-br from-blue-50 to-green-50">
      <Card className="max-w-md w-full shadow-2xl">
        <Result
          status={isSuccess ? "success" : "error"}
          title={isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          subTitle={isSuccess ? "Gói đã được kích hoạt." : "Vui lòng thử lại."}
          extra={[
            isSuccess && (
              <div key="info" className="bg-gray-50 p-4 rounded-xl text-left text-sm space-y-2 mb-4">
                <div><strong>Mã GD:</strong> {result.transaction.transactionCode}</div>
                <div><strong>Số tiền:</strong> {Number(result.transaction.amount).toLocaleString("vi-VN")}đ</div>
                <div><strong>Thời gian:</strong> {result.transaction.paymentDate ? new Date(result.transaction.paymentDate).toLocaleString("vi-VN") : "N/A"}</div>
              </div>
            ),
            <Button type="primary" size="large" onClick={() => navigate("/seller/my-packages")} className="w-full h-12">
              Xem gói của tôi
            </Button>,
            <Button type="link" block onClick={() => navigate("/")}>Về trang chủ</Button>,
          ]}
        />
      </Card>
    </div>
  );
}
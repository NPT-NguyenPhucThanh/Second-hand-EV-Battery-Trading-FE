// src/components/seller/PaymentResult.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Result, Button, Alert, message, Spin } from "antd";
import { get } from "../../utils/api";

export default function PaymentResult() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const transactionCode = searchParams.get("vnp_TxnRef");
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");

  useEffect(() => {
    if (!transactionCode) {
      navigate("/seller/packages");
      return;
    }

    const check = async () => {
      try {
        const res = await get(`/api/payment/transaction-status/${transactionCode}`);
        const transaction = res.transaction;

        if (transaction.status === "SUCCESS") {
          await get("/api/seller/packages/current");
          message.success("Gói dịch vụ đã được kích hoạt!");
        }

        setResult({
          status: transaction.status,
          transactionCode: transaction.transactionCode,
          amount: transaction.amount,
          packageName: transaction.description?.split(": ")[1] || "Gói dịch vụ",
        });
      } catch (err) {
        setResult({ status: "error", message: err.message });
      } finally {
        setLoading(false);
      }
    };

    if (vnp_ResponseCode === "00") {
      check();
    } else {
      setResult({ status: "FAILED", vnpayResponseCode: vnp_ResponseCode || "99" });
      setLoading(false);
    }
  }, [transactionCode, vnp_ResponseCode, navigate]);

  if (loading) return <div className="flex justify-center items-center min-h-screen pt-20"><Spin size="large" /></div>;

  const isSuccess = result?.status === "SUCCESS";

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <Result
          status={isSuccess ? "success" : "error"}
          title={isSuccess ? "Thanh toán thành công (Sandbox)!" : "Thanh toán thất bại"}
          subTitle={
            isSuccess
              ? `Gói "${result.packageName}" đã được kích hoạt.`
              : `Mã lỗi: ${result.vnpayResponseCode || "Không xác định"}`
          }
          extra={[
            isSuccess && (
              <Alert
                key="success"
                message="Bạn có thể đăng sản phẩm ngay!"
                type="success"
                showIcon
                className="mb-4"
              />
            ),
            <Button type="primary" size="large" onClick={() => navigate("/seller/packages")} className="w-full">
              Quản lý gói
            </Button>,
            <Button type="link" block onClick={() => navigate("/")}>
              Về trang chủ
            </Button>,
          ]}
        />
      </Card>
    </div>
  );
}
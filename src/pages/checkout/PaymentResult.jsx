// src/features/checkout/PaymentResult.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, Result, Button, Spin } from "antd";
import { getTransactionStatus } from "../../utils/services/paymentService";

export default function PaymentResult() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // LẤY transactionCode từ URL hoặc localStorage
  const searchParams = new URLSearchParams(location.search);
  let transactionCode = searchParams.get("vnp_TxnRef");

  useEffect(() => {
    if (!transactionCode) {
      transactionCode = localStorage.getItem("pendingTransaction");
      if (!transactionCode) {
        navigate("/");
        return;
      }
    }

    const check = async () => {
      try {
        const data = await getTransactionStatus(transactionCode);
        setResult(data);
        localStorage.removeItem("pendingTransaction"); // Xóa sau khi dùng
      } catch {
        setResult({ status: "error" });
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [transactionCode, navigate]);

  if (loading) return <div className="flex justify-center items-center min-h-screen pt-20"><Spin size="large" /></div>;

  const isSuccess = result?.status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 p-6 bg-gradient-to-br from-blue-50 to-green-50">
      <Card className="max-w-md w-full shadow-2xl">
        <Result
          status={isSuccess ? "success" : "error"}
          title={isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          subTitle={isSuccess
            ? result.transaction?.type === "Car EV"
              ? "Đã đặt cọc 10%. Vui lòng đến giao dịch."
              : "Đơn hàng đang được chuẩn bị giao."
            : "Vui lòng thử lại."}
          extra={[
            isSuccess && (
              <div key="info" className="bg-gray-50 p-4 rounded-xl text-left text-sm space-y-2 mb-4">
                <div><strong>Mã GD:</strong> {result.transaction.transactionCode}</div>
                <div><strong>Số tiền:</strong> {Number(result.transaction.amount).toLocaleString("vi-VN")}đ</div>
                <div><strong>Thời gian:</strong> {new Date(result.transaction.paymentDate).toLocaleString("vi-VN")}</div>
              </div>
            ),
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(result.transaction?.type === "Car EV" ? `/checkout/deposit/${result.transaction.orderId}` : "/profile")}
              className="w-full h-12"
            >
              {isSuccess && result.transaction?.type === "Car EV" ? "Xem lịch hẹn" : "Xem đơn hàng"}
            </Button>,
            <Button type="link" block onClick={() => navigate("/")}>Về trang chủ</Button>,
          ]}
        />
      </Card>
    </div>
  );
}
// src/features/checkout/VnpayReturn.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { toast } from "sonner";
import { Card, Result, Button, Spin, Alert } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

export default function VnpayReturn() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  // Lấy params từ URL VNPay trả về
  const searchParams = new URLSearchParams(location.search);
  const vnp_TxnRef = searchParams.get("vnp_TxnRef");
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
  const vnp_Amount = searchParams.get("vnp_Amount");

  useEffect(() => {
    const processReturn = async () => {
      let transactionCode = vnp_TxnRef;

      // Trường hợp 1: VNPay trả về đầy đủ params
      if (transactionCode && vnp_ResponseCode) {
        if (vnp_ResponseCode === "00") {
          toast.success("Thanh toán thành công!");
        } else {
          toast.error("Thanh toán thất bại. Mã lỗi: " + vnp_ResponseCode);
          setResult({ status: "error", message: `Mã lỗi VNPay: ${vnp_ResponseCode}` });
          setLoading(false);
          return;
        }
      } else {
        // Trường hợp 2: Không có params → dùng pendingTransaction
        transactionCode = localStorage.getItem("pendingTransaction");
        if (!transactionCode) {
          toast.error("Không tìm thấy thông tin giao dịch");
          navigate("/");
          return;
        }
        toast.loading("Đang kiểm tra trạng thái...");
      }

      try {
        // GỌI API kiểm tra trạng thái
        const res = await api.get(`/api/payment/transaction-status/${transactionCode}`);
        const data = res.data;

        setResult({
          status: data.status || "success",
          transaction: data.transaction || {
            transactionCode,
            amount: vnp_Amount ? vnp_Amount / 100 : 0,
            paymentDate: new Date().toISOString(),
            type: data.transaction?.type || "Battery",
            orderId: data.transaction?.orderId,
          },
        });

        // XÓA pendingTransaction sau khi dùng
        localStorage.removeItem("pendingTransaction");
        toast.dismiss();
      } catch (err) {
        console.error("Lỗi kiểm tra giao dịch:", err);
        toast.error("Không thể xác nhận thanh toán");
        setResult({ status: "error" });
      } finally {
        setLoading(false);
      }
    };

    processReturn();
  }, [vnp_TxnRef, vnp_ResponseCode, vnp_Amount, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Spin size="large" tip="Đang xác nhận thanh toán với VNPay..." />
      </div>
    );
  }

  const isSuccess = result?.status === "success";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full shadow-2xl rounded-3xl">
        <Result
          status={isSuccess ? "success" : "error"}
          icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          title={isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          subTitle={
            isSuccess
              ? result.transaction?.type === "Car EV"
                ? "Đặt cọc 10% đã được ghi nhận. Vui lòng đến địa điểm giao dịch."
                : "Pin sẽ được giao trong 3-5 ngày làm việc."
              : result?.message || "Vui lòng thử lại hoặc liên hệ hỗ trợ."
          }
          extra={[
            isSuccess && result.transaction && (
              <Alert
                key="info"
                type="success"
                showIcon
                message={
                  <div className="space-y-2 text-sm">
                    <div><strong>Mã GD:</strong> {result.transaction.transactionCode}</div>
                    <div><strong>Số tiền:</strong> {Number(result.transaction.amount).toLocaleString("vi-VN")}₫</div>
                    <div><strong>Thời gian:</strong> {new Date(result.transaction.paymentDate).toLocaleString("vi-VN")}</div>
                  </div>
                }
                className="mb-6"
              />
            ),
            <Button
              key="action"
              type="primary"
              size="large"
              block
              className="h-12 text-lg font-semibold"
              onClick={() =>
                navigate(
                  isSuccess && result.transaction?.type === "Car EV"
                    ? `/checkout/deposit/${result.transaction.orderId}`
                    : `/orders`
                )
              }
            >
              {isSuccess && result.transaction?.type === "Car EV"
                ? "Xem lịch hẹn giao dịch"
                : "Xem đơn hàng"}
            </Button>,
            <Button key="home" type="link" block onClick={() => navigate("/")}>
              Về trang chủ
            </Button>,
          ]}
        />
      </Card>
    </div>
  );
}
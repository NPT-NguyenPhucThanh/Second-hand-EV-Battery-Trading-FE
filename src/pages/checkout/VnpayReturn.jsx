// src/features/checkout/VNPayReturn.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VNPayReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing | success | failed

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Lấy response code từ VNPay
        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        const transactionCode = localStorage.getItem("pendingTransaction");
        const orderId = localStorage.getItem("pendingOrderId");

        console.log("VNPay Response Code:", vnpResponseCode);

        if (vnpResponseCode === "00") {
          // ✅ Thanh toán thành công
          setStatus("success");
          toast.success("Thanh toán thành công!");

          // Xóa pending data
          localStorage.removeItem("pendingTransaction");
          localStorage.removeItem("pendingOrderId");

          // Chuyển đến trang thành công sau 2 giây
          setTimeout(() => {
           navigate(`/payment/result?vnp_TxnRef=${transactionCode}`);
          }, 2000);
        } else {
          // ❌ Thanh toán thất bại
          setStatus("failed");
          const errorMessage = getVNPayErrorMessage(vnpResponseCode);
          toast.error(errorMessage);

          setTimeout(() => {
            navigate(`/confirm-pin/${orderId}`);
          }, 3000);
        }
      } catch (error) {
        console.error("Lỗi xử lý callback:", error);
        setStatus("failed");
        toast.error("Có lỗi xảy ra khi xác nhận thanh toán");
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
        {status === "processing" && (
          <>
            <Loader2 className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Đang xử lý thanh toán...
            </h1>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600">
              Đơn hàng của bạn đã được xác nhận
              <br />
              Đang chuyển hướng...
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600 mb-6">
              Vui lòng thử lại hoặc chọn phương thức thanh toán khác
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Về trang chủ
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Helper function để hiển thị lỗi VNPay
function getVNPayErrorMessage(code) {
  const errors = {
    "07": "Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)",
    "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking",
    "10": "Thẻ/Tài khoản không đúng số lần nhập mã xác thực OTP",
    "11": "Đã hết hạn chờ thanh toán",
    "12": "Thẻ/Tài khoản bị khóa",
    "13": "Sai mật khẩu xác thực giao dịch (OTP)",
    "24": "Khách hàng hủy giao dịch",
    "51": "Tài khoản không đủ số dư",
    "65": "Tài khoản vượt quá hạn mức giao dịch",
    "75": "Ngân hàng thanh toán đang bảo trì",
    "79": "Nhập sai mật khẩu quá số lần quy định",
  };

  return errors[code] || "Giao dịch thất bại. Vui lòng thử lại";
}
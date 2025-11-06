// src/features/checkout/DepositSuccess.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createPaymentUrl } from "../../utils/services/paymentService";

export default function DepositSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState("");

  // Lấy dữ liệu từ state (được truyền từ DepositCar)
  const depositData = location.state?.depositResponse;

  useEffect(() => {
    if (!depositData) {
      toast.error("Không tìm thấy thông tin đặt cọc");
      navigate(-1);
      return;
    }

    const initiatePayment = async () => {
      try {
        const { nextStep, orderId, transactionCode } = depositData;

        if (!nextStep?.endpoint || !nextStep?.params) {
          throw new Error("Thiếu thông tin thanh toán");
        }

        // Lưu pending data để dùng sau khi VNPay trả về
        localStorage.setItem("pendingTransaction", transactionCode);
        localStorage.setItem("pendingOrderId", orderId);

        // Gọi API tạo URL thanh toán
        const paymentResponse = await createPaymentUrl(
          orderId,
          nextStep.params.transactionType
        );

        if (paymentResponse.paymentUrl) {
          setPaymentUrl(paymentResponse.paymentUrl);
          toast.success("Đang chuyển hướng đến cổng thanh toán...");

          // Redirect sang VNPay sau 2s
          setTimeout(() => {
            window.location.href = paymentResponse.paymentUrl;
          }, 2000);
        } else {
          throw new Error("Không nhận được URL thanh toán");
        }
      } catch (error) {
        console.error("Lỗi khởi tạo thanh toán:", error);
        toast.error("Không thể khởi tạo thanh toán. Vui lòng thử lại.");
        setLoading(false);
      }
    };

    initiatePayment();
  }, [depositData, navigate]);

  if (!depositData) return null;

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-2xl w-full">
        {loading ? (
          <>
            <Loader2 className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Đang xử lý đặt cọc...
            </h1>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Đặt cọc thành công!
            </h1>
            <p className="text-lg text-green-600 font-medium mb-6">
              {depositData.message}
            </p>

            <div className="bg-gray-50 p-6 rounded-xl text-left text-sm space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Mã đơn hàng:</span>
                <span className="text-blue-600">#{depositData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Địa điểm:</span>
                <span>{depositData.transactionLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Thời gian hẹn:</span>
                <span>{formatDate(depositData.appointmentDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Chuyển quyền:</span>
                <span>{depositData.transferOwnership ? "Có" : "Không"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Đổi biển số:</span>
                <span>{depositData.changePlate ? "Có" : "Không"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.open(paymentUrl, "_blank")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Mở cổng thanh toán (nếu không tự chuyển)
              </button>
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
// src/pages/checkout/DepositSuccess.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createPaymentUrl } from "../../utils/services/paymentService"; // Đảm bảo import hàm này

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
      navigate(-1); // Quay lại trang trước
      return;
    }

    const initiatePayment = async () => {
      try {
        // === SỬA LỖI BẮT ĐẦU ===

        // 1. Lấy nextStep từ depositData
        const { nextStep } = depositData;

        if (!nextStep?.params?.orderId || !nextStep?.params?.transactionType) {
          throw new Error("Thiếu thông tin thanh toán (nextStep params)");
        }
        
        // 2. Lấy orderId và transactionType từ BÊN TRONG nextStep.params
        const orderId = nextStep.params.orderId;
        const transactionType = nextStep.params.transactionType;

        // 3. Gọi API tạo URL thanh toán (VỚI orderId ĐÚNG)
        const paymentResponse = await createPaymentUrl(
          orderId,
          transactionType
        );
        
        // 4. paymentResponse SẼ TRẢ VỀ transactionCode
        const { paymentUrl, transactionCode } = paymentResponse;

        if (!paymentUrl || !transactionCode) {
          throw new Error("Không nhận được URL thanh toán hoặc Mã giao dịch từ server");
        }

        // 5. Lưu pending data (LẤY TỪ paymentResponse)
        localStorage.setItem("pendingTransaction", transactionCode);
        localStorage.setItem("pendingOrderId", orderId);

        // === KẾT THÚC SỬA LỖI ===

        setPaymentUrl(paymentUrl);
        toast.success("Đang chuyển hướng đến cổng thanh toán...");

        // Redirect sang VNPay sau 2s
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 2000);
        
      } catch (error) {
        console.error("Lỗi khởi tạo thanh toán:", error);
        toast.error(error.message || "Không thể khởi tạo thanh toán. Vui lòng thử lại.");
        setLoading(false); // Dừng loading để hiển thị lỗi (nếu có)
      }
    };

    initiatePayment();
  }, [depositData, navigate]);

  if (!depositData) return null;

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
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
          // Phần này hiển thị nếu API createPaymentUrl thất bại
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
                <span className="font-medium">Địa điểm:</span>
                <span>{depositData.transactionLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Thời gian hẹn:</span>
                <span>{formatDate(depositData.appointmentDate)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {paymentUrl && (
                <button
                  onClick={() => window.open(paymentUrl, "_blank")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Mở cổng thanh toán (nếu không tự chuyển)
                </button>
              )}
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
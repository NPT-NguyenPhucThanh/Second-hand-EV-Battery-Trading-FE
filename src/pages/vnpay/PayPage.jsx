import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import api from "../../utils/api"; 
import { toast } from "sonner";

export default function PayPage() {
  const { orderId } = useParams();
  const navigate = useNavigate(); 

  useEffect(() => {
    const createFinalPayment = async () => {
      if (!orderId) {
        toast.error("Không tìm thấy mã đơn hàng.");
        navigate("/");
        return;
      }

      const toastId = toast.loading("Đang chuẩn bị thanh toán 90%...");

      try {
        const finalPaymentParams = {
          transferOwnership: false,
          changePlate: false,
        };
        const resStep1 = await api.post(
          `api/buyer/orders/${orderId}/final-payment`,
          null, 
          finalPaymentParams 
        );

        if (resStep1.status !== "success" || !resStep1.nextStep) {
          throw new Error(resStep1.message || "Bước 1: Không thể khởi tạo thanh toán cuối.");
        }

        toast.loading("Đã xác nhận, đang tạo link VNPay...", { id: toastId });

        const nextStepParams = resStep1.nextStep.params;
        
        if (!nextStepParams || nextStepParams.transactionType !== "FINAL_PAYMENT") {
             throw new Error("Lỗi cấu hình nextStep từ backend.");
        }

        const resStep2 = await api.post(
          "api/payment/create-payment-url",
          null, 
          nextStepParams 
        );

        if (resStep2.status !== "success" || !resStep2.paymentUrl) {
          throw new Error(resStep2.message || "Bước 2: Không thể tạo link thanh toán VNPay.");
        }

        localStorage.setItem("pendingTransaction", resStep2.transactionCode);
        localStorage.setItem("pendingOrderId", orderId);

        toast.success(`Đang chuyển hướng... Hết hạn sau ${resStep2.expiryMinutes || 'N/A'} phút!`, { id: toastId });

        window.location.href = resStep2.paymentUrl;

      } catch (err) {
        console.error("Lỗi khi tạo thanh toán cuối:", err);
        toast.error(err.message || "Lỗi! Vui lòng thử lại.", { id: toastId });
        navigate("/profile"); 
      }
    };

    createFinalPayment();
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-16 w-16 border-8 border-blue-500 rounded-full border-t-transparent mx-auto mb-6"></div>
        <h2 className="text-3xl font-bold text-blue-700">Đang chuyển đến VNPAY...</h2>
        <p className="text-gray-600 mt-4">Vui lòng không tắt trình duyệt</p>
      </div>
    </div>
  );
}
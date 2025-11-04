// src/features/home/components/PayPage.jsx
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import api from "../../utils/api";
import { toast } from "sonner";

export default function PayPage() {
  const { orderId } = useParams();

  useEffect(() => {
  const createPayment = async () => {
    try {
      toast.loading("Chuẩn bị thanh toán PIN...", { id: "pay" });
      const res = await api.post("api/payment/create-payment-url", {
        orderId: parseInt(orderId),
        transactionType: "FINAL_PAYMENT"
      });

      if (res.status === "success") {
        toast.dismiss("pay");
        toast.success(`Hết hạn sau ${res.expiryMinutes} phút!`);
        window.location.href = res.paymentUrl;
      }
    } catch (err) {
      toast.error("Lỗi! Vui lòng thử lại.");
    }
  };
  createPayment();
}, [orderId]);

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
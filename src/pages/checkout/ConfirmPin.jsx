// src/features/checkout/ConfirmPin.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../utils/api";
import { toast } from "sonner";
import { Package, CreditCard, AlertCircle } from "lucide-react";

export default function ConfirmPin() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!orderId) {
      toast.error("Thiếu mã đơn hàng");
      return;
    }

    setLoading(true);
  
    try {
      //  Gọi API tạo payment URL
      const response = await api.post("api/payment/create-payment-url", {
        orderId: Number(orderId),
        transactionType: "FINAL_PAYMENT",
      });
      
      console.log("Payment response:", response);
      
      //  Destructure response
      const { paymentUrl, transactionCode, status, message } = response;

      //  Kiểm tra status và paymentUrl
      if (status !== "success" || !paymentUrl) {
        throw new Error(message || "Không nhận được URL thanh toán");
      }
      //  Lưu transactionCode để xử lý callback từ VNPay
      localStorage.setItem("pendingTransaction", transactionCode);
      localStorage.setItem("pendingOrderId", orderId);

      //  Hiển thị thông báo
      toast.success("Đang chuyển đến VNPay...", {
        duration: 2000,
      });

      //  Đợi 1 giây rồi redirect (cho user kịp đọc thông báo)
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 1000);
      
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      toast.error(
        err.message || "Không thể tạo thanh toán. Vui lòng thử lại."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
          <Package className="w-20 h-20 text-blue-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Thanh toán 100% – Pin
          </h1>
          <p className="text-gray-600 mb-8">
            Mã đơn: <strong>#{orderId}</strong>
            <br />
            <span className="text-sm">
              Sau thanh toán, pin sẽ được giao trong 3-5 ngày
            </span>
          </p>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-12 py-5 rounded-xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-8 h-8" />
            {loading ? "Đang xử lý..." : "Thanh toán qua VNPay"}
          </button>

          <button
            onClick={() => navigate("/")}
            disabled={loading}
            className="mt-6 text-blue-600 hover:text-green-500 font-medium disabled:opacity-50"
          >
            ← Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
// src/features/checkout/CheckoutSuccess.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

export default function CheckoutSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem(`order_${orderId}`);
    if (!raw) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return navigate("/");
    }

    const { type } = JSON.parse(raw);

    // Xe điện: Đặt cọc 10% → Form → VNPay
    if (type === "Car EV") {
      navigate(`/checkout/deposit/${orderId}`, { replace: true });
    }
    // Pin: Thanh toán 100% → VNPay → Chờ ship
    else if (type === "Battery") {
      navigate(`/checkout/confirm-pin/${orderId}`, { replace: true });
    } else {
      toast.error("Loại sản phẩm không hỗ trợ");
      navigate("/");
    }
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto"></div>
        <p className="text-2xl font-bold mt-6 text-green-600">
          Đang chuyển hướng...
        </p>
      </div>
    </div>
  );
}

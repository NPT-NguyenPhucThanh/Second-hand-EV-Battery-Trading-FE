// src/features/checkout/ConfirmPin.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../utils/api";
import { toast } from "sonner";
import { Package, CheckCircle } from "lucide-react";

export default function ConfirmPin() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post(`/api/buyer/orders/${orderId}/confirm-receipt`);
      toast.success("Đã xác nhận nhận hàng thành công!");
      navigate("/orders");
    } catch (err) {
      toast.error("Lỗi xác nhận. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
          <Package className="w-20 h-20 text-blue-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Bạn đã nhận được Pin?
          </h1>
          <p className="text-gray-600 mb-8">
            Mã đơn hàng: <span className="font-bold text-blue-600">#{orderId}</span>
            <br />
            <span className="text-sm">Hệ thống sẽ tự động xác nhận sau 3 ngày</span>
          </p>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-12 py-5 rounded-xl font-bold text-xl hover:shadow-2xl transform hover:scale-110 transition flex items-center gap-3 mx-auto"
          >
            <CheckCircle className="w-8 h-8" />
            {loading ? "Đang xác nhận..." : "Đã nhận hàng – Hoàn tất"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="mt-6 text-blue-600 hover:text-green-500 font-medium"
          >
            ← Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
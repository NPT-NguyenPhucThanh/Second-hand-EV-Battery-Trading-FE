// src/features/checkout/DepositCar.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../utils/api";
import { toast } from "sonner";
import { MapPin, Calendar, Car, CreditCard } from "lucide-react";

export default function DepositCar() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    transactionLocation: "",
    appointmentDate: "",
    transferOwnership: false,
    changePlate: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.transactionLocation || !form.appointmentDate) {
    toast.error("Vui lòng điền đầy đủ thông tin");
    return;
  }

  setLoading(true);

  try {
    // BƯỚC 1: Lưu thông tin đặt cọc
    const depositRes = await api.post(
      `api/buyer/orders/${orderId}/deposit`,
      null,
      {
        params: {
          transactionLocation: form.transactionLocation,
          appointmentDate: form.appointmentDate,
          transferOwnership: form.transferOwnership,
          changePlate: form.changePlate,
        },
      }
    );

    // Kiểm tra response có nextStep không
    const nextStep = depositRes.data.nextStep;
    if (!nextStep || nextStep.endpoint !== "api/payment/create-payment-url") {
      throw new Error("Không có hướng dẫn thanh toán");
    }

    // BƯỚC 2: Gọi API tạo URL VNPay
    const paymentRes = await api.post(
      nextStep.endpoint,
      null,
      {
        params: nextStep.params, // { orderId, transactionType }
      }
    );

    const paymentUrl = paymentRes.data.paymentUrl;
    if (!paymentUrl) {
      throw new Error("Không nhận được URL thanh toán");
    }

    // Redirect sang VNPay
    window.location.href = paymentUrl;

  } catch (err) {
    console.error(err);
    toast.error(
      err.response?.data?.message || 
      err.message || 
      "Lỗi xử lý đặt cọc"
    );
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Car className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Đặt cọc 10% – Xe điện
            </h1>
            <p className="text-gray-600 mt-2">Mã đơn: #{orderId}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <MapPin className="w-5 h-5" />
                Địa điểm giao dịch
              </label>
              <input
                type="text"
                required
                placeholder="VD: 123 Lê Lợi, Q.1, TP.HCM"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
                value={form.transactionLocation}
                onChange={(e) => setForm({ ...form, transactionLocation: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Calendar className="w-5 h-5" />
                Thời gian hẹn (gặp mặt xem xe)
              </label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
                value={form.appointmentDate}
                onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-green-600 rounded"
                  checked={form.transferOwnership}
                  onChange={(e) => setForm({ ...form, transferOwnership: e.target.checked })}
                />
                <span>Sang tên xe</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-green-600 rounded"
                  checked={form.changePlate}
                  onChange={(e) => setForm({ ...form, changePlate: e.target.checked })}
                />
                <span>Đổi biển số</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl transform hover:scale-105 transition disabled:opacity-70"
            >
              <CreditCard className="w-6 h-6" />
              {loading ? "Đang chuyển sang VNPay..." : "Thanh toán 10% qua VNPay"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Sau khi thanh toán, bạn sẽ nhận biên lai và lịch hẹn giao dịch.
          </div>
        </div>
      </div>
    </div>
  );
}
// src/features/home/components/Deposit.jsx
// Trang đặt cọc 10% cho đơn hàng
// Không kiểm tra auth → giả định người dùng đã đăng nhập khi đến được trang này

import { useParams } from "react-router-dom";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import api from "../../utils/api";
import { ShieldCheck, Calendar, MapPin, FileText } from "lucide-react";

export default function Deposit() {
  const { orderId } = useParams();
  const [transactionLocation, setTransactionLocation] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [transferOwnership, setTransferOwnership] = useState(false);
  const [changePlate, setChangePlate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!transactionLocation || !appointmentDate) {
        toast.error("Vui lòng nhập đầy đủ thông tin.");
        return;
      }

      // Gọi API đặt cọc với query params
      const response = await api.post(
        `/api/buyer/orders/${orderId}/deposit?transactionLocation=${encodeURIComponent(transactionLocation)}&appointmentDate=${encodeURIComponent(appointmentDate)}&transferOwnership=${transferOwnership}&changePlate=${changePlate}`,
        {}
      );

      if (response.status === 200) {
        toast.success("Thông tin đặt cọc đã lưu thành công!");

        // Redirect sang VNPay nếu có paymentUrl
        const paymentUrl = response.data.paymentUrl || response.data.additionalProp1?.paymentUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          toast.error("Không tìm thấy URL thanh toán.");
        }
      }
    } catch (error) {
      console.error("Error in deposit:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi đặt cọc.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12">
      <Toaster />
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
            Đặt cọc 10% cho đơn hàng
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Địa điểm giao dịch */}
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <input
                type="text"
                placeholder="Địa điểm giao dịch"
                value={transactionLocation}
                onChange={(e) => setTransactionLocation(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                required
              />
            </div>

            {/* Thời gian hẹn */}
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <input
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                required
              />
            </div>

            {/* Sang tên xe */}
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-600" />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={transferOwnership}
                  onChange={(e) => setTransferOwnership(e.target.checked)}
                  className="w-5 h-5"
                />
                Sang tên xe
              </label>
            </div>

            {/* Đổi biển số */}
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={changePlate}
                  onChange={(e) => setChangePlate(e.target.checked)}
                  className="w-5 h-5"
                />
                Đổi biển số
              </label>
            </div>

            {/* Nút submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt cọc và thanh toán"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
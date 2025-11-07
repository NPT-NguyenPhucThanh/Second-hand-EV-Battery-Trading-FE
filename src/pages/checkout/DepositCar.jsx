// src/features/checkout/DepositCar.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../utils/api";
import { toast } from "sonner";
import { Calendar, MapPin, Car, CreditCard } from "lucide-react";

export default function DepositCar() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    transactionLocation: "",
    appointmentDate: "",
    transferOwnership: false,
    changePlate: true,
  });

  // ✅ Helper: Convert datetime-local to backend format
  const formatDateTimeForBackend = (datetimeLocal) => {
    if (!datetimeLocal) return "";

    // Input: "2025-11-12T15:00"
    // Output: "2025-11-12 15:00:00"
    const date = new Date(datetimeLocal);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = "00";

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.transactionLocation || !formData.appointmentDate) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!orderId) {
      toast.error("Thiếu mã đơn hàng");
      return;
    }

    setLoading(true);

    try {
      // --- BƯỚC 1: LƯU THÔNG TIN ĐẶT CỌC (Như file cũ) ---
      const formattedDate = formatDateTimeForBackend(formData.appointmentDate);

      const depositData = {
        transactionLocation: formData.transactionLocation,
        appointmentDate: formattedDate,
        transferOwnership: formData.transferOwnership,
        changePlate: formData.changePlate,
      };

      // ✅ SỬA LỖI: 'depositData' phải là tham số thứ 2 (body)
      await api.post(
        `api/buyer/orders/${orderId}/deposit`,
        null, // data (body) là null
        depositData // params (query string) là depositData
      );

      toast.success("Thông tin đã được lưu! Đang tạo thanh toán...");

      // --- BƯỚC 2: TẠO VÀ CHUYỂN HƯỚNG THANH TOÁN (Logic từ ConfirmPin.jsx) ---
      const params = new URLSearchParams({
        orderId: Number(orderId),
        // ✅ THAY ĐỔI: Sử dụng loại giao dịch cho đặt cọc
        transactionType: "DEPOSIT",
      });
      const pathWithParams = `api/payment/create-payment-url?${params.toString()}`;

      const res = await api.post(pathWithParams, null);
      const { paymentUrl, transactionCode, message } = res;

      if (!paymentUrl) {
        throw new Error(message || "Không nhận được URL thanh toán");
      }
      localStorage.setItem("pendingTransaction", transactionCode);

      toast.success("Đang chuyển đến VNPay...");
      window.location.href = paymentUrl;

      // Không cần 'navigate' nữa vì đã chuyển trang bằng 'window.location.href'
    } catch (err) {
      console.error("Lỗi đặt cọc hoặc tạo thanh toán:", err);
      toast.error(err.message || "Không thể xử lý. Vui lòng thử lại.");
      setLoading(false); // Rất quan trọng: reset loading khi có lỗi
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <Car className="w-20 h-20 text-blue-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Đặt cọc xe
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Mã đơn: <strong>#{orderId}</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Địa điểm giao dịch */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <MapPin className="w-5 h-5" />
                Địa điểm giao dịch
              </label>
              <input
                type="text"
                value={formData.transactionLocation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transactionLocation: e.target.value,
                  })
                }
                placeholder="Nhập địa chỉ giao dịch"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Ngày hẹn */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Calendar className="w-5 h-5" />
                Ngày hẹn giao dịch
              </label>
              <input
                type="datetime-local"
                value={formData.appointmentDate}
                onChange={(e) =>
                  setFormData({ ...formData, appointmentDate: e.target.value })
                }
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Chuyển quyền sở hữu */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="transferOwnership"
                checked={formData.transferOwnership}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transferOwnership: e.target.checked,
                  })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="transferOwnership" className="text-gray-700">
                Chuyển quyền sở hữu xe
              </label>
            </div>

            {/* Đổi biển số */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="changePlate"
                checked={formData.changePlate}
                onChange={(e) =>
                  setFormData({ ...formData, changePlate: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="changePlate" className="text-gray-700">
                Đổi biển số xe
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate(-1)} // Dùng navigate(-1) để quay lại trang trước
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {loading ? "Đang xử lý..." : "Xác nhận & Thanh toán cọc"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

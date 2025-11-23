import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../utils/api";
import { toast } from "sonner";
import { Calendar, MapPin, Car, CreditCard } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import AuroraText from "../../components/common/AuroraText";

export default function DepositCar() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);

  // Địa điểm cố định
  const FIXED_LOCATION =
    "Lô E2a-7, Đường D1 Khu Công nghệ cao, P.Long Thạnh Mỹ, TP Thủ Đức, TP.HCM";

  const [formData, setFormData] = useState({
    transactionLocation: FIXED_LOCATION,
    appointmentDate: "",
    transferOwnership: true, // mặc định có
    changePlate: true, // mặc định có
  });

  //Convert datetime-local to backend format
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

      // SỬA LỖI: 'depositData' phải là tham số thứ 2 (body)
      await api.post(
        `api/buyer/orders/${orderId}/deposit`,
        null, // data (body) là null
        depositData // params (query string) là depositData
      );

      toast.success("Thông tin đã được lưu! Đang tạo thanh toán...");

      // --- BƯỚC 2: TẠO VÀ CHUYỂN HƯỚNG THANH TOÁN (Logic từ ConfirmPin.jsx) ---
      const params = new URLSearchParams({
        orderId: Number(orderId),
        // THAY ĐỔI: Sử dụng loại giao dịch cho đặt cọc
        transactionType: "DEPOSIT",
      });
      const pathWithParams = `api/payment/create-payment-url?${params.toString()}`;

      const res = await api.post(pathWithParams, null);
      const { paymentUrl, transactionCode, message } = res;

      if (!paymentUrl) {
        throw new Error(message || "Không nhận được URL thanh toán");
      }
      localStorage.setItem("pendingTransaction", transactionCode);

      // toast.success("Đang chuyển đến VNPay...");
      window.location.href = paymentUrl;

      // Không cần 'navigate' nữa vì đã chuyển trang bằng 'window.location.href'
    } catch (err) {
      console.error("Lỗi đặt cọc hoặc tạo thanh toán:", err);
      toast.error(err.message || "Không thể xử lý. Vui lòng thử lại.");
      setLoading(false); // Rất quan trọng: reset loading khi có lỗi
    }
  };

  return (
    <div
      className={`min-h-screen py-12 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-green-50 to-blue-50"
      }`}
    >
      {/* Floating gradient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-float [animation-delay:2s]" />
      </div>

      <div className="container mx-auto px-4 max-w-2xl relative">
        <div
          className={`rounded-3xl shadow-2xl p-10 backdrop-blur-xl border ${
            isDark
              ? "bg-gray-800/90 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <Car
            className={`w-20 h-20 mx-auto mb-6 ${
              isDark ? "text-blue-400" : "text-blue-500"
            }`}
          />

          <div className="text-center mb-8">
            <AuroraText text="Đặt cọc xe" className="text-3xl font-bold mb-4" />
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Mã đơn:{" "}
              <strong className={isDark ? "text-white" : "text-gray-900"}>
                #{orderId}
              </strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Địa điểm giao dịch - CỐ ĐỊNH, KHÔNG CHO SỬA */}
            <div>
              <label
                className={`flex items-center gap-2 font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <MapPin className="w-5 h-5" />
                Địa điểm giao dịch
              </label>
              <div
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-gray-300"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                {FIXED_LOCATION}
              </div>
            </div>

            {/* Ngày hẹn */}
            <div>
              <label
                className={`flex items-center gap-2 font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
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
                className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } border`}
                required
              />
            </div>

            {/* Chuyển quyền sở hữu - MẶC ĐỊNH CÓ, KHÔNG CHO THAY ĐỔI */}
            <div
              className={`flex items-center gap-3 p-4 rounded-xl ${
                isDark ? "bg-gray-900/30" : "bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={true}
                disabled
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label
                className={`cursor-not-allowed ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Chuyển quyền sở hữu xe
              </label>
            </div>

            {/* Đổi biển số - MẶC ĐỊNH CÓ, KHÔNG CHO THAY ĐỔI */}
            <div
              className={`flex items-center gap-3 p-4 rounded-xl ${
                isDark ? "bg-gray-900/30" : "bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={true}
                disabled
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label
                className={`cursor-not-allowed ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Đổi biển số xe
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                    : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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

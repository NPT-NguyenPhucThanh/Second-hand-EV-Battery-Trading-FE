import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../utils/api";
import { useTheme } from "../../contexts/ThemeContext";
import { CheckCircle, XCircle, Loader2, Home, ShoppingBag } from "lucide-react";
import AuroraText from "../../components/common/AuroraText";

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      // 1. Lấy tất cả các tham số từ URL
      const params = Object.fromEntries(searchParams.entries());

      // 2. Tạo chuỗi query string
      const queryString = new URLSearchParams(params).toString();

      try {
        // 3. Gọi API về Backend (chính là endpoint /api/payment/vnpay-return)
        // Dùng `api.get` từ file `api.js` của bạn
        const response = await api.get(
          `api/payment/vnpay-return?${queryString}`
        );

        if (response.status === "success") {
          setPaymentData(response);
        } else {
          setError(response.message || "Thanh toán không thành công.");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối đến máy chủ để xác thực.");
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center ${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50"
        }`}
      >
        {/* Floating gradient orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-float [animation-delay:2s]" />
        </div>

        <div className="relative">
          <Loader2
            className={`w-16 h-16 animate-spin ${
              isDark ? "text-blue-400" : "text-blue-500"
            }`}
          />
        </div>
        <p
          className={`mt-6 text-lg font-semibold ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Đang xác thực thanh toán, vui lòng chờ...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center px-4 ${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-red-50 via-pink-50 to-red-50"
        }`}
      >
        {/* Floating gradient orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full blur-3xl animate-float [animation-delay:2s]" />
        </div>

        <div
          className={`max-w-2xl w-full rounded-3xl shadow-2xl p-10 backdrop-blur-xl border text-center ${
            isDark
              ? "bg-gray-800/90 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="flex justify-center mb-6">
            <div
              className={`p-6 rounded-full ${
                isDark ? "bg-red-500/20" : "bg-red-100"
              }`}
            >
              <XCircle
                className={`w-20 h-20 ${
                  isDark ? "text-red-400" : "text-red-500"
                }`}
              />
            </div>
          </div>

          <AuroraText
            text="Thanh toán Thất bại"
            className="text-3xl font-bold mb-4"
          />

          <p
            className={`text-lg mb-8 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {error}
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              <Home className="w-5 h-5" />
              Quay về trang chủ
            </Link>
            <Link
              to="/cart"
              className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Thử lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentData) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center px-4 ${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-green-50 via-emerald-50 to-green-50"
        }`}
      >
        {/* Floating gradient orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full blur-3xl animate-float [animation-delay:2s]" />
        </div>

        <div
          className={`max-w-2xl w-full rounded-3xl shadow-2xl p-10 backdrop-blur-xl border text-center animate-scale-in ${
            isDark
              ? "bg-gray-800/90 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="flex justify-center mb-6">
            <div
              className={`p-6 rounded-full ${
                isDark ? "bg-green-500/20" : "bg-green-100"
              } animate-pulse`}
            >
              <CheckCircle
                className={`w-20 h-20 ${
                  isDark ? "text-green-400" : "text-green-500"
                }`}
              />
            </div>
          </div>

          <AuroraText
            text="Thanh toán Thành công!"
            className="text-3xl font-bold mb-4"
          />

          <div
            className={`text-lg mb-8 space-y-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <p>
              Đơn hàng{" "}
              <strong className={isDark ? "text-white" : "text-gray-900"}>
                #{paymentData.orderId}
              </strong>{" "}
              đã được thanh toán thành công.
            </p>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              {Number(paymentData.amount).toLocaleString("vi-VN")} ₫
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Tiếp tục mua sắm
            </Link>
            <Link
              to="/profile"
              className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Xem lịch sử đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

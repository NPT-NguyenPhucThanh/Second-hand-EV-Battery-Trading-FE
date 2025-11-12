import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useTheme } from "../../contexts/ThemeContext";
import {
  ShoppingBag,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  CreditCard,
  Eye,
  Sparkles,
  PackageCheck,
} from "lucide-react";
import AuroraText from "../../components/common/AuroraText";

const currency = (value) => {
  if (value === null || value === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const OrderStatusTag = ({ status, isDark }) => {
  const statusConfig = {
    DA_DUYET: {
      text: "Đã duyệt",
      icon: CheckCircle,
      gradient: isDark
        ? "linear-gradient(135deg, #10b981, #059669)"
        : "linear-gradient(135deg, #34d399, #10b981)",
      textColor: "#ffffff",
    },
    DA_HOAN_TAT: {
      text: "Hoàn tất",
      icon: CheckCircle,
      gradient: isDark
        ? "linear-gradient(135deg, #3b82f6, #2563eb)"
        : "linear-gradient(135deg, #60a5fa, #3b82f6)",
      textColor: "#ffffff",
    },
    DA_THANH_TOAN: {
      text: "Đã thanh toán",
      icon: CheckCircle,
      gradient: isDark
        ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
        : "linear-gradient(135deg, #a78bfa, #8b5cf6)",
      textColor: "#ffffff",
    },
    DA_GIAO: {
      text: "Đang giao hàng",
      icon: Clock,
      gradient: isDark
        ? "linear-gradient(135deg, #06b6d4, #0891b2)"
        : "linear-gradient(135deg, #22d3ee, #06b6d4)",
      textColor: "#ffffff",
    },
    CHO_DUYET: {
      text: "Chờ duyệt",
      icon: Clock,
      gradient: isDark
        ? "linear-gradient(135deg, #f59e0b, #d97706)"
        : "linear-gradient(135deg, #fbbf24, #f59e0b)",
      textColor: "#ffffff",
    },
    CHO_DAT_COC: {
      text: "Chờ đặt cọc",
      icon: Clock,
      gradient: isDark
        ? "linear-gradient(135deg, #f59e0b, #d97706)"
        : "linear-gradient(135deg, #fbbf24, #f59e0b)",
      textColor: "#ffffff",
    },
    BI_TU_CHOI: {
      text: "Bị từ chối",
      icon: XCircle,
      gradient: isDark
        ? "linear-gradient(135deg, #ef4444, #dc2626)"
        : "linear-gradient(135deg, #f87171, #ef4444)",
      textColor: "#ffffff",
    },
    DA_HUY: {
      text: "Đã hủy",
      icon: XCircle,
      gradient: isDark
        ? "linear-gradient(135deg, #6b7280, #4b5563)"
        : "linear-gradient(135deg, #9ca3af, #6b7280)",
      textColor: "#ffffff",
    },
    THAT_BAI: {
      text: "Thất bại",
      icon: XCircle,
      gradient: isDark
        ? "linear-gradient(135deg, #ef4444, #dc2626)"
        : "linear-gradient(135deg, #f87171, #ef4444)",
      textColor: "#ffffff",
    },
    TRANH_CHAP: {
      text: "Tranh chấp",
      icon: AlertTriangle,
      gradient: isDark
        ? "linear-gradient(135deg, #f97316, #ea580c)"
        : "linear-gradient(135deg, #fb923c, #f97316)",
      textColor: "#ffffff",
    },
  };

  const config = statusConfig[status] || {
    text: status,
    icon: Clock,
    gradient: isDark
      ? "linear-gradient(135deg, #6b7280, #4b5563)"
      : "linear-gradient(135deg, #9ca3af, #6b7280)",
    textColor: "#ffffff",
  };

  const Icon = config.icon;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold text-sm shadow-md"
      style={{
        background: config.gradient,
        color: config.textColor,
      }}
    >
      <Icon className="w-4 h-4" />
      {config.text}
    </div>
  );
};

export default function OrderHistoryContent() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme colors for aurora gradients
  const colors = {
    aurora: isDark
      ? ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"]
      : ["#3b82f6", "#8b5cf6", "#06b6d4", "#3b82f6"],
    primary: isDark ? ["#ef4444", "#f97316"] : ["#3b82f6", "#8b5cf6"],
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await api.get("api/buyer/orders");
        if (response.status === "success") {
          const sortedOrders = (response.orders || []).sort(
            (a, b) => new Date(b.createdat) - new Date(a.createdat)
          );
          setOrders(sortedOrders);
        } else {
          setError(response.message || "Không thể tải đơn hàng.");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleFinalPayment = (orderId) => {
    navigate(`/checkout/final-payment/${orderId}`);
  };

  const handleDepositAgain = (orderId) => {
    navigate(`/checkout/deposit/${orderId}`);
  };

  // MỚI: Xem chi tiết giao dịch
  const handleViewTransactions = (orderId) => {
    navigate(`/profile/orders/${orderId}/transactions`);
  };

  // Xác nhận đã nhận hàng
  const handleConfirmDelivery = async (orderId) => {
    if (
      !window.confirm(
        "Xác nhận bạn đã nhận hàng? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      const response = await api.post(
        `api/buyer/orders/${orderId}/confirm-delivery`
      );
      if (response.status === "success") {
        alert(
          "Đã xác nhận nhận hàng thành công! Escrow sẽ được giải phóng sau 7 ngày nếu không có khiếu nại."
        );
        // Refresh orders
        const ordersResponse = await api.get("api/buyer/orders");
        if (ordersResponse.status === "success") {
          const sortedOrders = (ordersResponse.orders || []).sort(
            (a, b) => new Date(b.createdat) - new Date(a.createdat)
          );
          setOrders(sortedOrders);
        }
      } else {
        alert("Lỗi: " + (response.message || "Không thể xác nhận nhận hàng"));
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  return (
    <div className="relative">
      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div
          key={`order-orb-1-${isDark}`}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, #ef4444 0%, transparent 70%)"
              : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          }}
        />
        <div
          key={`order-orb-2-${isDark}`}
          className="absolute top-1/2 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, #f97316 0%, transparent 70%)"
              : "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            animationDelay: "1s",
          }}
        />
      </div>

      {/* Header */}
      <div className="mb-8 relative z-10">
        <AuroraText
          key={`order-title-${isDark}`}
          text="Lịch Sử Đơn Hàng"
          colors={colors.aurora}
          speed={3}
          className="text-3xl font-black"
        />
      </div>

      {loading ? (
        <div
          className="text-center py-16 rounded-3xl relative z-10"
          style={{
            background: isDark
              ? "rgba(17, 24, 39, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            border: isDark
              ? "1px solid rgba(239, 68, 68, 0.2)"
              : "1px solid rgba(251, 146, 60, 0.2)",
          }}
        >
          <div
            className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mb-4"
            style={{
              borderColor: isDark
                ? "rgba(239, 68, 68, 0.3)"
                : "rgba(59, 130, 246, 0.3)",
              borderTopColor: "transparent",
            }}
          />
          <p
            className={`text-lg font-medium ${
              isDark ? "text-gray-200" : "text-gray-600"
            }`}
          >
            Đang tải đơn hàng...
          </p>
        </div>
      ) : error ? (
        <div
          className="text-center py-16 rounded-3xl relative z-10"
          style={{
            background: isDark
              ? "rgba(17, 24, 39, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            border: isDark
              ? "1px solid rgba(239, 68, 68, 0.2)"
              : "1px solid rgba(251, 146, 60, 0.2)",
          }}
        >
          <XCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "#ef4444" }}
          />
          <p
            className={`text-lg ${isDark ? "text-gray-200" : "text-gray-700"}`}
          >
            Lỗi: {error}
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div
          className="text-center py-16 rounded-3xl relative z-10"
          style={{
            background: isDark
              ? "rgba(17, 24, 39, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            border: isDark
              ? "1px solid rgba(239, 68, 68, 0.2)"
              : "1px solid rgba(251, 146, 60, 0.2)",
          }}
        >
          <ShoppingBag
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          />
          <p
            className={`text-lg ${isDark ? "text-gray-200" : "text-gray-700"}`}
          >
            Bạn chưa có đơn hàng nào.
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {orders.map((order, index) => {
            const orderNumber = orders.length - index;
            return (
              <div
                key={order.orderid}
                className="rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                style={{
                  background: isDark
                    ? "rgba(17, 24, 39, 0.8)"
                    : "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(20px)",
                  border: isDark
                    ? "1px solid rgba(239, 68, 68, 0.2)"
                    : "1px solid rgba(251, 146, 60, 0.2)",
                }}
                onClick={() => handleViewTransactions(order.orderid)}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Left Side - Order Info */}
                  <div className="flex-1 space-y-3">
                    {/* Order Number with Icon */}
                    <div className="flex items-center gap-2">
                      <ShoppingBag
                        className="w-5 h-5"
                        style={{ color: isDark ? "#ef4444" : "#3b82f6" }}
                      />
                      <AuroraText
                        key={`order-${order.orderid}-${isDark}`}
                        text={`Đơn hàng #${orderNumber}`}
                        colors={colors.aurora}
                        speed={2}
                        className="text-xl font-bold"
                      />
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <Calendar
                        className="w-4 h-4"
                        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                      />
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {new Date(order.createdat).toLocaleDateString("vi-VN")}
                      </p>
                    </div>

                    {/* Total Amount */}
                    <div className="flex items-center gap-2">
                      <DollarSign
                        className="w-4 h-4"
                        style={{ color: isDark ? "#10b981" : "#059669" }}
                      />
                      <p
                        className={`text-lg font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {currency(order.totalfinal)}
                      </p>
                    </div>
                  </div>

                  {/* Right Side - Status & Actions */}
                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <OrderStatusTag status={order.status} isDark={isDark} />

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap justify-end w-full">
                      {order.status === "DA_DUYET" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFinalPayment(order.orderid);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-105 shadow-md"
                          style={{
                            background: isDark
                              ? "linear-gradient(135deg, #10b981, #059669)"
                              : "linear-gradient(135deg, #34d399, #10b981)",
                          }}
                        >
                          <CreditCard className="w-4 h-4" />
                          Thanh toán 90%
                        </button>
                      )}

                      {order.status === "THAT_BAI" &&
                        order.paymentmethod === "VNPAY" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFinalPayment(order.orderid);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-105 shadow-md"
                              style={{
                                background:
                                  "linear-gradient(135deg, #ef4444, #dc2626)",
                              }}
                            >
                              <CreditCard className="w-4 h-4" />
                              Thanh toán lại
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDepositAgain(order.orderid);
                              }}
                              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105`}
                              style={{
                                color: "#ef4444",
                                background: isDark
                                  ? "rgba(239, 68, 68, 0.1)"
                                  : "rgba(239, 68, 68, 0.05)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                              }}
                            >
                              Đặt cọc lại
                            </button>
                          </>
                        )}

                      {/* Xác nhận nhận hàng - Hiện khi DA_THANH_TOAN hoặc DA_GIAO */}
                      {(order.status === "DA_THANH_TOAN" ||
                        order.status === "DA_GIAO") && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmDelivery(order.orderid);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-105 shadow-md"
                            style={{
                              background: isDark
                                ? "linear-gradient(135deg, #10b981, #059669)"
                                : "linear-gradient(135deg, #34d399, #10b981)",
                            }}
                          >
                            <PackageCheck className="w-4 h-4" />
                            Xác nhận nhận hàng
                          </button>
                        </>
                      )}

                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTransactions(order.orderid);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
                        style={{
                          color: isDark ? "#3b82f6" : "#2563eb",
                          background: isDark
                            ? "rgba(59, 130, 246, 0.1)"
                            : "rgba(59, 130, 246, 0.05)",
                          border: isDark
                            ? "1px solid rgba(59, 130, 246, 0.3)"
                            : "1px solid rgba(59, 130, 246, 0.2)",
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

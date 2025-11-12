import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get } from "../../utils/api";
import { useTheme } from "../../contexts/ThemeContext";
import {
  ArrowLeft,
  DollarSign,
  Receipt,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Package,
  RefreshCw,
  Percent,
  Battery,
  Coins,
  Calendar,
  Info,
} from "lucide-react";
import AuroraText from "../../components/common/AuroraText";
import { toast } from "sonner";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value ?? 0);
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TransactionStatusTag = ({ status, isDark }) => {
  const statusConfig = {
    SUCCESS: {
      text: "Thành công",
      icon: CheckCircle,
      gradient: isDark
        ? "linear-gradient(135deg, #10b981, #059669)"
        : "linear-gradient(135deg, #34d399, #10b981)",
    },
    PENDING: {
      text: "Đang xử lý",
      icon: Clock,
      gradient: isDark
        ? "linear-gradient(135deg, #f59e0b, #d97706)"
        : "linear-gradient(135deg, #fbbf24, #f59e0b)",
    },
    CANCELLED: {
      text: "Đã hủy",
      icon: XCircle,
      gradient: isDark
        ? "linear-gradient(135deg, #6b7280, #4b5563)"
        : "linear-gradient(135deg, #9ca3af, #6b7280)",
    },
    FAILED: {
      text: "Thất bại",
      icon: XCircle,
      gradient: isDark
        ? "linear-gradient(135deg, #ef4444, #dc2626)"
        : "linear-gradient(135deg, #f87171, #ef4444)",
    },
  };

  const config = statusConfig[status] || {
    text: status,
    icon: AlertCircle,
    gradient: isDark
      ? "linear-gradient(135deg, #6b7280, #4b5563)"
      : "linear-gradient(135deg, #9ca3af, #6b7280)",
  };

  const Icon = config.icon;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs text-white shadow-sm"
      style={{ background: config.gradient }}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.text}
    </div>
  );
};

const TransactionTypeTag = ({ type, isDark }) => {
  const typeConfig = {
    DEPOSIT: {
      text: "Đặt cọc",
      icon: Coins,
      color: isDark ? "#3b82f6" : "#2563eb",
      bg: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
    },
    FINAL_PAYMENT: {
      text: "Thanh toán cuối",
      icon: CreditCard,
      color: isDark ? "#10b981" : "#059669",
      bg: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
    },
    REFUND: {
      text: "Hoàn tiền",
      icon: RefreshCw,
      color: isDark ? "#f97316" : "#ea580c",
      bg: isDark ? "rgba(249, 115, 22, 0.1)" : "rgba(249, 115, 22, 0.05)",
    },
    COMMISSION: {
      text: "Hoa hồng",
      icon: Percent,
      color: isDark ? "#8b5cf6" : "#7c3aed",
      bg: isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.05)",
    },
    BATTERY_PAYMENT: {
      text: "Thanh toán pin",
      icon: Battery,
      color: isDark ? "#06b6d4" : "#0891b2",
      bg: isDark ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.05)",
    },
    PACKAGE_PURCHASE: {
      text: "Mua gói",
      icon: Package,
      color: isDark ? "#eab308" : "#ca8a04",
      bg: isDark ? "rgba(234, 179, 8, 0.1)" : "rgba(234, 179, 8, 0.05)",
    },
  };

  const config = typeConfig[type] || {
    text: type,
    icon: Receipt,
    color: isDark ? "#9ca3af" : "#6b7280",
    bg: isDark ? "rgba(156, 163, 175, 0.1)" : "rgba(156, 163, 175, 0.05)",
  };

  const Icon = config.icon;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs"
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}30`,
      }}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.text}
    </div>
  );
};

export default function TransactionContent() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme colors for aurora gradients
  const colors = {
    aurora: isDark
      ? ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"]
      : ["#3b82f6", "#8b5cf6", "#06b6d4", "#3b82f6"],
    primary: isDark ? ["#ef4444", "#f97316"] : ["#3b82f6", "#8b5cf6"],
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchTransactions = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await get(`api/buyer/orders/${orderId}/transactions`);
        if (res.status === "success" && res.summary) {
          setData(res);
        } else {
          throw new Error(res.message || "Không thể tải giao dịch");
        }
      } catch (err) {
        console.error("Lỗi:", err);
        toast.error("Không thể tải giao dịch");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [orderId]);

  if (loading) {
    return (
      <div className="relative">
        {/* Floating Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
          <div
            key={`trans-load-orb-1-${isDark}`}
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: isDark
                ? "radial-gradient(circle, #ef4444 0%, transparent 70%)"
                : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            }}
          />
        </div>

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
            Đang tải giao dịch...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative">
        {/* Floating Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
          <div
            key={`trans-empty-orb-1-${isDark}`}
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: isDark
                ? "radial-gradient(circle, #ef4444 0%, transparent 70%)"
                : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            }}
          />
        </div>

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
          <Receipt
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          />
          <p
            className={`text-lg ${isDark ? "text-gray-200" : "text-gray-700"}`}
          >
            Không có dữ liệu giao dịch
          </p>
        </div>
      </div>
    );
  }

  const { summary, allTransactions } = data;

  return (
    <div className="relative">
      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div
          key={`trans-orb-1-${isDark}`}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, #ef4444 0%, transparent 70%)"
              : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          }}
        />
        <div
          key={`trans-orb-2-${isDark}`}
          className="absolute top-1/2 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, #f97316 0%, transparent 70%)"
              : "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            animationDelay: "1s",
          }}
        />
      </div>

      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <AuroraText
            key={`trans-title-${isDark}`}
            text={`Giao Dịch Đơn Hàng #${orderId}`}
            colors={colors.aurora}
            speed={3}
            className="text-2xl md:text-3xl font-black"
          />
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
          style={{
            color: isDark ? "#e5e7eb" : "#1f2937",
            background: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
            border: isDark
              ? "1px solid rgba(239, 68, 68, 0.3)"
              : "1px solid rgba(251, 146, 60, 0.3)",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
        {/* Tổng thanh toán */}
        <div
          className="p-6 rounded-3xl transition-all duration-300 hover:scale-105"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))"
              : "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
            backdropFilter: "blur(20px)",
            border: isDark
              ? "1px solid rgba(59, 130, 246, 0.3)"
              : "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-2 rounded-xl"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                  : "linear-gradient(135deg, #60a5fa, #3b82f6)",
              }}
            >
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Tổng thanh toán
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {formatCurrency(summary.totalFinalPayment)}
          </p>
        </div>

        {/* Tổng tiền hàng */}
        <div
          className="p-6 rounded-3xl transition-all duration-300 hover:scale-105"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))"
              : "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))",
            backdropFilter: "blur(20px)",
            border: isDark
              ? "1px solid rgba(16, 185, 129, 0.3)"
              : "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-2 rounded-xl"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, #34d399, #10b981)",
              }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Tổng tiền hàng
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {formatCurrency(summary.netAmount)}
          </p>
        </div>

        {/* Tổng đặt cọc */}
        <div
          className="p-6 rounded-3xl transition-all duration-300 hover:scale-105"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.15))"
              : "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))",
            backdropFilter: "blur(20px)",
            border: isDark
              ? "1px solid rgba(245, 158, 11, 0.3)"
              : "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-2 rounded-xl"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "linear-gradient(135deg, #fbbf24, #f59e0b)",
              }}
            >
              <Coins className="w-5 h-5 text-white" />
            </div>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Tổng đặt cọc
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {formatCurrency(summary.totalDeposit)}
          </p>
        </div>

        {/* Hoàn tiền */}
        <div
          className="p-6 rounded-3xl transition-all duration-300 hover:scale-105"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.15))"
              : "linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.1))",
            backdropFilter: "blur(20px)",
            border: isDark
              ? "1px solid rgba(249, 115, 22, 0.3)"
              : "1px solid rgba(249, 115, 22, 0.2)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-2 rounded-xl"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #f97316, #ea580c)"
                  : "linear-gradient(135deg, #fb923c, #f97316)",
              }}
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Hoàn tiền
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {formatCurrency(summary.totalRefund)}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="h-px my-8 relative z-10"
        style={{
          background: isDark
            ? "linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.3), transparent)"
            : "linear-gradient(90deg, transparent, rgba(251, 146, 60, 0.3), transparent)",
        }}
      />

      {/* Transaction History Header */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <Receipt
            className="w-6 h-6"
            style={{ color: isDark ? "#ef4444" : "#3b82f6" }}
          />
          <h3
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Lịch Sử Giao Dịch ({allTransactions.length})
          </h3>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4 relative z-10">
        {allTransactions.map((transaction) => (
          <div
            key={transaction.transactionId}
            className="rounded-3xl p-6 transition-all duration-300 hover:scale-[1.01]"
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Type & Description */}
              <div className="md:col-span-4 space-y-2">
                <TransactionTypeTag
                  type={transaction.transactionType}
                  isDark={isDark}
                />
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  } line-clamp-2`}
                >
                  {transaction.description}
                </p>
              </div>

              {/* Amount */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <DollarSign
                    className="w-4 h-4"
                    style={{ color: "#10b981" }}
                  />
                  <p
                    className={`text-lg font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="md:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {transaction.method && (
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs"
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
                      <CreditCard className="w-3 h-3" />
                      {transaction.method}
                    </div>
                  )}
                  {transaction.bankCode && (
                    <div
                      className="inline-flex items-center px-2 py-1 rounded-lg font-semibold text-xs"
                      style={{
                        color: isDark ? "#9ca3af" : "#6b7280",
                        background: isDark
                          ? "rgba(156, 163, 175, 0.1)"
                          : "rgba(156, 163, 175, 0.05)",
                        border: isDark
                          ? "1px solid rgba(156, 163, 175, 0.3)"
                          : "1px solid rgba(156, 163, 175, 0.2)",
                      }}
                    >
                      {transaction.bankCode}
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <TransactionStatusTag
                  status={transaction.status}
                  isDark={isDark}
                />
              </div>

              {/* Timestamps */}
              <div className="md:col-span-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar
                      className="w-3 h-3"
                      style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                    />
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  {transaction.paymentDate && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle
                        className="w-3 h-3"
                        style={{ color: "#10b981" }}
                      />
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {formatDate(transaction.paymentDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {allTransactions.length === 0 && (
        <div
          className="text-center py-16 rounded-3xl"
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
          <Receipt
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          />
          <p
            className={`text-lg ${isDark ? "text-gray-200" : "text-gray-700"}`}
          >
            Chưa có giao dịch nào
          </p>
        </div>
      )}
    </div>
  );
}

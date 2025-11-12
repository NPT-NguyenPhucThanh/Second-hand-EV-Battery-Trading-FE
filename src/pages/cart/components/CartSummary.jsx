import React from "react";
import { formatVND } from "../../../utils/format";
import { CreditCard, Sparkles } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import AuroraText from "../../../components/common/AuroraText";

const CartSummary = ({ total, onCheckout }) => {
  const { isDark } = useTheme();

  // Theme colors for aurora gradients
  const colors = {
    aurora: isDark
      ? ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"]
      : ["#3b82f6", "#8b5cf6", "#06b6d4", "#3b82f6"],
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))"
          : "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
        border: isDark
          ? "1px solid rgba(239, 68, 68, 0.3)"
          : "1px solid rgba(59, 130, 246, 0.3)",
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <span
          className={`text-xl font-bold ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`}
        >
          Tổng cộng:
        </span>
        <AuroraText
          key={`cart-total-${isDark}`}
          text={formatVND(total)}
          colors={colors.aurora}
          speed={2}
          className="text-3xl font-black"
        />
      </div>

      <button
        onClick={onCheckout}
        className="w-full text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #ef4444, #f97316)"
            : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        }}
      >
        <CreditCard className="w-5 h-5" />
        Thanh toán ngay
        <Sparkles className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CartSummary;

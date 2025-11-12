import React from "react";
import { useCart } from "../../../hooks/useCart";
import Cart from "../components/Cart";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import AuroraText from "../../../components/common/AuroraText";

const CartPage = () => {
  const { cartItems, removeFromCart, checkout, loading } = useCart();
  const { isDark } = useTheme();

  // Theme colors for aurora gradients
  const colors = {
    aurora: isDark
      ? ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"]
      : ["#3b82f6", "#8b5cf6", "#06b6d4", "#3b82f6"],
  };

  // === TÍNH TỔNG (Backend đã bao gồm hoa hồng) ===
  const total = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  if (loading) {
    return (
      <div
        className="min-h-screen transition-colors duration-300 flex items-center justify-center"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
            : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
        }}
      >
        {/* Floating Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            key={`loading-orb-1-${isDark}`}
            className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: isDark
                ? "radial-gradient(circle, #ef4444 0%, transparent 70%)"
                : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            }}
          ></div>
          <div
            key={`loading-orb-2-${isDark}`}
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: isDark
                ? "radial-gradient(circle, #f97316 0%, transparent 70%)"
                : "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
              animationDelay: "1s",
            }}
          ></div>
        </div>

        <div className="text-center relative z-10">
          <div
            className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mb-4"
            style={{
              borderColor: isDark
                ? "rgba(239, 68, 68, 0.3)"
                : "rgba(59, 130, 246, 0.3)",
              borderTopColor: "transparent",
            }}
          ></div>
          <p
            className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Đang tải giỏ hàng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300 pt-24 pb-16 px-4"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      }}
    >
      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          key={`cart-orb-1-${isDark}`}
          className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, #ef4444 0%, transparent 70%)"
              : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          }}
        ></div>
        <div
          key={`cart-orb-2-${isDark}`}
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, #f97316 0%, transparent 70%)"
              : "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            animationDelay: "1s",
          }}
        ></div>
        <div
          key={`cart-orb-3-${isDark}`}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, #fb923c 0%, transparent 70%)"
              : "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
            animationDelay: "2s",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className={`flex items-center gap-2 transition-all duration-300 hover:scale-105 px-4 py-2 rounded-xl ${
              isDark
                ? "text-orange-400 hover:text-orange-300"
                : "text-blue-600 hover:text-purple-600"
            }`}
            style={{
              background: isDark
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(59, 130, 246, 0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <ArrowLeft className="w-5 h-5" /> Tiếp tục mua sắm
          </Link>

          <AuroraText
            key={`cart-title-${isDark}`}
            text="Giỏ hàng của bạn"
            colors={colors.aurora}
            speed={2}
            className="text-3xl font-black"
          />
        </div>

        {cartItems.length === 0 ? (
          <div
            className="rounded-3xl p-12 text-center shadow-2xl"
            style={{
              background: isDark
                ? "rgba(30, 41, 59, 0.6)"
                : "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(20px)",
              border: isDark
                ? "1px solid rgba(239, 68, 68, 0.2)"
                : "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <ShoppingCart
              className="w-24 h-24 mx-auto mb-4"
              style={{
                color: isDark
                  ? "rgba(251, 146, 60, 0.5)"
                  : "rgba(139, 92, 246, 0.5)",
              }}
            />
            <p
              className={`text-xl mb-6 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Giỏ hàng trống
            </p>
            <Link
              to="/"
              className="inline-block text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:scale-105 transform transition-all duration-300"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #ef4444, #f97316)"
                  : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <Cart
            cartItems={cartItems}
            onRemoveItem={removeFromCart}
            onCheckout={checkout}
            total={total}
          />
        )}
      </div>
    </div>
  );
};

export default CartPage;

import React from "react";
import CartItem from "../../cart/components/CartItem";
import CartSummary from "./../components/CartSummary";
import { useTheme } from "../../../contexts/ThemeContext";

const Cart = ({ cartItems, onRemoveItem, onCheckout, total }) => {
  const { isDark } = useTheme();
  return (
  <>
    <div
      className="rounded-3xl shadow-2xl p-8"
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
      <ul className="space-y-6 mb-8">
        {cartItems.map((item) => (
          <>
          <CartItem key={item.id} item={item} onRemoveItem={onRemoveItem} />
          </>
        ))}
      </ul>
      <CartSummary total={total} onCheckout={onCheckout} />
    </div>
  </>
  );
};

export default Cart;

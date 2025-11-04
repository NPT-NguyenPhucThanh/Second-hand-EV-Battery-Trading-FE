// src/components/cart/CartSummary.jsx
import React from "react";

const CartSummary = ({ total, onCheckout }) => {
  return (
    <div className="border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xl font-bold">Tổng cộng:</span>
        <span className="text-2xl font-bold text-green-600">${total}</span>
      </div>
      <button
        onClick={onCheckout}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition"
      >
        Thanh toán ngay
      </button>
    </div>
  );
};

export default CartSummary;
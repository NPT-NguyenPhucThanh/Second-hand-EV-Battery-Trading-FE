import React from "react";

/**
 *  CartSummary.jsx
 * Hiển thị tổng tiền và nút Checkout
 * Props:
 *  - total: tổng tiền
 *  - onCheckout: function()
 *
 * 🔧 Sau này gắn API:
 * POST /api/buyer/orders/checkout
 */
const CartSummary = ({ total, onCheckout }) => {
  return (
    <div className="mt-6 flex justify-between items-center border-t pt-4">
      <strong className="text-xl text-gray-900">Total: ${total}</strong>
      <button
        onClick={onCheckout}
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
      >
        Checkout
      </button>
    </div>
  );
};

export default CartSummary;

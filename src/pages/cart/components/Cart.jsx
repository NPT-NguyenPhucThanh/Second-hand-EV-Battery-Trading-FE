import React from "react";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";

/**
 * Cart.jsx
 * Gộp toàn bộ hiển thị danh sách giỏ hàng, tổng tiền và checkout
 *
 *  Sau này gắn API:
 * - GET /api/buyer/cart         (lấy danh sách)
 * - DELETE /api/buyer/cart/remove/{itemId}
 * - POST /api/buyer/orders/checkout
 */
const Cart = ({ cartItems, onRemoveItem, onCheckout }) => {
  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const total = calculateTotal();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Your Shopping Cart
      </h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} onRemoveItem={onRemoveItem} />
            ))}
          </ul>
          <CartSummary total={total} onCheckout={onCheckout} />
        </>
      )}
    </div>
  );
};

export default Cart;

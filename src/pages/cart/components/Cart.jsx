// src/components/cart/Cart.jsx
import React from "react";
import CartItem from "../../cart/components/CartItem";
import CartSummary from "./../components/CartSummary";

const Cart = ({ cartItems, onRemoveItem, onCheckout, total }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <ul className="space-y-6 mb-8">
        {cartItems.map((item) => (
          <CartItem key={item.id} item={item} onRemoveItem={onRemoveItem} />
        ))}
      </ul>
      <CartSummary total={total} onCheckout={onCheckout} />
    </div>
  );
};

export default Cart;
// src/components/cart/CartItem.jsx
import React from "react";

const CartItem = ({ item, onRemoveItem }) => {
  const originalPrice = item.price;
  const priceWithTax = originalPrice * 1.05;
  const itemTotal = priceWithTax * item.quantity;

  return (
    <li className="flex items-center justify-between border-b pb-4">
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
        <div className="text-sm text-gray-600 mt-1">
          <span className="line-through">${originalPrice.toFixed(2)}</span>
          <span className="text-green-600 font-bold ml-2">
            ${priceWithTax.toFixed(2)} (+5%)
          </span>
          <span className="block">Số lượng: {item.quantity}</span>
        </div>
      </div>
      <div className="text-right ml-4">
        <p className="font-bold text-xl text-green-600">${itemTotal.toFixed(2)}</p>
        <button
          onClick={() => onRemoveItem(item.id)}
          className="mt-2 text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Xóa
        </button>
      </div>
    </li>
  );
};

export default CartItem;
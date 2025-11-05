// src/components/cart/CartItem.jsx
import React from "react";
import { formatVND } from "../../../utils/format"; // ← Import

const CartItem = ({ item, onRemoveItem }) => {
  const priceWithTax = item.price * 1.05;
  const formattedPriceWithTax = formatVND(priceWithTax);
  const itemTotal = formatVND(priceWithTax * item.quantity);

  return (
    <li className="flex items-center justify-between border-b pb-4">
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
        <div className="text-sm text-gray-600 mt-1">
          <span className="line-through">{item.formattedPrice}</span>
          <span className="text-green-600 font-bold ml-2">
            {formattedPriceWithTax} (+5%)
          </span>
          <span className="block">Số lượng: {item.quantity}</span>
        </div>
      </div>
      <div className="text-right ml-4">
        <p className="font-bold text-xl text-green-600">{itemTotal}</p>
        <button
          onClick={() => onRemoveItem(item.id)} // ← item.id = itemsid
          className="mt-2 text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Xóa
        </button>
      </div>
    </li>
  );
};

export default CartItem;

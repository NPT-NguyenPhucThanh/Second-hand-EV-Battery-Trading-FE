// CartItem.jsx (lưu ý: document là CartItems.jsx nhưng code là CartItem): Không cần sửa lớn, vì logic remove ở parent.
// Chỉ thêm comment nếu cần.

import React from "react";

const CartItem = ({ item, onRemoveItem }) => {
  if (!item) return null;

  return (
    <li className="flex justify-between items-center border-b pb-2">
      <div className="flex-1">
        <strong className="text-lg text-gray-900">{item.name}</strong>
        <span className="block text-gray-600">
          ${item.price.toFixed(2)} × {item.quantity}
        </span>
      </div>
      <button
        onClick={() => onRemoveItem(item.id)}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
      >
        Remove
      </button>
    </li>
  );
};

export default CartItem;
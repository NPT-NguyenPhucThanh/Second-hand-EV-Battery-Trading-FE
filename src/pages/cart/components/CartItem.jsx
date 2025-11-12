import React from "react";
import { formatVND } from "../../../utils/format";
import { Trash2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

const CartItem = ({ item, onRemoveItem }) => {
  const { isDark } = useTheme();

  // Backend đã tính sẵn giá bao gồm hoa hồng, không cần +5% nữa
  const itemTotal = formatVND(item.price * item.quantity);

  // Get product image or use placeholder
  const productImage =
    item.image ||
    "https://via.placeholder.com/80x80/1f2937/fb923c?text=Product";

  return (
    <li
      className="flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))"
          : "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))",
        border: isDark
          ? "1px solid rgba(239, 68, 68, 0.2)"
          : "1px solid rgba(59, 130, 246, 0.2)",
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <img
          src={productImage}
          alt={item.name}
          className="w-16 h-16 object-cover rounded-xl"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/80x80/1f2937/fb923c?text=Product";
          }}
        />

        <div className="flex-1">
          <h3
            className={`font-bold text-lg ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {item.name}
          </h3>
          <div
            className={`text-sm mt-1 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <span
              className="font-bold"
              style={{
                color: isDark ? "#fb923c" : "#8b5cf6",
              }}
            >
              {formatVND(item.price)}
            </span>
            <span className="block mt-1">Số lượng: {item.quantity}</span>
          </div>
        </div>
      </div>

      <div className="text-right ml-4">
        <p
          className="font-black text-2xl mb-2"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #ef4444, #f97316)"
              : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {itemTotal}
        </p>
        <button
          onClick={() => onRemoveItem(item.id)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
          style={{
            background: isDark
              ? "rgba(239, 68, 68, 0.2)"
              : "rgba(239, 68, 68, 0.1)",
            color: isDark ? "#fca5a5" : "#dc2626",
            border: isDark
              ? "1px solid rgba(239, 68, 68, 0.3)"
              : "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <Trash2 className="w-4 h-4" />
          Xóa
        </button>
      </div>
    </li>
  );
};

export default CartItem;

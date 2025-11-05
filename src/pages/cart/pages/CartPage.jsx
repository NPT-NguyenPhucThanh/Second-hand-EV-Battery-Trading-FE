// src/pages/cart/pages/CartPage.jsx
import React from "react";
import { useCart } from "../../../hooks/useCart";
import Cart from "../components/Cart";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";

const CartPage = () => {
  const { cartItems, removeFromCart, checkout, loading } = useCart();

  // === TÍNH TỔNG (đã +5%) ===
  const total = cartItems
    .reduce((sum, item) => sum + item.price * 1.05 * item.quantity, 0)
    .toFixed(2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-green-600 transition">
            <ArrowLeft className="w-5 h-5" /> Tiếp tục mua sắm
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
            Giỏ hàng của bạn
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-6">Giỏ hàng trống</p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition"
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
import React, { useState, useEffect } from "react";
import Cart from "../components/Cart";
import { mockCartItems } from "../data/mockCartData"; //  import data mẫu

/**
 *  CartPage.jsx
 * Trang chính hiển thị giỏ hàng
 *
 *  Sau này gắn API:
 * - GET /api/buyer/cart
 * - DELETE /api/buyer/cart/remove/{itemId}
 * - POST /api/buyer/orders/checkout
 */
const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  // Load data mẫu (tạm thời, chưa gọi API)
  useEffect(() => {
    setCartItems(mockCartItems);
    //  Sau này thay bằng fetch("/api/buyer/cart")
  }, []);

  //  Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
    //  Sau này thay bằng DELETE /api/buyer/cart/remove/{itemId}
  };

  //  Thanh toán
  const handleCheckout = () => {
    alert("Proceeding to checkout...");
    //  Sau này thay bằng POST /api/buyer/orders/checkout
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <main className="container mx-auto">
        <Cart
          cartItems={cartItems}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
        />
      </main>
    </div>
  );
};

export default CartPage;

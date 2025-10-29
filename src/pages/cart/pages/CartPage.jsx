// CartPage.jsx (Sửa lớn: Sử dụng api.js để gọi API thay vì fetch trực tiếp. Sửa endpoint checkout để khớp mô tả (/api/buyer/checkout thay vì /api/buyer/orders/checkout nếu cần, nhưng giữ nguyên nếu theo code cũ. Ở đây tôi sửa thành /api/buyer/checkout theo mô tả cuối cùng. Thêm import api. Giữ token nếu có.)

import React, { useState, useEffect } from "react";
import Cart from "../components/Cart.jsx";
import { toast } from "sonner"; // Import sonner cho toast (cài đặt nếu chưa: npm install sonner)
import api from "../../../utils/api.js"; // Import api.js (giả định đường dẫn đúng, ví dụ: src/api.js)

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart từ API sử dụng api.get
  const fetchCart = async () => {
    try {
      const data = await api.get("api/buyer/cart");
      console.log("API Response:", data);
      setCartItems(data.items || []); // Giả định response có field 'items'
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Có lỗi khi tải giỏ hàng.");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Xóa sản phẩm: Sử dụng api.del rồi refetch
  const handleRemoveItem = async (id) => {
    try {
      await api.del(`api/buyer/cart/remove/${id}`);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
      fetchCart(); // Refetch để cập nhật UI
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Có lỗi khi xóa sản phẩm.");
    }
  };

  // Thanh toán: Sử dụng api.post rồi xử lý
  const handleCheckout = async () => {
    try {
      await api.post("api/buyer/checkout", { cartItems }); // Sửa endpoint thành /api/buyer/checkout theo mô tả, gửi cart nếu cần
      toast.success("Thanh toán thành công!");
      setCartItems([]); // Clear cart sau checkout
      // Optional: Redirect to order confirmation page
      // window.location.href = "/orders";
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Có lỗi khi thanh toán.");
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-100 py-8">
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
// src/hooks/useCart.js
import { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "sonner";

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartItems([]); // Không có token → giỏ trống
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("api/buyer/cart");
      setCartItems(res.items || []);
    } catch (error) {
      toast.error("Không thể tải giỏ hàng");
    } finally { 
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post("api/buyer/cart/add", null, {
        params: { productId, quantity },
      });
      toast.success("Đã thêm vào giỏ!");
      fetchCart();
    } catch (error) {
      toast.error("Không thể thêm sản phẩm");
    }
  };

  const removeFromCart = async (id) => {
    try {
      await api.delete(`/api/buyer/cart/remove/${id}`);
      toast.success("Đã xóa");
      fetchCart();
    } catch (error) {
      toast.error("Lỗi xóa sản phẩm");
    }
  };

  const checkout = async () => {
    try {
      await api.post("api/buyer/checkout");
      toast.success("Thanh toán thành công!");
      setCartItems([]);
    } catch (error) {
      toast.error("Thanh toán thất bại");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    checkout,
    refetch: fetchCart,
  };
};
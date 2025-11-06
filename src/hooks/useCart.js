// src/hooks/useCart.js
import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { toast } from "sonner";

const CART_API = {
  GET: "api/buyer/cart",
  ADD: "api/buyer/cart/add",
  REMOVE: (itemId) => `api/buyer/cart/remove/${itemId}`,
  CHECKOUT: "api/buyer/checkout",
};

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartItems([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    try {
      const res = await api.get(CART_API.GET);
      const rawItems = res?.cart?.cart_items || [];

      const mappedItems = rawItems.map(item => ({
        id: item.itemsid,
        productId: item.products.productid,
        name: item.products.productname,
        price: item.products.cost,
        quantity: item.quantity,
        image: item.products.images?.[0] || "/placeholder.jpg",
      }));

      setCartItems(mappedItems);
      return mappedItems;
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err?.response?.data?.message || "Không thể tải giỏ hàng");
      }
      setCartItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    if (!productId || quantity < 1) return toast.error("Dữ liệu không hợp lệ");

    try {
      await api.post(CART_API.ADD, null, {
        params: { productId: Number(productId), quantity },
      });
      toast.success("Đã thêm vào giỏ!");
      await fetchCart();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể thêm sản phẩm");
    }
  };

  const removeFromCart = async (itemId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!itemId) return toast.error("ID sản phẩm không hợp lệ");

    try {
      await api.delete(CART_API.REMOVE(itemId)); // ← DÙNG DELETE
      toast.success("Đã xóa khỏi giỏ hàng");
      await fetchCart();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi xóa sản phẩm");
    }
  };

  const checkout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Vui lòng đăng nhập");

    if (cartItems.length === 0) return toast.warning("Giỏ hàng trống!");

    try {
      await api.post(CART_API.CHECKOUT);
      toast.success("Thanh toán thành công!");
      setCartItems([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Thanh toán thất bại");
    }
  };

  // CHỈ FETCH KHI CÓ TOKEN
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [fetchCart]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    checkout,
    refetch: fetchCart,
  };
};
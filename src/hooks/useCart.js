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
      console.log("Cart API response:", res); // Debug log

      const rawItems = res?.cart?.cart_items || [];

      const mappedItems = rawItems.map((item) => ({
        id: item.itemsid,
        productId: item.products.productid,
        name: item.products.productname,
        price: item.products.cost,
        quantity: item.quantity,
        image:
          item.products.images?.[0] ||
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%231f2937' width='80' height='80'/%3E%3Ctext fill='%23fb923c' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EProduct%3C/text%3E%3C/svg%3E",
      }));

      setCartItems(mappedItems);
      return mappedItems;
    } catch (err) {
      console.error("Fetch cart error:", err.response?.data || err); // Debug log
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

    if (!productId || quantity < 1) {
      toast.error("Dữ liệu không hợp lệ");
      return;
    }

    try {
      // GỬI DƯỚI DẠNG QUERY PARAMS THAY VÌ JSON BODY
      await api.post(
        `${CART_API.ADD}?productId=${Number(productId)}&quantity=${Number(
          quantity
        )}`
      );

      toast.success("Đã thêm vào giỏ hàng!");
      await fetchCart();
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err);

      const message = err?.response?.data?.message || "Không thể thêm sản phẩm";
      toast.error(message);

      if (err.response?.status === 403 || err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        // window.location.href = '/login';
      }
    }
  };

  const removeFromCart = async (itemId) => {
    console.log("Removing item:", itemId);
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!itemId) return toast.error("ID sản phẩm không hợp lệ");

    try {
      const response = await api.del(CART_API.REMOVE(itemId));
      console.log("Remove response:", response);
      toast.success("Đã xóa khỏi giỏ hàng");
      await fetchCart();
    } catch (err) {
      console.error("Remove from cart error:", err.response?.data || err);
      toast.error(err?.response?.data?.message || "Lỗi xóa sản phẩm");
    }
  };

  const checkout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Vui lòng đăng nhập");

    if (cartItems.length === 0) return toast.warning("Giỏ hàng trống!");

    // Chuyển hướng đến trang checkout với productId = 0 (mua từ giỏ hàng)
    window.location.href = "/checkout/0";
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
    addToCart,
    removeFromCart,
    checkout,
    refetch: fetchCart,
  };
};

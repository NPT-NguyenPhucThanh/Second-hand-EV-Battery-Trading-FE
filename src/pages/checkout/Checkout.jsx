// src/features/home/components/Checkout.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProductById } from "../../utils/services/productService";
import api from "../../utils/api";
import { toast } from "sonner";
import { ShoppingCart, MapPin, CreditCard, CheckCircle } from "lucide-react";

function currency(value) {
  return value?.toLocaleString("vi-VN") + " ₫";
}

export default function Checkout() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("VNPAY"); // ← ĐÚNG VỚI SELECT
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const pid = parseInt(productId, 10);
        const isFromCart = !productId || pid === 0 || isNaN(pid);

        let items = [];
        let total = 0;

        if (!isFromCart) {
          const product = await getProductById(pid);
          items = [{ ...product.product, quantity: 1 }];
          total = product.product.cost;
        } else {
          const cartResponse = await api.get("api/buyer/cart");
          items = cartResponse.data.items || [];
          total = items.reduce(
            (sum, i) => sum + i.product.cost * i.quantity,
            0
          );
        }

        setOrderData({ items, total });
      } catch (err) {
        toast.error("Không tải được giỏ hàng. Vẫn đặt được hàng!");
        setOrderData({ items: [], total: 0 });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [productId]);

  const handleSubmit = async () => {
    if (!address.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }

    setSubmitting(true);
    try {
      const pid = parseInt(productId, 10);
      const isFromCart = !productId || pid === 0 || isNaN(pid);

      const body = {
        productId: isFromCart ? null : pid,
        quantity: isFromCart ? null : 1,
        shippingAddress: address,
        paymentMethod,
      };

      console.log("🚀 Gửi checkout:", body); // Debug 1 giây

      const res = await api.post("api/buyer/checkout", body);
      console.log("✅ Response:", res.data); // Debug 1 giây

      if (res.status === "success") {
        const orderId = res.orderId; // ĐÚNG
        const orderStatus = res.order.status; // ĐÚNG

        toast.success(res.message || "Đặt hàng thành công!", {
          duration: 5000,
          position: "top-center",
        });

        // XE ĐIỆN → ĐẶT CỌC
        // Trong handleSubmit, phần navigate
        if (orderStatus === "CHO_DAT_COC") {
          navigate(`/checkout/deposit/${orderId}`);
        } else {
          // PIN → CHUYỂN NGAY QUA TRANG TẠO URL VNPAY
          navigate(`/checkout/confirm-pin/${orderId}`);
        }
      }
    } catch (err) {
      console.error("Lỗi checkout:", err);
      toast.error(
        err.response?.data?.message || "Lỗi tạo đơn hàng, thử lại nhé!"
      );
    } finally {
      setSubmitting(false);
    }
  };
  // ================== LOADING ==================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
        <div className="container mx-auto py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 text-lg mt-4 font-medium">
            Đang chuẩn bị đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  // ================== EMPTY CART ==================
  if (!orderData || orderData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
        <div className="container mx-auto py-20 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-gray-700 text-lg mb-6">
              Giỏ hàng trống, không có gì để thanh toán.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-block bg-gradient-to-r from-blue-500 to-green-400 text-white px-8 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================== MAIN UI ==================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-green-500 text-sm mb-6 font-medium transition-all duration-300 group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
            ←
          </span>
          <span className="ml-2">Quay lại</span>
        </button>

        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          Thanh toán đơn hàng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
                Sản phẩm
              </h2>
              <ul className="space-y-4">
                {orderData.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl"
                  >
                    <img
                      src={item.images?.[0] || "/placeholder-image.jpg"}
                      alt={item.productname}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {item.productname}
                      </p>
                      <p className="text-gray-600">SL: {item.quantity || 1}</p>
                      <p className="text-blue-600 font-bold">
                        {currency(item.cost)}
                        {item.quantity > 1 &&
                          ` × ${item.quantity} = ${currency(
                            item.cost * item.quantity
                          )}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FORM THANH TOÁN */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Tóm tắt đơn hàng
              </h2>

              {/* Địa chỉ */}
              <div className="mb-5">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Địa chỉ giao hàng
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              {/* Phương thức TT */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Thanh toán
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="VNPAY">Thanh toán qua VNPAY</option>
                  {/* Nếu backend hỗ trợ thêm COD sau này thì mở khóa */}
                  {/* <option value="COD">Thanh toán khi nhận hàng (COD)</option> */}
                </select>
              </div>

              {/* Tổng tiền */}
              <div className="border-t pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Tiền hàng</span>
                  <span>{currency(orderData.total)}</span>
                </div>
                <div className="flex justify-between text-lg text-orange-600">
                  <span>Phí hoa hồng (5%)</span>
                  <span>{currency(Math.round(orderData.total * 0.05))}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Tổng thanh toán</span>
                  <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                    {currency(
                      orderData.total + Math.round(orderData.total * 0.05)
                    )}
                  </span>
                </div>
              </div>

              {/* Nút đặt hàng */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {submitting ? "Đang gửi..." : "Đặt hàng ngay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

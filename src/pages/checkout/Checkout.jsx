import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProductById } from "../../utils/services/productService";
import api from "../../utils/api";
import { toast } from "sonner";
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import AuroraText from "../../components/common/AuroraText";
import { getSavedAddresses } from "../../services/addressService";
import { Button } from "antd";


function currency(value) {
  return value?.toLocaleString("vi-VN") + " ₫";
}
const CAR_ADDRESS =
  "Lô E2a-7, Đường D1 Khu Công nghệ cao, P.Long Thạnh Mỹ, TP Thủ Đức, TP.HCM";

export default function Checkout() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]); 
  const [selectedAddress, setSelectedAddress] = useState("NEW"); 
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [submitting, setSubmitting] = useState(false);

  // Theme colors for aurora gradients
  const colors = {
    aurora: isDark
      ? ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"]
      : ["#3b82f6", "#8b5cf6", "#06b6d4", "#3b82f6"],
    primary: isDark ? ["#ef4444", "#f97316"] : ["#3b82f6", "#8b5cf6"],
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      try {
        const pid = parseInt(productId, 10);
        const isFromCart = !productId || pid === 0 || isNaN(pid);

        let items = [];
        let total = 0;
        let productType = null;

        if (!isFromCart) {
          const response = await getProductById(pid);
          const product = response.product;
          const seller = response.seller;

          items = [
            {
              ...product,
              users: seller,
              quantity: 1,
            },
          ];

          total = product.cost;

          productType = product.type === "Car EV" ? "car" : "battery";
        } else {
          const cartResponse = await api.get("api/buyer/cart");
          const cartItems = cartResponse?.cart?.cart_items || [];

          items = cartItems.map((item) => ({
            ...item.products, // Lấy hết data (đã có 'users', 'cost', 'productname', 'type')
            quantity: item.quantity,
            itemsid: item.itemsid, // Đồng nhất 'images': 'imgs' (List<product_img>) -> 'images' (List<String>)
            images: item.products.imgs
              ? item.products.imgs.map((img) => img.url)
              : [],
          }));

          total = items.reduce((sum, i) => sum + i.cost * i.quantity, 0);
          const hasBattery = items.some((item) => item.type === "Battery");
          productType = hasBattery ? "battery" : "car";
        }

        setOrderData({ items, total, productType });
        if (productType === "car") {
          setAddress(CAR_ADDRESS); 
          setSelectedAddress("FIXED"); 
        } else {
          const saved = await getSavedAddresses();
          setSavedAddresses(saved);
          setSelectedAddress("NEW"); 
          setAddress(""); 
        }
      } catch (error) {
        console.error("Checkout init error:", error);
        toast.error("Không tải được thông tin sản phẩm.");
        setOrderData({ items: [], total: 0, productType: null });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [productId]);

  useEffect(() => {
    if (selectedAddress === "NEW") {
      setAddress(""); 
    } else if (selectedAddress === "FIXED") {
      setAddress(CAR_ADDRESS); 
    } else {
      const chosen = savedAddresses.find(
        (a) => a.addressid.toString() === selectedAddress
      );
      if (chosen) {
        const fullAddress = `${chosen.street}, ${chosen.ward}, ${chosen.district}, ${chosen.province}`;
        setAddress(fullAddress);
      }
    }
  }, [selectedAddress, savedAddresses]);

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

      console.log("Checkout request body:", body); // Debug log

      const res = await api.post("api/buyer/checkout", body);

      console.log("Checkout response:", res); // Debug log

      if (res.status === "success") {
        const orderId = res.orderId;
        const orderStatus = res.order.status;

        // XE ĐIỆN → ĐẶT CỌC
        if (res.requireDeposit || orderStatus === "CHO_DAT_COC") {
          toast.success("Đơn hàng đã tạo! Vui lòng đặt cọc 10%", {
            duration: 2000,
            position: "top-center",
          });
          setTimeout(() => {
            navigate(`/checkout/deposit/${orderId}`);
          }, 500);
        }
        // PIN → THANH TOÁN 100%
        else if (res.requirePayment || orderStatus === "CHO_THANH_TOAN") {
          toast.success("Đơn hàng đã tạo! Chuyển đến thanh toán...", {
            duration: 2000,
            position: "top-center",
          });
          setTimeout(() => {
            navigate(`/checkout/final-payment/${orderId}`);
          }, 500);
        }
        // Fallback: Chuyển về order history (không nên xảy ra)
        else {
          toast.success(res.message || "Đặt hàng thành công!", {
            duration: 3000,
            position: "top-center",
          });
          setTimeout(() => {
            navigate("/profile/orders");
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Lỗi checkout:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      console.error("Error message:", err.response?.data?.message);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Lỗi tạo đơn hàng, thử lại nhé!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ================== LOADING ==================
  if (loading) {
    return (
      <div
        className="min-h-screen transition-colors duration-300 pt-24"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
            : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
        }}
      >
        {/* Floating Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            key={`orb-1-${isDark}`}
            className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: isDark
                ? "radial-gradient(circle, #ef4444 0%, transparent 70%)"
                : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            }}
          />
          <div
            key={`orb-2-${isDark}`}
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: isDark
                ? "radial-gradient(circle, #f97316 0%, transparent 70%)"
                : "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
              animationDelay: "1s",
            }}
          />
        </div>

        <div className="container mx-auto py-20 text-center relative z-10">
          <div
            className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent"
            style={{
              borderColor: isDark
                ? "rgba(239, 68, 68, 0.3)"
                : "rgba(59, 130, 246, 0.3)",
              borderTopColor: "transparent",
            }}
          />
          <p
            className={`text-lg mt-4 font-medium ${
              isDark ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Đang chuẩn bị đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  // ================== EMPTY CART ==================
  if (!orderData || orderData.items.length === 0) {
    return (
      <div
        className="min-h-screen transition-colors duration-300 pt-24"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
            : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
        }}
      >
        {/* Floating Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            key={`empty-orb-1-${isDark}`}
            className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: isDark
                ? "radial-gradient(circle, #ef4444 0%, transparent 70%)"
                : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            }}
          />
          <div
            key={`empty-orb-2-${isDark}`}
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: isDark
                ? "radial-gradient(circle, #f97316 0%, transparent 70%)"
                : "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
              animationDelay: "1s",
            }}
          />
        </div>

        <div className="container mx-auto py-20 text-center relative z-10">
          <div
            className="rounded-3xl shadow-2xl p-12 max-w-md mx-auto"
            style={{
              background: isDark
                ? "rgba(17, 24, 39, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              border: isDark
                ? "1px solid rgba(239, 68, 68, 0.2)"
                : "1px solid rgba(251, 146, 60, 0.2)",
            }}
          >
            <div className="text-6xl mb-4">⚠️</div>
            <p
              className={`text-lg mb-6 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Giỏ hàng trống, không có gì để thanh toán.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #ef4444, #f97316)"
                  : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderAddressSection = () => {
    if (orderData.productType === "car") {
      return (
        <div className="mb-5">
          <label
            className={`flex items-center gap-2 font-semibold mb-2 ${
              isDark ? "text-gray-200" : "text-gray-700"
            }`}
          >
            <MapPin
              className="w-5 h-5"
              style={{
                color: isDark ? "#ef4444" : "#3b82f6",
              }}
            />
            Địa điểm giao dịch
          </label>
          <div
            className={`w-full px-4 py-3 rounded-xl ${
              isDark
                ? "bg-gray-800 border-gray-700 text-gray-300"
                : "bg-gray-100 border-gray-300 text-gray-700"
            }`}
            style={{
              border: isDark
                ? "1px solid rgba(239, 68, 68, 0.3)"
                : "1px solid rgba(251, 146, 60, 0.3)",
            }}
          >
            {CAR_ADDRESS}
          </div>
        </div>
      );
    }

    return (
      <div className="mb-5 space-y-3">
        <div>
          <label
            className={`flex items-center gap-2 font-semibold mb-2 ${
              isDark ? "text-gray-200" : "text-gray-700"
            }`}
          >
            <MapPin
              className="w-5 h-5"
              style={{
                color: isDark ? "#ef4444" : "#3b82f6",
              }}
            />
            Chọn địa chỉ giao hàng
          </label>
          <select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-300 ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            style={{
              border: isDark
                ? "1px solid rgba(239, 68, 68, 0.3)"
                : "1px solid rgba(251, 146, 60, 0.3)",
              colorScheme: isDark ? "dark" : "light",
            }}
          >
            <option value="NEW">-- Nhập địa chỉ mới --</option>
            {savedAddresses.map((addr) => (
              <option key={addr.addressid} value={addr.addressid}>
                {`${addr.street}, ${addr.ward}, ${addr.district}...`}
              </option>
            ))}
          </select>
        </div>
        {selectedAddress === "NEW" && (
          <div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, đường, phường/xã..."
              className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-300 ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              style={{
                border: isDark
                  ? "1px solid rgba(239, 68, 68, 0.3)"
                  : "1px solid rgba(251, 146, 60, 0.3)",
              }}
            />
             <Button
                type="link"
                onClick={() => navigate("/profile?tab=address")}
                className="p-0 mt-2"
              >
                Quản lý sổ địa chỉ
              </Button>
          </div>
        )}
      </div>
    );
  };

  // ================== MAIN UI ==================
  return (
    <div
      className="min-h-screen pt-24 pb-8 px-4 transition-colors duration-300"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      }}
    >
      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          key={`checkout-orb-1-${isDark}`}
          className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, #ef4444 0%, transparent 70%)"
              : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          }}
        />
        <div
          key={`checkout-orb-2-${isDark}`}
          className="absolute top-1/2 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, #f97316 0%, transparent 70%)"
              : "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            animationDelay: "1s",
          }}
        />
        <div
          key={`checkout-orb-3-${isDark}`}
          className="absolute bottom-20 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, #fb923c 0%, transparent 70%)"
              : "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
            animationDelay: "2s",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 text-sm mb-6 font-medium transition-all duration-300 group px-4 py-2 rounded-xl ${
            isDark
              ? "text-gray-200 hover:text-white"
              : "text-gray-700 hover:text-gray-900"
          }`}
          style={{
            background: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.03)",
            border: isDark
              ? "1px solid rgba(239, 68, 68, 0.2)"
              : "1px solid rgba(251, 146, 60, 0.2)",
          }}
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" />
          Quay lại
        </button>

        <div className="mb-8">
          <AuroraText
            key={`checkout-title-${isDark}`}
            text="Thanh toán đơn hàng"
            colors={colors.aurora}
            speed={3}
            className="text-3xl md:text-4xl font-black"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="lg:col-span-2">
            <div
              className="rounded-3xl shadow-2xl p-8"
              style={{
                background: isDark
                  ? "rgba(17, 24, 39, 0.8)"
                  : "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(20px)",
                border: isDark
                  ? "1px solid rgba(239, 68, 68, 0.2)"
                  : "1px solid rgba(251, 146, 60, 0.2)",
              }}
            >
              <h2
                className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                <ShoppingCart
                  className="w-6 h-6"
                  style={{
                    color: isDark ? "#ef4444" : "#3b82f6",
                  }}
                />
                Sản phẩm
              </h2>
              <ul className="space-y-4">
                {orderData.items.map((item, idx) => {
                  // Handle both direct product and cart item structure
                  const product = item.product || item;
                  const quantity = item.quantity || 1;
                  const productName =
                    product.productname || product.name || "Sản phẩm";
                  const sellerName =
                    item.users?.displayname || item.users?.username || "N/A";
                  // Backend returns empty images array - use placeholder
                  const productImage =
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%231f2937' width='80' height='80'/%3E%3Ctext fill='%23fb923c' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EProduct%3C/text%3E%3C/svg%3E";

                  const productCost = product.cost || product.price || 0;

                  return (
                    <li
                      key={idx}
                      className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: isDark
                          ? "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))"
                          : "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))",
                        border: isDark
                          ? "1px solid rgba(239, 68, 68, 0.2)"
                          : "1px solid rgba(251, 146, 60, 0.2)",
                      }}
                    >
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-20 h-20 object-cover rounded-xl"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%231f2937' width='80' height='80'/%3E%3Ctext fill='%23fb923c' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EProduct%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {productName}
                        </p>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Người bán: {sellerName}
                        </p>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          SL: {quantity}
                        </p>
                        <p
                          className="font-bold"
                          style={{
                            color: isDark ? "#ef4444" : "#3b82f6",
                          }}
                        >
                          {currency(productCost)}
                          {quantity > 1 &&
                            ` × ${quantity} = ${currency(
                              productCost * quantity
                            )}`}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* FORM THANH TOÁN */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 rounded-3xl shadow-2xl p-8"
              style={{
                background: isDark
                  ? "rgba(17, 24, 39, 0.8)"
                  : "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(20px)",
                border: isDark
                  ? "1px solid rgba(239, 68, 68, 0.2)"
                  : "1px solid rgba(251, 146, 60, 0.2)",
              }}
            >
              <h2
                className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                <CheckCircle
                  className="w-6 h-6"
                  style={{
                    color: isDark ? "#f97316" : "#8b5cf6",
                  }}
                />
                Tóm tắt đơn hàng
              </h2>
              {renderAddressSection()}

              {/* Phương thức TT */}
              <div className="mb-6">
                <label
                  className={`flex items-center gap-2 font-semibold mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  <CreditCard
                    className="w-5 h-5"
                    style={{
                      color: isDark ? "#f97316" : "#8b5cf6",
                    }}
                  />
                  Thanh toán
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-300 ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  style={{
                    border: isDark
                      ? "1px solid rgba(239, 68, 68, 0.3)"
                      : "1px solid rgba(251, 146, 60, 0.3)",
                    colorScheme: isDark ? "dark" : "light",
                  }}
                >
                  <option
                    value="VNPAY"
                    style={{
                      backgroundColor: isDark ? "#1f2937" : "#ffffff",
                      color: isDark ? "#ffffff" : "#111827",
                    }}
                  >
                    Thanh toán qua VNPAY
                  </option>
                </select>
              </div>

              {/* Tổng tiền */}
              <div
                className="rounded-2xl p-4 mb-6 space-y-2"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))"
                    : "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))",
                  border: isDark
                    ? "1px solid rgba(239, 68, 68, 0.2)"
                    : "1px solid rgba(251, 146, 60, 0.2)",
                }}
              >
                <div
                  className={`flex justify-between text-lg ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  <span>Tiền hàng</span>
                  <span>{currency(orderData.total)}</span>
                </div>
                <div
                  className={`flex justify-between text-lg ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  <span>Phí vận chuyển</span>
                  <span>
                    {orderData.productType === "battery"
                      ? currency(30000)
                      : currency(0)}
                  </span>
                </div>
                <div
                  className={`flex justify-between text-xl font-bold pt-2 ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                  style={{
                    borderTop: isDark
                      ? "1px solid rgba(239, 68, 68, 0.3)"
                      : "1px solid rgba(251, 146, 60, 0.3)",
                  }}
                >
                  <span>Tổng thanh toán</span>
                  <AuroraText
                    key={`total-${isDark}`}
                    text={currency(
                      orderData.total +
                        (orderData.productType === "battery" ? 30000 : 0)
                    )}
                    colors={colors.aurora}
                    speed={2}
                    className="font-black"
                  />
                </div>
              </div>

              {/* Nút đặt hàng */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
                style={{
                  background: submitting
                    ? isDark
                      ? "rgba(239, 68, 68, 0.5)"
                      : "rgba(59, 130, 246, 0.5)"
                    : isDark
                    ? "linear-gradient(135deg, #ef4444, #f97316)"
                    : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                }}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Đặt hàng ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  Eye,
  MessageCircle,
  ShoppingCart,
  Package,
  Shield,
  TrendingUp,
  Award,
  Mail,
  Phone,
  ArrowLeft,
  Battery,
  Car,
  Calendar,
  Gauge,
  Zap,
  MapPin,
  X,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ChatModal from "../../chat/components/ChatModal";
import PriceSuggestionModal from "../../../components/common/PriceSuggestionModal";
import { useUser } from "../../../contexts/UserContext.jsx";
import { useTheme } from "../../../contexts/ThemeContext.jsx";
import { getProductById } from "../../../utils/services/productService";
import { useCart } from "../../../hooks/useCart";
import AuroraText from "../../../components/common/AuroraText";

// 🎨 COLOR SYSTEM - Sync with Home.jsx
const THEME_COLORS = {
  dark: {
    primary: ["#ef4444", "#f97316"],
    aurora: ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"],
    border: "rgba(239, 68, 68, 0.2)",
    hoverOverlay:
      "linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(249, 115, 22, 0.3))",
  },
  light: {
    primary: ["#3b82f6", "#8b5cf6"],
    aurora: ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#3b82f6"],
    border: "rgba(59, 130, 246, 0.3)",
    hoverOverlay:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))",
  },
};

function currency(value) {
  return value.toLocaleString("vi-VN") + " ₫";
}

// === HÀM KIỂM TRA ĐĂNG NHẬP CHUNG ===
const requireAuth = (action) => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error(`Vui lòng đăng nhập để ${action}`);
    return false;
  }
  return true;
};

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { addToCart: addToCartHook, loading: cartLoading } = useCart();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [aiPriceSuggestion, setAiPriceSuggestion] = useState(null);
  const [loadingAiPrice, setLoadingAiPrice] = useState(false);
  const { user: currentUser } = useUser();

  // Get theme colors dynamically
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        setItem(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isOwner = currentUser && item?.seller?.sellerId === currentUser.userId;

  // === GỌI AI GỢI Ý GIÁ ===
  const handleAiPriceSuggestion = async () => {
    if (!requireAuth("sử dụng AI gợi ý giá")) return;

    setLoadingAiPrice(true);
    setAiPriceSuggestion(null);

    try {
      const requestData = {
        productType: item.product.type,
        brand: item.product.brandInfo?.brand || "",
        model: item.product.brandInfo?.model || item.product.productname,
        year: item.product.brandInfo?.year || new Date().getFullYear(),
        condition: "Good", // Default
      };

      // Thêm fields theo loại sản phẩm
      if (item.product.type === "Battery") {
        if (item.product.brandInfo?.capacity) {
          requestData.capacityKwh = parseFloat(item.product.brandInfo.capacity);
        }
        if (item.product.brandInfo?.cycleCount) {
          requestData.cycleCount = parseInt(item.product.brandInfo.cycleCount);
        }
      } else if (item.product.type === "Car EV") {
        if (item.product.brandInfo?.mileage) {
          requestData.mileageKm = parseInt(item.product.brandInfo.mileage);
        }
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8080"
        }/api/buyer/ai/suggest-price`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.status === 429) {
        toast.error(
          "Bạn đã vượt quá giới hạn 10 lần gọi/phút. Vui lòng thử lại sau."
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Không thể lấy gợi ý giá từ AI");
      }

      const data = await response.json();

      if (data.status === "success") {
        setAiPriceSuggestion(data.priceSuggestion);
        setIsPriceModalOpen(true); // Mở modal hiển thị kết quả
        toast.success("Đã nhận gợi ý giá từ AI!");
      } else {
        toast.error(data.message || "Không thể lấy gợi ý giá");
      }
    } catch (error) {
      console.error("AI Price Error:", error);
      toast.error("Không thể kết nối với AI. Vui lòng thử lại sau.");
    } finally {
      setLoadingAiPrice(false);
    }
  };

  const handleAction = async (action) => {
    try {
      // 1. MUA NGAY
      if (action === "buy") {
        if (!requireAuth("mua hàng")) return;
        navigate(`/checkout/${id}`, {
          state: { productType: item.product.type },
        });
      }

      // 2. THÊM VÀO GIỎ HÀNG
      else if (action === "cart") {
        if (!requireAuth("thêm vào giỏ hàng")) return;

        // XE KHÔNG THỂ THÊM VÀO GIỎ HÀNG
        if (item.product.type === "Car EV") {
          toast.error(
            "Xe điện không thể thêm vào giỏ hàng. Vui lòng mua ngay!"
          );
          return;
        }

        try {
          await addToCartHook(id, 1);
          console.log(id);
          toast.success("Đã thêm vào giỏ hàng thành công!");
        } catch {
          toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
        }
      }

      // 3. LIÊN HỆ (CHAT)
      else if (action === "chat") {
        if (!item?.seller?.sellerId) {
          toast.error("Không tìm thấy thông tin người bán");
          return;
        }
        if (!requireAuth("liên hệ người bán")) return;
        setIsChatModalOpen(true);
      }

      // 4. YÊU THÍCH
      else if (action === "favorite") {
        if (!requireAuth("lưu sản phẩm")) return;
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? "Đã bỏ lưu" : "Đã lưu sản phẩm!");
      }

      // 5. XEM ẢNH CHI TIẾT
      else if (action === "viewImage") {
        setSelectedImage(action.index);
      }

      // 6. XEM HỒ SƠ NGƯỜI BÁN → BỎ requireAuth
      else if (action === "viewSeller") {
        navigate(`/seller/${item.seller.sellerId}`); // ← ĐÚNG ĐƯỜNG DẪN
      }
    } catch (error) {
      console.error("Error in handleAction:", error);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  // === LOADING & ERROR UI ===
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
          isDark ? "bg-gray-950" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div
            className="inline-block w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: colors.primary[0],
              borderTopColor: "transparent",
            }}
          />
          <p
            className={`mt-4 text-lg font-medium ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Đang tải sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  if (error || !item || item.status !== "success") {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
          isDark ? "bg-gray-950" : "bg-gray-50"
        }`}
      >
        <div
          className="rounded-3xl p-12 max-w-md text-center"
          style={{
            background: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            border: `2px solid ${colors.border}`,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="text-6xl mb-4">⚠️</div>
          <p
            className={`text-lg mb-6 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {error || "Không tìm thấy sản phẩm"}
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-3 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
              boxShadow: isDark
                ? "0 10px 40px rgba(239, 68, 68, 0.4)"
                : "0 10px 40px rgba(59, 130, 246, 0.4)",
            }}
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // === RENDER CHÍNH ===
  return (
    <div
      className={`pt-20 min-h-screen py-12 transition-colors duration-500 ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      {/* Floating gradient orbs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(239, 68, 68, 0.3), transparent)"
              : "radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(249, 115, 22, 0.3), transparent)"
              : "radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Breadcrumb */}
        <Link
          to="/"
          className={`inline-flex items-center gap-2 mb-8 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
          style={{
            background: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            border: `2px solid ${colors.border}`,
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại trang chủ
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: HÌNH ẢNH + CHI TIẾT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ảnh chính với Glassmorphism */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(20px)",
                border: `2px solid ${colors.border}`,
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                className="relative group cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
              >
                <img
                  src={
                    item.product.images[selectedImage] ||
                    "/placeholder-image.jpg"
                  }
                  alt={item.product.productname}
                  className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient Overlay on Hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{
                    background: colors.hoverOverlay,
                  }}
                >
                  <div
                    className="px-6 py-3 rounded-full text-white font-bold flex items-center gap-2"
                    style={{
                      background: "rgba(0, 0, 0, 0.6)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Eye className="w-5 h-5" />
                    Xem ảnh toàn màn hình
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  {item.product.inWarehouse && (
                    <span
                      className="px-4 py-2 rounded-full text-sm font-bold text-white flex items-center gap-2 shadow-lg animate-pulse"
                      style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                      }}
                    >
                      <Package className="w-4 h-4" />
                      Sẵn hàng trong kho
                    </span>
                  )}
                  <span
                    className="px-4 py-2 rounded-full text-sm font-bold text-white flex items-center gap-2 shadow-lg"
                    style={{
                      background:
                        item.product.type === "Car EV"
                          ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                          : "linear-gradient(135deg, #8b5cf6, #a855f7)",
                    }}
                  >
                    {item.product.type === "Car EV" ? (
                      <Car className="w-4 h-4" />
                    ) : (
                      <Battery className="w-4 h-4" />
                    )}
                    {item.product.type === "Car EV" ? "Xe điện" : "Pin"}
                  </span>
                </div>

                {/* Yêu thích Button */}
                <button
                  onClick={() => handleAction("favorite")}
                  className="absolute right-6 top-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Heart
                    className={`w-6 h-6 transition ${
                      isFavorite
                        ? "fill-red-500 text-red-500"
                        : isDark
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  />
                </button>
              </div>

              {/* Thumbnails */}
              {item.product.images.length > 1 && (
                <div
                  className="p-6 flex gap-3 overflow-x-auto"
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  {item.product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden transition-all duration-300 hover:scale-110"
                      style={{
                        border:
                          selectedImage === idx
                            ? `3px solid ${colors.primary[0]}`
                            : isDark
                            ? "2px solid rgba(255, 255, 255, 0.1)"
                            : "2px solid rgba(0, 0, 0, 0.1)",
                        boxShadow:
                          selectedImage === idx
                            ? `0 0 20px ${colors.primary[0]}40`
                            : "none",
                      }}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chi tiết sản phẩm với Glassmorphism */}
            <div
              className="rounded-3xl p-8"
              style={{
                background: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(20px)",
                border: `2px solid ${colors.border}`,
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h2 className="text-2xl font-bold mb-6">
                <AuroraText
                  key={`product-detail-${isDark}`}
                  text="Chi Tiết Sản Phẩm"
                  colors={colors.aurora}
                  speed={2}
                  className="text-2xl font-bold"
                />
              </h2>

              <div className="space-y-4">
                {/* Mô tả */}
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(59, 130, 246, 0.05)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Shield
                      className="w-6 h-6 mt-1 flex-shrink-0"
                      style={{ color: colors.primary[0] }}
                    />
                    <div>
                      <p
                        className={`font-semibold mb-2 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Mô tả sản phẩm
                      </p>
                      <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                        {item.product.description || "Không có mô tả."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thông tin chi tiết */}
                {item.product.brandInfo && (
                  <div
                    className="p-6 rounded-2xl"
                    style={{
                      background: isDark
                        ? "rgba(255, 255, 255, 0.03)"
                        : "rgba(139, 92, 246, 0.05)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Award
                        className="w-6 h-6 mt-1 flex-shrink-0"
                        style={{ color: colors.primary[1] }}
                      />
                      <div className="flex-1">
                        <p
                          className={`font-semibold mb-3 ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Thông tin chi tiết
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p
                              className={`text-sm ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Thương hiệu
                            </p>
                            <p
                              className={`font-medium ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {item.product.brandInfo.brand}
                            </p>
                          </div>
                          {item.product.type === "Car EV" ? (
                            <>
                              <div>
                                <p
                                  className={`text-sm ${
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  Năm sản xuất
                                </p>
                                <p
                                  className={`font-medium ${
                                    isDark ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {item.product.brandInfo.year}
                                </p>
                              </div>
                              {item.product.brandInfo.licensePlate && (
                                <div>
                                  <p
                                    className={`text-sm ${
                                      isDark ? "text-gray-400" : "text-gray-500"
                                    }`}
                                  >
                                    Biển số
                                  </p>
                                  <p
                                    className={`font-medium ${
                                      isDark ? "text-white" : "text-gray-900"
                                    }`}
                                  >
                                    {item.product.brandInfo.licensePlate}
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div>
                                <p
                                  className={`text-sm ${
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  Dung lượng
                                </p>
                                <p
                                  className={`font-medium ${
                                    isDark ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {item.product.brandInfo.capacity} kWh
                                </p>
                              </div>
                              {item.product.brandInfo.condition && (
                                <div>
                                  <p
                                    className={`text-sm ${
                                      isDark ? "text-gray-400" : "text-gray-500"
                                    }`}
                                  >
                                    Tình trạng
                                  </p>
                                  <p
                                    className={`font-medium ${
                                      isDark ? "text-white" : "text-gray-900"
                                    }`}
                                  >
                                    {item.product.brandInfo.condition}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Đánh giá */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(20px)",
                border: `2px solid ${colors.border}`,
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <AuroraText
                  key={`reviews-${isDark}`}
                  text="Đánh giá từ người mua"
                  className="text-2xl font-bold"
                  colors={colors.aurora}
                  speed={2}
                />
              </div>
              {item.feedbacks.length > 0 ? (
                <ul className="space-y-4">
                  {item.feedbacks.map((review, i) => (
                    <li
                      key={i}
                      className="p-5 rounded-xl"
                      style={{
                        background: isDark
                          ? "rgba(255, 255, 255, 0.03)"
                          : "rgba(59, 130, 246, 0.05)",
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                            }}
                          >
                            {review.buyer.buyerName[0].toUpperCase()}
                          </div>
                          <span
                            className={`font-semibold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {review.buyer.buyerName}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                          {[...Array(5 - review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gray-300" />
                          ))}
                        </div>
                      </div>
                      <p
                        className={
                          isDark ? "text-gray-300 mb-2" : "text-gray-700 mb-2"
                        }
                      >
                        {review.comment || "Không có bình luận."}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Star
                    className="w-16 h-16 mx-auto mb-3"
                    style={{ color: isDark ? "#374151" : "#d1d5db" }}
                  />
                  <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                    Chưa có đánh giá nào.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: GIÁ + HÀNH ĐỘNG */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div
                className="rounded-2xl p-8"
                style={{
                  background: isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(20px)",
                  border: `2px solid ${colors.border}`,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h1
                  className={`text-2xl font-bold mb-4 line-clamp-2 ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {item.product.productname}
                </h1>
                <div
                  className="text-white text-3xl font-bold p-6 rounded-xl text-center mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                    boxShadow: `0 10px 40px ${
                      isDark
                        ? "rgba(239, 68, 68, 0.3)"
                        : "rgba(59, 130, 246, 0.3)"
                    }`,
                  }}
                >
                  {currency(item.product.cost)}
                </div>

                {/* NÚT HÀNH ĐỘNG */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleAction("buy")}
                    className="w-full text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl transform hover:scale-105 transition"
                    style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                    }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Mua ngay
                  </button>

                  {item.product.type === "Battery" && (
                    <button
                      onClick={() => handleAction("cart")}
                      className="w-full text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl transform hover:scale-105 transition"
                      style={{
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      }}
                      disabled={cartLoading}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartLoading ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                    </button>
                  )}

                  {!isOwner && (
                    <button
                      onClick={() => handleAction("chat")}
                      className="w-full text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                      }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Liên hệ ngay
                    </button>
                  )}

                  {/* AI Price Suggestion Button - GỌI TRỰC TIẾP */}
                  {!isOwner && (
                    <button
                      onClick={handleAiPriceSuggestion}
                      disabled={loadingAiPrice}
                      className="w-full text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                      }}
                    >
                      {loadingAiPrice ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang phân tích...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          AI Gợi ý giá
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Thống kê */}
                <div
                  className="flex items-center justify-around py-4 text-sm"
                  style={{
                    borderTop: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-yellow-500 mb-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span
                        className={`font-bold text-lg ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                      {item.totalReviews} đánh giá
                    </p>
                  </div>
                  <div
                    className="w-px h-12"
                    style={{ background: colors.border }}
                  ></div>
                  <div className="text-center">
                    <div
                      className="flex items-center gap-1 mb-1"
                      style={{ color: colors.primary[0] }}
                    >
                      <Eye className="w-5 h-5" />
                      <span
                        className={`font-bold text-lg ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.viewCount}
                      </span>
                    </div>
                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                      Lượt xem
                    </p>
                  </div>
                </div>
              </div>

              {/* Người bán */}
              <div
                className="rounded-2xl p-8"
                style={{
                  background: isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(20px)",
                  border: `2px solid ${colors.border}`,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3
                  key={`seller-title-${isDark}`}
                  className="text-xl font-bold mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Thông tin người bán
                </h3>
                <button
                  onClick={() => handleAction("viewSeller")}
                  className="w-full text-left flex items-center gap-4 p-4 rounded-xl mb-6 group hover:shadow-md transition"
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(59, 130, 246, 0.05)",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full text-white font-bold text-2xl flex items-center justify-center group-hover:scale-110 transition"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                    }}
                  >
                    {item.seller.displayName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold truncate transition ${
                        isDark
                          ? "text-white group-hover:text-orange-400"
                          : "text-gray-800 group-hover:text-blue-600"
                      }`}
                    >
                      {item.seller.displayName}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">
                        {item.averageRating.toFixed(1)}
                      </span>
                      <span
                        className={isDark ? "text-gray-400" : "text-gray-500"}
                      >
                        ({item.totalReviews})
                      </span>
                    </div>
                  </div>
                </button>
                <div className="space-y-3 text-sm">
                  <div
                    className={`flex items-center gap-3 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <Mail
                      className="w-5 h-5"
                      style={{ color: colors.primary[0] }}
                    />
                    <span>{item.seller.email}</span>
                  </div>
                  <div
                    className={`flex items-center gap-3 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <Phone
                      className="w-5 h-5"
                      style={{ color: colors.primary[1] }}
                    />
                    <span>{item.seller.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Trust */}
              <div
                className="rounded-2xl p-6 text-white"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                  boxShadow: `0 10px 40px ${
                    isDark
                      ? "rgba(239, 68, 68, 0.3)"
                      : "rgba(59, 130, 246, 0.3)"
                  }`,
                }}
              >
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6" />
                    <span className="font-semibold">Thanh toán an toàn</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6" />
                    <span className="font-semibold">Giao hàng nhanh</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6" />
                    <span className="font-semibold">Chất lượng đảm bảo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Image Modal */}
        {isImageModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "rgba(0, 0, 0, 0.95)",
              backdropFilter: "blur(10px)",
            }}
            onClick={() => setIsImageModalOpen(false)}
          >
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <img
              src={item.product.images[selectedImage]}
              alt={item.product.productname}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image Counter */}
            <div
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-white font-bold"
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(10px)",
              }}
            >
              {selectedImage + 1} / {item.product.images.length}
            </div>

            {/* Navigation Arrows */}
            {item.product.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((prev) =>
                      prev === 0 ? item.product.images.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((prev) =>
                      prev === item.product.images.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <ArrowLeft className="w-6 h-6 text-white transform rotate-180" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-40 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
              boxShadow: isDark
                ? "0 10px 40px rgba(239, 68, 68, 0.5)"
                : "0 10px 40px rgba(59, 130, 246, 0.5)",
            }}
          >
            <ArrowLeft className="w-6 h-6 text-white transform rotate-90" />
          </button>
        )}
      </div>
      <ChatModal
        open={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        sellerId={item?.seller?.sellerId}
        sellerName={item?.seller?.displayName || item?.seller?.username}
      />

      {/* AI Price Suggestion Modal - CHỈ HIỂN THỊ KẾT QUẢ */}
      <PriceSuggestionModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        suggestion={aiPriceSuggestion}
      />
    </div>
  );
}

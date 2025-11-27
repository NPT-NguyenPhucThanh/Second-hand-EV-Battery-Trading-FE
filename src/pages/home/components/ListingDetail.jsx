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
import { useCart } from "../../../hooks/useCart";
import AuroraText from "../../../components/common/AuroraText";

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
  const { user: currentUser } = useUser();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [aiPriceSuggestion, setAiPriceSuggestion] = useState(null);
  const [loadingAiPrice, setLoadingAiPrice] = useState(false);

  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8080"
          }/api/products/${id}`,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );

        if (!res.ok) throw new Error("Không thể tải sản phẩm");

        const data = await res.json();

        // Chuẩn hóa dữ liệu về dạng cũ để component không phải sửa nhiều
        const normalized = {
          status: "success",
          product: {
            ...data.product,
            images: data.product.imgs?.map((img) => img.url) || [],
            brandInfo:
              data.product.brandcars || data.product.brandbattery || {},
          },
          seller: {
            sellerId: data.product.users.userid,
            displayName: data.product.users.displayname,
            email: data.product.users.email,
            phone: data.product.users.phone,
          },
          feedbacks: data.feedbacks || [],
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
          viewCount: data.product.viewCount || 0,
        };

        setItem(normalized);
      } catch (err) {
        setError(err.message || "Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [id]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isOwner =
    currentUser?.userId && item?.seller?.sellerId === currentUser.userId;
  const isApprovedPost = item?.product?.status === "DANG_BAN";

  // AI gợi ý giá
  const handleAiPriceSuggestion = async () => {
    if (!requireAuth("sử dụng AI gợi ý giá")) return;

    setLoadingAiPrice(true);
    setAiPriceSuggestion(null);

    try {
      const brandInfo = item.product.brandInfo || {};
      const requestData = {
        productType: item.product.type,
        brand:
          brandInfo.brand ||
          item.product.productname.split(" ")[0] ||
          "Unknown",
        model:
          brandInfo.model || item.product.model || item.product.productname,
        year: brandInfo.year || new Date().getFullYear(),
        condition: "Good",
      };

      if (item.product.type === "Battery" && brandInfo.capacity) {
        requestData.capacityKwh = parseFloat(brandInfo.capacity);
        if (brandInfo.cycleCount)
          requestData.cycleCount = parseInt(brandInfo.cycleCount);
      } else if (item.product.type === "Car EV" && brandInfo.odo) {
        requestData.mileageKm = parseInt(brandInfo.odo);
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
          "Bạn đã vượt quá giới hạn 10 lần/phút. Thử lại sau ít phút."
        );
        return;
      }

      if (!response.ok) throw new Error("Không thể lấy gợi ý giá");

      const data = await response.json();
      if (data.status === "success") {
        setAiPriceSuggestion(data.priceSuggestion);
        setIsPriceModalOpen(true);
        toast.success("AI đã gợi ý giá thành công!");
      } else {
        toast.error(data.message || "Lỗi từ AI");
      }
    } catch (err) {
      toast.error("Không thể kết nối đến AI. Vui lòng thử lại.");
    } finally {
      setLoadingAiPrice(false);
    }
  };

  const handleAction = (action) => {
    if (action === "buy") {
      if (!requireAuth("mua hàng")) return;
      navigate(`/checkout/${id}`, {
        state: { productType: item.product.type },
      });
    } else if (action === "cart") {
      if (!requireAuth("thêm vào giỏ hàng")) return;
      if (item.product.type === "Car EV") {
        toast.error("Xe điện không thể thêm vào giỏ. Vui lòng mua ngay!");
        return;
      }
      addToCartHook(id, 1)
        .then(() => toast.success("Đã thêm vào giỏ hàng!"))
        .catch(() => toast.error("Thêm giỏ hàng thất bại"));
    } else if (action === "chat") {
      if (!requireAuth("chat với người bán")) return;
      setIsChatModalOpen(true);
    } else if (action === "viewSeller") {
      navigate(`/seller/${item.seller.sellerId}`);
    }
  };

  // Loading
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-950" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin inline-block"
            style={{
              borderColor: colors.primary[0],
              borderTopColor: "transparent",
            }}
          />
          <p
            className={`mt-4 text-lg ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Đang tải sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  // Error hoặc không tìm thấy
  if (error || !item) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-950" : "bg-gray-50"
        }`}
      >
        <div
          className="rounded-3xl p-12 max-w-md text-center glass"
          style={{ border: `2px solid ${colors.border}` }}
        >
          <div className="text-6xl mb-4">Warning</div>
          <p
            className={`text-lg mb-6 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {error || "Không tìm thấy sản phẩm"}
          </p>
          <Link
            to="/"
            className="px-8 py-3 rounded-2xl font-bold text-white inline-block"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
            }}
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pt-20 min-h-screen py-12 ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      {/* Floating orbs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(239,68,68,0.3), transparent)"
              : "radial-gradient(circle, rgba(59,130,246,0.3), transparent)",
          }}
        />
        <div
          className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(249,115,22,0.3), transparent)"
              : "radial-gradient(circle, rgba(139,92,246,0.3), transparent)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-8 px-6 py-3 rounded-xl font-bold glass"
          style={{ border: `2px solid ${colors.border}` }}
        >
          <ArrowLeft className="w-5 h-5" /> Quay lại trang chủ
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT - IMAGES & DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div
              className="rounded-3xl overflow-hidden glass"
              style={{ border: `2px solid ${colors.border}` }}
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
                  className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ background: colors.hoverOverlay }}
                >
                  <div className="px-6 py-3 rounded-full bg-black/60 backdrop-blur text-white font-bold flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Xem ảnh toàn màn hình
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
                      <Package className="w-4 h-4" /> Sẵn hàng
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
              </div>

              {/* Thumbnails */}
              {item.product.images.length > 1 && (
                <div className="p-6 flex gap-3 overflow-x-auto">
                  {item.product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden transition-all hover:scale-110"
                      style={{
                        border:
                          selectedImage === idx
                            ? `3px solid ${colors.primary[0]}`
                            : "2px solid rgba(255,255,255,0.1)",
                        boxShadow:
                          selectedImage === idx
                            ? `0 0 20px ${colors.primary[0]}40`
                            : "none",
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div
              className="rounded-3xl p-8 glass space-y-6"
              style={{ border: `2px solid ${colors.border}` }}
            >
              <AuroraText
                text="Chi Tiết Sản Phẩm"
                colors={colors.aurora}
                className="text-2xl font-bold"
              />

              <div className="space-y-6">
                {/* Mô tả */}
                <div className="p-6 rounded-2xl glass-light">
                  <div className="flex items-start gap-3">
                    <Shield
                      className="w-6 h-6 mt-1"
                      style={{ color: colors.primary[0] }}
                    />
                    <div>
                      <p className="font-semibold mb-2">Mô tả</p>
                      <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                        {item.product.description || "Không có mô tả."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specs */}
                {item.product.specs && (
                  <div className="p-6 rounded-2xl glass-light">
                    <div className="flex items-start gap-3">
                      <Zap
                        className="w-6 h-6 mt-1"
                        style={{ color: colors.primary[1] }}
                      />
                      <div>
                        <p className="font-semibold mb-2">Thông số kỹ thuật</p>
                        <p
                          className={isDark ? "text-gray-300" : "text-gray-600"}
                        >
                          {item.product.specs}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thông tin thương hiệu */}
                {item.product.brandInfo &&
                  Object.keys(item.product.brandInfo).length > 0 && (
                    <div className="p-6 rounded-2xl glass-light">
                      <div className="flex items-start gap-3">
                        <Award
                          className="w-6 h-6 mt-1"
                          style={{ color: colors.primary[1] }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold mb-3">
                            Thông tin chi tiết
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {item.product.brandInfo.brand && (
                              <>
                                <div>Thương hiệu</div>
                                <div className="font-medium">
                                  {item.product.brandInfo.brand}
                                </div>
                              </>
                            )}
                            {item.product.type === "Car EV" ? (
                              <>
                                {item.product.brandInfo.year && (
                                  <>
                                    <div>Năm sản xuất</div>
                                    <div className="font-medium">
                                      {item.product.brandInfo.year}
                                    </div>
                                  </>
                                )}
                                {item.product.brandInfo.licensePlate && (
                                  <>
                                    <div>Biển số</div>
                                    <div className="font-medium">
                                      {item.product.brandInfo.licensePlate}
                                    </div>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {item.product.brandInfo.capacity && (
                                  <>
                                    <div>Dung lượng</div>
                                    <div className="font-medium">
                                      {item.product.brandInfo.capacity} kWh
                                    </div>
                                  </>
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

            {/* Reviews */}
            <div
              className="rounded-3xl p-8 glass"
              style={{ border: `2px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <AuroraText
                  text="Đánh giá từ người mua"
                  colors={colors.aurora}
                  className="text-2xl font-bold"
                />
              </div>
              {item.feedbacks.length > 0 ? (
                <ul className="space-y-4">
                  {item.feedbacks.map((r, i) => (
                    <li
                      key={i}
                      className="p-5 rounded-xl glass-light border"
                      style={{ borderColor: colors.border }}
                    >
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-full text-white font-bold flex-center"
                            style={{
                              background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                            }}
                          >
                            {r.buyer?.buyerName?.[0]?.toUpperCase() || "U"}
                          </div>
                          <span className="font-semibold">
                            {r.buyer?.buyerName || "Ẩn danh"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                      <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                        {r.comment || "Không có bình luận"}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Chưa có đánh giá nào
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

                  {!isOwner && isApprovedPost && (
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
                  {!isOwner && isApprovedPost && (
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
                <div
                  className="flex items-center justify-around py-4 mt-6 border-t"
                  style={{ borderColor: colors.border }}
                >
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-lg font-bold">
                        {item.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {item.totalReviews} đánh giá
                    </p>
                  </div>
                  <div
                    className="w-px h-12"
                    style={{ background: colors.border }}
                  />
                  <div className="text-center">
                    <div
                      className="flex items-center gap-1"
                      style={{ color: colors.primary[0] }}
                    >
                      <Eye className="w-5 h-5" />
                      <span className="text-lg font-bold">
                        {item.viewCount}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Lượt xem</p>
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

              {/* Trust Badges */}
              <div
                className="rounded-3xl p-6 text-white"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                }}
              >
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6" /> Thanh toán an toàn
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6" /> Giao hàng nhanh
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6" /> Chất lượng đảm bảo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Image Modal */}
        {isImageModalOpen && (
          <div
            className="fixed inset-0 z-50 flex-center p-4 bg-black/95 backdrop-blur"
            onClick={() => setIsImageModalOpen(false)}
          >
            <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur flex-center">
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={item.product.images[selectedImage]}
              alt=""
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 px-6 py-3 rounded-full bg-black/60 backdrop-blur text-white font-bold">
              {selectedImage + 1} / {item.product.images.length}
            </div>
          </div>
        )}

        {/* Scroll to Top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex-center shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
            }}
          >
            <ArrowLeft className="w-6 h-6 text-white rotate-90" />
          </button>
        )}
      </div>

      <ChatModal
        open={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        sellerId={item?.seller?.sellerId}
        sellerName={item?.seller?.displayName}
      />
      <PriceSuggestionModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        suggestion={aiPriceSuggestion}
      />
    </div>
  );
}

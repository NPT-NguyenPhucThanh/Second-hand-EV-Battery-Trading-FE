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
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ChatModal from "../../chat/components/ChatModal";
import { useUser } from "../../../contexts/UserContext.jsx";
import { getProductById } from "../../../utils/services/productService";
import api from "../../../utils/api";
import { useCart } from "../../../hooks/useCart";

function currency(value) {
  return value.toLocaleString("vi-VN") + " ₫";
}

// === HÀM KIỂM TRA ĐĂNG NHẬP CHUNG ===
const requireAuth = (action, callback) => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error(`Vui lòng đăng nhập để ${action}`);
    return false;
  }
  return true;
};

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); // ← CHỈ 1 DÒNG
  const { addToCart: addToCartHook, loading: cartLoading } = useCart();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const { user: currentUser } = useUser();

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

  const isOwner = currentUser && item?.seller?.sellerId === currentUser.userId;

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

        try {
          await addToCartHook(id, 1);
          toast.success("Đã thêm vào giỏ hàng thành công!");
        } catch (err) {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !item || item.status !== "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">Warning</div>
          <p className="text-gray-700 text-lg mb-6">
            {error || "Không tìm thấy sản phẩm"}
          </p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-blue-500 to-green-400 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // === RENDER CHÍNH ===
  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-green-500 text-sm mb-6 font-medium transition group"
        >
          <span className="transform group-hover:-translate-x-1 transition">
            Back
          </span>
          <span className="ml-2">Quay lại trang chủ</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: HÌNH ẢNH + CHI TIẾT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ảnh chính */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative group">
                <img
                  src={
                    item.product.images[selectedImage] ||
                    "/placeholder-image.jpg"
                  }
                  alt={item.product.productname}
                  className="w-full h-96 object-cover group-hover:scale-105 transition duration-500"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {item.product.inWarehouse && (
                    <span className="bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                      <Package className="w-4 h-4" />
                      Sẵn hàng
                    </span>
                  )}
                  <span className="bg-gradient-to-r from-blue-500 to-green-400 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Hot Deal
                  </span>
                </div>
                {/* Yêu thích */}
                <button
                  onClick={() => handleAction("favorite")}
                  className="absolute right-4 top-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:scale-110 transition"
                >
                  <Heart
                    className={`w-6 h-6 transition ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
                    }`}
                  />
                </button>
              </div>

              {/* Thumbnails */}
              {item.product.images.length > 1 && (
                <div className="p-4 bg-gray-50 flex gap-3 overflow-x-auto">
                  {item.product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleAction({ action: "viewImage", index: idx })
                      }
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === idx
                          ? "border-blue-500 shadow-lg scale-110"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
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

            {/* Mô tả */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                Chi tiết sản phẩm
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Mô tả</p>
                    <p className="text-gray-600">
                      {item.product.description || "Không có mô tả."}
                    </p>
                  </div>
                </div>

                {item.product.brandInfo && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                    <Award className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">
                        Thông tin
                      </p>
                      <p className="text-gray-600">
                        {item.product.type === "Car EV"
                          ? `${item.product.brandInfo.brand} ${
                              item.product.brandInfo.year
                            } - Biển số: ${
                              item.product.brandInfo.licensePlate || "N/A"
                            }`
                          : `${item.product.brandInfo.brand} - Dung lượng: ${
                              item.product.brandInfo.capacity
                            } - Tình trạng: ${
                              item.product.brandInfo.condition || "N/A"
                            }`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Đánh giá */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                Đánh giá từ người mua
              </h2>
              {item.feedbacks.length > 0 ? (
                <ul className="space-y-4">
                  {item.feedbacks.map((review, i) => (
                    <li
                      key={i}
                      className="p-5 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100"
                    >
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-400 text-white font-bold flex items-center justify-center">
                            {review.buyer.buyerName[0].toUpperCase()}
                          </div>
                          <span className="font-semibold">
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
                      <p className="text-gray-700 mb-2">
                        {review.comment || "Không có bình luận."}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  Chưa có đánh giá nào.
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: GIÁ + HÀNH ĐỘNG */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 line-clamp-2">
                  {item.product.productname}
                </h1>
                <div className="bg-gradient-to-r from-blue-500 to-green-400 text-white text-3xl font-bold p-6 rounded-xl text-center mb-6">
                  {currency(item.product.cost)}
                </div>

                {/* NÚT HÀNH ĐỘNG */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleAction("buy")}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl transform hover:scale-105 transition"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Mua ngay
                  </button>

                  {item.product.type === "Battery" && (
                    <button
                      onClick={() => handleAction("cart")}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl transform hover:scale-105 transition"
                      disabled={cartLoading}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartLoading ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                    </button>
                  )}

                  {!isOwner && (
                    <button
                      onClick={() => handleAction("chat")}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Liên hệ ngay
                    </button>
                  )}
                </div>

                {/* Thống kê */}
                <div className="flex items-center justify-around py-4 border-t border-gray-200 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-yellow-500 mb-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold text-lg">
                        {item.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-gray-500">
                      {item.totalReviews} đánh giá
                    </p>
                  </div>
                  <div className="w-px h-12 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-blue-600 mb-1">
                      <Eye className="w-5 h-5" />
                      <span className="font-bold text-lg">
                        {item.viewCount}
                      </span>
                    </div>
                    <p className="text-gray-500">Lượt xem</p>
                  </div>
                </div>
              </div>

              {/* Người bán */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                  Thông tin người bán
                </h3>
                <button
                  onClick={() => handleAction("viewSeller")}
                  className="w-full text-left flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl mb-6 group hover:shadow-md transition"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-green-400 text-white font-bold text-2xl flex items-center justify-center group-hover:scale-110 transition">
                    {item.seller.displayName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate group-hover:text-blue-600 transition">
                      {item.seller.displayName}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">
                        {item.averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({item.totalReviews})
                      </span>
                    </div>
                  </div>
                </button>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span>{item.seller.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5 text-green-500" />
                    <span>{item.seller.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Trust */}
              <div className="bg-blue-400 rounded-2xl shadow-xl p-6 text-white">
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
      </div>
      <ChatModal
        open={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        sellerId={item?.seller?.sellerId}
        sellerName={item?.seller?.displayName || item?.seller?.username}
      />
    </div>
  );
}
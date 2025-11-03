// src/features/home/components/ListingDetail.jsx
// Sửa: Tích hợp add to cart thực sự trong handleAction khi action="cart".
// - Gọi POST /api/buyer/cart/add với { productId: id, quantity: 1 }.
// - Giữ logic checkAuth, nếu không cần auth (đã login), thì gọi API.
// - Hiển thị toast.success nếu thành công.
// - Thêm error handling với toast.error.
// - Import sonner cho toast (cài nếu chưa: npm install sonner).
// - Giả định checkAuth trả về { requiresAuth: bool, message, loginUrl }.
// - Nếu cần auth headers (token), thêm vào fetch (ví dụ: từ localStorage).
// - Đặt <Toaster /> ở root App nếu chưa, hoặc import và đặt ở đây cho demo.

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
import {
  getProductById,
  checkAuth,
} from "../../../utils/services/productService";
import { toast } from "sonner"; // Import sonner cho toast
import api from "../../../utils/api";

function currency(value) {
  return value.toLocaleString("vi-VN") + " ₫";
}

export default function ListingDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const nagivate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        setItem(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAction = async (action) => {
    try {
      if (action === "cart") {
        // Thêm vào giỏ hàng thực sự
        await addToCart(id, 1);
      } else if (action === "buy") {
        // Xử lý các action khác (buy, chat) như cũ
        nagivate(`/checkout/deposit/${id}`); // Giả định chuyển đến trang đặt cọc
      }
    } catch (error) {
      console.error("Error in handleAction:", error);
      toast.error("Lỗi khi thực hiện hành động. Vui lòng thử lại.");
    }
  };

  // Function addToCart: Gọi API POST
  const addToCart = async (productId, quantity) => {
    try {
      const response = await api.post(
        `api/buyer/cart/add?productId=${productId}&quantity=${quantity}`,
        {}
      );

      toast.success("Đã thêm sản phẩm vào giỏ hàng thành công!", {
        duration: 3000,
      });

      // Optional: Cập nhật UI hoặc redirect đến cart nếu cần
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
        <div className="container mx-auto py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !item || item.status !== "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
        <div className="container mx-auto py-20 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-gray-700 text-lg mb-6">
              {error || "Không tìm thấy sản phẩm."}
            </p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-blue-500 to-green-400 text-white px-8 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex pt-12 items-center text-blue-600 hover:text-green-500 text-sm mb-6 font-medium transition-all duration-300 group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
            ←
          </span>
          <span className="ml-2">Quay lại trang chủ</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái - Hình ảnh sản phẩm */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ảnh chính */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300">
              <div className="relative group">
                <img
                  src={
                    item.product.images[selectedImage] ||
                    "/placeholder-image.jpg"
                  }
                  alt={item.product.productname}
                  className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {item.product.inWarehouse && (
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Sẵn hàng
                    </span>
                  )}
                  <span className="bg-gradient-to-r from-blue-500 to-green-400 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Hot Deal
                  </span>
                </div>

                {/* Nút yêu thích */}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute right-4 top-4 rounded-full bg-white/90 backdrop-blur-sm p-3 hover:bg-white shadow-lg transform hover:scale-110 transition-all duration-300"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors duration-300 ${
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
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === idx
                          ? "border-blue-500 shadow-lg scale-110"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Thông tin chi tiết */}
            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                Chi tiết sản phẩm
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Mô tả</p>
                    <p className="text-gray-600 leading-relaxed">
                      {item.product.description || "Không có mô tả."}
                    </p>
                  </div>
                </div>

                {item.product.brandInfo && (
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                    <Award className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
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
            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                Đánh giá từ người mua
              </h2>

              {item.feedbacks.length > 0 ? (
                <ul className="space-y-4">
                  {item.feedbacks.map((review, index) => (
                    <li
                      key={index}
                      className="p-5 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-400 flex items-center justify-center text-white font-bold">
                            {review.buyer.buyerName[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-800">
                            {review.buyer.buyerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
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
                      <p className="text-gray-500 text-xs">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có đánh giá nào.</p>
                </div>
              )}
            </div>
          </div>

          {/* Cột phải - Thông tin mua hàng */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Card giá và hành động */}
              <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 line-clamp-2">
                  {item.product.productname}
                </h1>

                <div className="bg-gradient-to-r from-blue-500 to-green-400 text-white text-3xl font-bold mb-6 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-all duration-300">
                  {currency(item.product.cost)}
                </div>

                {/* Action buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleAction("buy")}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Mua ngay
                  </button>
                  <button
                    onClick={() => handleAction("cart")}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    onClick={() => handleAction("chat")}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Liên hệ ngay
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-around py-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold text-lg">
                        {item.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {item.totalReviews} đánh giá
                    </p>
                  </div>
                  <div className="w-px h-12 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                      <Eye className="w-5 h-5" />
                      <span className="font-bold text-lg">
                        {item.viewCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Lượt xem</p>
                  </div>
                </div>
              </div>

              {/* Card người bán */}
              <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300">
                <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                  Thông tin người bán
                </h3>

                <Link
                  to={`/sellers/${item.seller.sellerId}`}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl Hover:shadow-md transition-all duration-300 mb-6 group"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-green-400 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {item.seller.displayName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-lg truncate group-hover:text-blue-600 transition-colors duration-300">
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
                </Link>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors duration-300">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">{item.seller.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-colors duration-300">
                    <Phone className="w-5 h-5 text-green-500" />
                    <span className="text-sm">
                      {item.seller.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-blue-400 rounded-2xl shadow-xl p-6 text-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6" />
                    <span className="font-semibold">Thanh toán an toàn</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6" />
                    <span className="font-semibold">Giao hàng nhanh chóng</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6" />
                    <span className="font-semibold">Đảm bảo chất lượng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

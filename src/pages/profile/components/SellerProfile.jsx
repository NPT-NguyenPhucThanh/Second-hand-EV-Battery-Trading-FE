import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Star,
  Package,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Eye,
  Store,
} from "lucide-react";

import api from "../../../utils/api";

// --- Hàm định dạng tiền tệ ---
const currency = (value) => {
  if (typeof value !== "number") return "N/A";
  const num = parseFloat(value);
  return num.toLocaleString("vi-VN") + " ₫";
};

// --- Component Card Sản phẩm con ---
const ProductCard = ({ product }) => (
  <Link
    to={`/listing/${product.productid}`}
    className="block bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
  >
    <div className="relative">
      <img
        src={product.images?.[0] || "/placeholder.jpg"}
        alt={product.productname}
        className="w-full h-40 object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/placeholder.jpg";
        }}
      />
      <div className="absolute top-2 right-2 bg-blue-500/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
        <Eye className="w-3 h-3" />
        {product.viewCount?.toLocaleString() || 0}
      </div>
    </div>
    <div className="p-4">
      <h4 className="font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[48px]">
        {product.productname}
      </h4>
      <p className="text-xl font-bold text-green-600">
        {currency(product.cost)}
      </p>
    </div>
  </Link>
);

// ===================================
// === MAIN COMPONENT: SellerProfile ===
// ===================================
export default function SellerProfile() {
  const { sellerId } = useParams();
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      console.log("1. Khởi động fetch. Seller ID:", sellerId);

      if (!sellerId) {
        setError("Thiếu ID người bán");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("3. Gửi yêu cầu đến:", `api/public/sellers/${sellerId}`);

        // GỌI API ĐÚNG
        const response = await api.get(`api/public/sellers/${sellerId}`);

        console.log("4. Nhận phản hồi:", response);
        console.log("5. Dữ liệu:", response);

        // Kiểm tra status
        if (response.status === "success") {
          setSellerData(response);
        } else {
          throw new Error(response?.message || "Dữ liệu không hợp lệ");
        }
      } catch (err) {
        console.error("6. LỖI API:", err);

        const msg =
          err.response?.message ||
          err.message ||
          "Không thể kết nối đến máy chủ";

        setError(msg);
        toast.error(msg);
      } finally {
        console.log("7. Kết thúc fetch.");
        setLoading(false);
      }
    };

    fetchSellerProfile();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sellerId]);

  // === LOADING ===
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  // === ERROR ===
  if (error || !sellerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg text-center border-t-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
          <p className="text-gray-700 mb-6">{error || "Không tìm thấy người bán"}</p>
          <Link
            to="/"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const { seller, products } = sellerData;

  const initial = seller.displayName?.[0].toUpperCase() || "S";
  const memberSince = seller.memberSince
    ? new Date(seller.memberSince).toLocaleDateString("vi-VN")
    : "N/A";
  const displayAddress = seller.address || "Chưa cập nhật";

  // === MAIN RENDER ===
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-green-500 text-sm mb-6 font-medium transition group"
        >
          <span className="ml-2">Quay lại trang chủ</span>
        </Link>

        {/* Banner Người bán */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border-t-4 border-blue-500">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-green-400 text-white font-bold text-4xl flex items-center justify-center shadow-lg flex-shrink-0">
              {initial}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Store className="w-7 h-7 text-blue-500" />
                {seller.displayName}
              </h1>
              <p className="text-gray-500 mb-4">@{seller.username}</p>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-lg">
                    {seller.averageRating > 0 ? seller.averageRating.toFixed(1) : "Chưa có"}
                  </span>
                  <span className="text-gray-500">({seller.totalReviews} đánh giá)</span>
                </div>
                <div className="w-px h-5 bg-gray-200"></div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Package className="w-4 h-4" />
                  <span className="font-medium">{seller.totalProducts} sản phẩm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="truncate">{seller.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>{seller.phone !== "N/A" ? seller.phone : "Chưa cập nhật"}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="truncate">{displayAddress}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span>Tham gia từ: {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent border-b pb-3 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Sản phẩm đang bán ({products.length})
          </h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.productid} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <p>Người bán chưa có sản phẩm nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
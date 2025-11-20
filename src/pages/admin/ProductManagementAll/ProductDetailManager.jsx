import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  Eye,
  Car,
  Battery,
  Calendar,
  Activity,
  Tag,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getProductById } from "../../../services/productService";
import { deleteProductByManager } from "../../../services/managerProductService";

const ProductDetailManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadProductDetail();
  }, [id]);

  const loadProductDetail = async () => {
    try {
      setLoading(true);
      const response = await getProductById(id);
      console.log("API Response:", response);
      if (response.status === "success") {
        // API trả về response.product (DTO) và response.seller riêng
        setProduct({ ...response.product, seller: response.seller });
      } else {
        toast.error("Không thể tải thông tin sản phẩm");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Lỗi khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProductByManager(id);
      toast.success("Xóa sản phẩm thành công");
      navigate("/manager/products-all");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Lỗi khi xóa sản phẩm");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Không tìm thấy sản phẩm
        </p>
        <button
          onClick={() => navigate("/manager/products-all")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : ["/placeholder.jpg"];

  const getStatusBadge = (status) => {
    const statusConfig = {
      AVAILABLE: {
        label: "Đang bán",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
      },
      SOLD: {
        label: "Đã bán",
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      },
      PENDING: {
        label: "Chờ duyệt",
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      },
      UNAVAILABLE: {
        label: "Không khả dụng",
        color: "bg-red-500/20 text-red-400 border-red-500/30",
      },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const icon =
      type === "Xe điện" ? (
        <Car className="w-4 h-4" />
      ) : (
        <Battery className="w-4 h-4" />
      );
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
        }`}
      >
        {icon}
        <span className="font-medium">{type}</span>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate("/manager/products-all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isDark
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div
          className={`rounded-2xl overflow-hidden ${
            isDark ? "bg-gray-800" : "bg-white"
          } shadow-xl`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left: Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img
                  src={productImages[currentImageIndex]}
                  alt={product.productname}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {getTypeBadge(product.type)}
                </div>
                <div className="absolute top-4 left-4">
                  {getStatusBadge(product.status)}
                </div>
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === idx
                          ? "border-blue-500 scale-105"
                          : isDark
                          ? "border-gray-700 hover:border-gray-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
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

            {/* Right: Details */}
            <div className="space-y-6">
              {/* Title & Price */}
              <div>
                <h1
                  className={`text-3xl font-bold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {product.productname}
                </h1>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-orange-500">
                    {product.cost?.toLocaleString()} đ
                  </span>
                </div>
              </div>

              {/* Product Stats */}
              <div
                className={`grid grid-cols-2 gap-4 p-4 rounded-xl ${
                  isDark ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isDark ? "bg-yellow-500/20" : "bg-yellow-100"
                    }`}
                  >
                    <Activity className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Đánh giá
                    </p>
                    <p
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {0} ⭐
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isDark ? "bg-red-500/20" : "bg-red-100"
                    }`}
                  >
                    <Eye className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Lượt xem
                    </p>
                    <p
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.viewCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Thông tin sản phẩm
                </h3>
                <div className="space-y-2">
                  <InfoRow
                    icon={<Tag className="w-4 h-4" />}
                    label="Mã sản phẩm"
                    value={`#${product.productid}`}
                    isDark={isDark}
                  />
                  <InfoRow
                    icon={<Calendar className="w-4 h-4" />}
                    label="Năm sản xuất"
                    value={product.brandInfo?.year || "N/A"}
                    isDark={isDark}
                  />
                  {product.type === "Car EV" && product.brandInfo && (
                    <InfoRow
                      icon={<Car className="w-4 h-4" />}
                      label="Hãng xe"
                      value={product.brandInfo.brand}
                      isDark={isDark}
                    />
                  )}
                  {product.type === "Battery" && product.brandInfo && (
                    <InfoRow
                      icon={<Battery className="w-4 h-4" />}
                      label="Hãng pin"
                      value={product.brandInfo.brand}
                      isDark={isDark}
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Mô tả sản phẩm
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {product.description || "Không có mô tả"}
                </p>
              </div>

              {/* Seller Info */}
              {product.seller && (
                <div
                  className={`p-4 rounded-xl ${
                    isDark ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-3 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Thông tin người bán
                  </h3>
                  <div className="space-y-2">
                    <InfoRow
                      icon={<User className="w-4 h-4" />}
                      label="Tên"
                      value={
                        product.seller.displayName || product.seller.username
                      }
                      isDark={isDark}
                    />
                    <InfoRow
                      icon={<Mail className="w-4 h-4" />}
                      label="Email"
                      value={product.seller.email}
                      isDark={isDark}
                    />
                    <InfoRow
                      icon={<Phone className="w-4 h-4" />}
                      label="Số điện thoại"
                      value={product.seller.phone}
                      isDark={isDark}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  Xóa sản phẩm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-2xl p-6 max-w-md w-full ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Xác nhận xóa sản phẩm
            </h3>
            <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <strong>{product.productname}</strong>? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component
const InfoRow = ({ icon, label, value, isDark }) => (
  <div
    className={`flex items-center justify-between py-2 border-b ${
      isDark ? "border-gray-700" : "border-gray-200"
    }`}
  >
    <div className="flex items-center gap-2">
      <div className={isDark ? "text-gray-400" : "text-gray-500"}>{icon}</div>
      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
    <span
      className={`text-sm font-medium ${
        isDark ? "text-white" : "text-gray-900"
      }`}
    >
      {value}
    </span>
  </div>
);

export default ProductDetailManager;

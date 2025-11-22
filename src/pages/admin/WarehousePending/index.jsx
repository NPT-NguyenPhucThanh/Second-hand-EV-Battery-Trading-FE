// src/pages/admin/WarehousePending/index.jsx

import { useEffect, useState } from "react";
import {
  getWarehousePending,
  addProduct,
  removeProduct,
} from "../../../services/warehouseService";

import WarehouseDetailModal from "../WarehouseManagement/components/WarehouseDetailModal";
import { useTheme } from "../../../contexts/ThemeContext";
import { toast } from "sonner";
import AuroraText from "../../../components/common/AuroraText";

import {
  Package,
  Warehouse,
  Eye,
  Loader2,
  Check,
  X,
  User,
  DollarSign,
  Calendar,
  Car,
} from "lucide-react";

// === Format Date ===
const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")} ${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

export default function WarehousePending() {
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchApi = async () => {
    setLoading(true);
    try {
      const res = await getWarehousePending();
      setProducts(res || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleApprove = async (productId) => {
    if (processingId) return;
    setProcessingId(productId);

    try {
      await addProduct(productId);
      toast.success("Đã thêm sản phẩm vào kho!");
      fetchApi();
    } catch (error) {
      toast.error("Lỗi khi thêm vào kho!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (productId) => {
    if (processingId) return;
    setProcessingId(productId);

    try {
      await removeProduct(productId, { reason: "Không đạt yêu cầu nhập kho" });
      toast.success("Đã từ chối sản phẩm!");
      fetchApi();
    } catch (error) {
      toast.error("Lỗi khi từ chối sản phẩm!");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <Loader2
          className={`w-12 h-12 animate-spin ${
            isDark ? "text-blue-400" : "text-blue-500"
          }`}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="mb-8">
        <AuroraText className="text-4xl font-bold mb-2">
          Kho Chờ Nhập
        </AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Sản phẩm đang chờ nhập kho
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => {
          const firstImage =
            product.imgs?.length > 0
              ? product.imgs[0].url
              : "/placeholder.jpg";

          return (
            <div
              key={product.productid}
              className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${
                isDark
                  ? "bg-gray-800/50 backdrop-blur-sm"
                  : "bg-white shadow-lg"
              }`}
            >

              {/* === IMAGE PREVIEW (ADDED LIKE ProductManagementAll) === */}
              <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-gray-700/20">
                <img
                  src={firstImage}
                  alt={product.productname}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Car
                    className={`w-5 h-5 ${
                      isDark ? "text-blue-400" : "text-blue-500"
                    }`}
                  />
                  <span
                    className={`font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    #{product.productid}
                  </span>
                </div>

                <div className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400">
                  <span className="text-xs font-medium">Đã duyệt KĐ</span>
                </div>
              </div>

              {/* Title */}
              <h3
                className={`text-lg font-bold mb-3 line-clamp-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {product.productname}
              </h3>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <User
                    className={`w-4 h-4 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {product.users?.username || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign
                    className={`w-5 h-5 ${
                      isDark ? "text-green-400" : "text-green-500"
                    }`}
                  />
                  <span
                    className={`text-xl font-bold ${
                      isDark ? "text-green-400" : "text-green-500"
                    }`}
                  >
                    {(product.cost || 0).toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar
                    className={`w-4 h-4 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {formatDateTime(product.createdat)}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetail(product)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Chi tiết
                </button>

                <button
                  onClick={() => handleApprove(product.productid)}
                  disabled={processingId === product.productid}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processingId === product.productid ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Nhập kho
                </button>

                <button
                  onClick={() => handleReject(product.productid)}
                  disabled={processingId === product.productid}
                  className="flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === product.productid ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Từ chối
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Warehouse
            className={`w-16 h-16 mx-auto mb-4 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`}
          />

          <p
            className={`text-lg ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Không có sản phẩm chờ nhập kho
          </p>
        </div>
      )}

      <WarehouseDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}

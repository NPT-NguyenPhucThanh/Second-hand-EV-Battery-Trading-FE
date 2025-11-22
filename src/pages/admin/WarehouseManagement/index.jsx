import { useEffect, useState } from "react";
import { getWarehouse } from "../../../services/warehouseService";
import WarehouseDetailModal from "./components/WarehouseDetailModal";
import { useTheme } from "../../../contexts/ThemeContext";
import { toast } from "sonner";
import AuroraText from "../../../components/common/AuroraText";
import {
  Package,
  Warehouse,
  Eye,
  Loader2,
  CheckCircle,
  DollarSign,
  User,
  Calendar,
  X,
} from "lucide-react";

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

export default function WarehouseManagement() {
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const inWarehouse = products.filter((p) => p.inWarehouse === true);

  const fetchApi = async () => {
    setLoading(true);
    try {
      const warehouseRes = await getWarehouse();
      setProducts(warehouseRes || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách kho!");
      console.error(error);
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
          Quản Lý Kho
        </AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Theo dõi hàng tồn kho
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {inWarehouse.map((product) => {
          const firstImage =
            product.imgs && product.imgs.length > 0
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
              {/* Hình ảnh sản phẩm */}
              <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-gray-700/20">
                <img
                  src={firstImage}
                  alt={product.productname}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Header: mã + trạng thái */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package
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
                <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/20 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Trong kho</span>
                </div>
              </div>

              {/* Tên sản phẩm */}
              <h3
                className={`text-lg font-bold mb-3 line-clamp-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {product.productname}
              </h3>

              {/* Thông tin */}
              <div className="space-y-2 mb-4">
                {/* Người bán */}
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

                {/* Giá */}
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

                {/* Ngày tạo */}
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

              {/* Action */}
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
              </div>
            </div>
          );
        })}
      </div>

      {inWarehouse.length === 0 && (
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
            Kho trống
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

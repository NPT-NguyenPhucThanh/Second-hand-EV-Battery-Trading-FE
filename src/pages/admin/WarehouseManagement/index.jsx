import { useEffect, useState } from "react";
import {
  getWarehouse,
  getWarehousePending,
  addProduct,
  removeProduct,
} from "../../../services/warehouseService";
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
  Clock,
  X,
  Check,
} from "lucide-react";

export default function WarehouseManagement() {
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("warehouse");
  const [processingId, setProcessingId] = useState(null);

  const fetchApi = async () => {
    setLoading(true);
    try {
      const [warehouseRes, pendingRes] = await Promise.all([
        getWarehouse(),
        getWarehousePending(),
      ]);
      setProducts(warehouseRes || []);
      setPendingProducts(pendingRes || []);
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

  const handleApprove = async (productId) => {
    if (processingId) return;
    setProcessingId(productId);
    try {
      await addProduct(productId);
      toast.success("Đã thêm sản phẩm vào kho!");
      fetchApi();
    } catch (error) {
      toast.error("Lỗi khi thêm vào kho: " + error.message);
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
      toast.error("Lỗi khi từ chối: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const inWarehouse = products.filter((p) => p.inWarehouse === true);

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
        <AuroraText className="text-4xl font-bold mb-2">Quản Lý Kho</AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Theo dõi hàng tồn kho
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("warehouse")}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === "warehouse"
              ? "bg-blue-500 text-white"
              : isDark
              ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5" />
            Trong kho ({inWarehouse.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === "pending"
              ? "bg-orange-500 text-white"
              : isDark
              ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Chờ nhập kho ({pendingProducts.length})
          </div>
        </button>
      </div>

      {/* Warehouse Tab */}
      {activeTab === "warehouse" && (
        <>
          <div
            className={`mb-6 p-4 rounded-2xl ${
              isDark ? "bg-gray-800/50" : "bg-white shadow-lg"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Warehouse
                  className={`w-6 h-6 ${
                    isDark ? "text-blue-400" : "text-blue-500"
                  }`}
                />
                <div>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Tổng sản phẩm trong kho
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {inWarehouse.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {inWarehouse.map((product) => (
              <div
                key={product.productid}
                className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? "bg-gray-800/50 backdrop-blur-sm"
                    : "bg-white shadow-lg"
                }`}
              >
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

                <h3
                  className={`text-lg font-bold mb-3 line-clamp-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {product.productname}
                </h3>

                <div className="space-y-2 mb-4">
                  {product.producttype && (
                    <div
                      className={`inline-flex px-3 py-1 rounded-lg ${
                        product.producttype === "Car EV"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      <span className="text-xs font-medium">
                        {product.producttype}
                      </span>
                    </div>
                  )}
                  {product.cost && (
                    <div className="flex items-center gap-2">
                      <DollarSign
                        className={`w-5 h-5 ${
                          isDark ? "text-green-400" : "text-green-500"
                        }`}
                      />
                      <span
                        className={`text-lg font-bold ${
                          isDark ? "text-green-400" : "text-green-500"
                        }`}
                      >
                        {(product.cost || 0).toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleViewDetail(product)}
                  className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isDark
                      ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Xem Chi Tiết
                </button>
              </div>
            ))}
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
        </>
      )}

      {/* Pending Tab */}
      {activeTab === "pending" && (
        <>
          <div
            className={`mb-6 p-4 rounded-2xl ${
              isDark ? "bg-gray-800/50" : "bg-white shadow-lg"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock
                  className={`w-6 h-6 ${
                    isDark ? "text-orange-400" : "text-orange-500"
                  }`}
                />
                <div>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Sản phẩm chờ xử lý
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {pendingProducts.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingProducts.map((product) => (
              <div
                key={product.productid}
                className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? "bg-gray-800/50 backdrop-blur-sm"
                    : "bg-white shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package
                      className={`w-5 h-5 ${
                        isDark ? "text-orange-400" : "text-orange-500"
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
                  <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Chờ duyệt</span>
                  </div>
                </div>

                <h3
                  className={`text-lg font-bold mb-3 line-clamp-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {product.productname}
                </h3>

                <div className="space-y-2 mb-4">
                  {product.producttype && (
                    <div
                      className={`inline-flex px-3 py-1 rounded-lg ${
                        product.producttype === "Car EV"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      <span className="text-xs font-medium">
                        {product.producttype}
                      </span>
                    </div>
                  )}
                  {product.cost && (
                    <div className="flex items-center gap-2">
                      <DollarSign
                        className={`w-5 h-5 ${
                          isDark ? "text-green-400" : "text-green-500"
                        }`}
                      />
                      <span
                        className={`text-lg font-bold ${
                          isDark ? "text-green-400" : "text-green-500"
                        }`}
                      >
                        {(product.cost || 0).toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(product.productid)}
                    disabled={processingId === product.productid}
                    className="flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === product.productid ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Duyệt
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
            ))}
          </div>

          {pendingProducts.length === 0 && (
            <div className="text-center py-12">
              <Clock
                className={`w-16 h-16 mx-auto mb-4 ${
                  isDark ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <p
                className={`text-lg ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Không có sản phẩm chờ xử lý
              </p>
            </div>
          )}
        </>
      )}

      <WarehouseDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}

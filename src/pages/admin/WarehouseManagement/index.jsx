import { useEffect, useState } from "react";
import { getWarehouse } from "../../../services/warehouseService";
import WarehouseDetailModal from "./components/WarehouseDetailModal";
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'sonner';
import AuroraText from '../../../components/common/AuroraText';
import { Package, Warehouse, Eye, Loader2, CheckCircle, DollarSign } from 'lucide-react';

export default function WarehouseManagement() {
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchApi = async () => {
    setLoading(true);
    try {
      const res = await getWarehouse();
      if (res) {
        setProducts(res || []);
      } else {
        toast.error("Không nhận được dữ liệu từ server");
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách kho!");
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

  const inWarehouse = products.filter((p) => p.inWarehouse === true);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <Loader2 className={`w-12 h-12 animate-spin ${isDark ? "text-blue-400" : "text-blue-500"}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="mb-8">
        <AuroraText className="text-4xl font-bold mb-2">Quản Lý Kho</AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>Theo dõi hàng tồn kho</p>
      </div>

      <div className={`mb-6 p-4 rounded-2xl ${isDark ? "bg-gray-800/50" : "bg-white shadow-lg"}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Warehouse className={`w-6 h-6 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
            <div>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tổng sản phẩm trong kho</p>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{inWarehouse.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {inWarehouse.map((product) => (
          <div key={product.productid} className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
                <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>#{product.productid}</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/20 text-green-400`}>
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Trong kho</span>
              </div>
            </div>

            <h3 className={`text-lg font-bold mb-3 line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>{product.productname}</h3>

            <div className="space-y-2 mb-4">
              {product.producttype && (
                <div className={`inline-flex px-3 py-1 rounded-lg ${product.producttype === 'Car EV' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                  <span className="text-xs font-medium">{product.producttype}</span>
                </div>
              )}
              {product.cost && (
                <div className="flex items-center gap-2">
                  <DollarSign className={`w-5 h-5 ${isDark ? "text-green-400" : "text-green-500"}`} />
                  <span className={`text-lg font-bold ${isDark ? "text-green-400" : "text-green-500"}`}>{(product.cost || 0).toLocaleString("vi-VN")} </span>
                </div>
              )}
            </div>

            <button onClick={() => handleViewDetail(product)} className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
              <Eye className="w-4 h-4" />
              Xem Chi Tiết
            </button>
          </div>
        ))}
      </div>

      {inWarehouse.length === 0 && (
        <div className="text-center py-12">
          <Warehouse className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>Kho trống</p>
        </div>
      )}

      <WarehouseDetailModal open={modalOpen} onClose={() => setModalOpen(false)} product={selectedProduct} />
    </div>
  );
}

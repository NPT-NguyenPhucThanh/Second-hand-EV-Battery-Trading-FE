import React, { useState, useEffect, useMemo } from "react";
import {
  getAllProductsForManager,
  deleteProductByManager,
} from "../../../services/managerProductService";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import { toast } from "sonner";
import AuroraText from "../../../components/common/AuroraText";
import {
  Car,
  Battery,
  Search as SearchIcon,
  Trash2,
  User,
  DollarSign,
  Package,
  Loader2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Archive,
} from "lucide-react";

export default function ProductManagementAll() {
  const { isDark } = useTheme();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getAllProductsForManager();
      if (res.status === "success") {
        setAllProducts(res.products.map((p) => ({ ...p, key: p.productid })));
      } else {
        toast.error(res.message || "Không thể tải danh sách sản phẩm!");
      }
    } catch (err) {
      toast.error("Lỗi kết nối khi tải sản phẩm!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId, productName) => {
    if (
      !window.confirm(`Xóa "${productName}"? Hành động này không thể hoàn tác!`)
    )
      return;

    try {
      const res = await deleteProductByManager(productId);
      if (res.status === "success") {
        toast.success(res.message);
        fetchProducts();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      // Lấy message từ error response body
      const errorMessage =
        error.response?.data?.message || error.message || "Có lỗi xảy ra";
      toast.error(`Xóa thất bại: ${errorMessage}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      CHO_DUYET: {
        color: "bg-blue-500/20 text-blue-400",
        label: "Chờ duyệt",
        icon: Clock,
      },
      CHO_KIEM_DUYET: {
        color: "bg-cyan-500/20 text-cyan-400",
        label: "Chờ kiểm định",
        icon: AlertCircle,
      },
      DA_DUYET: {
        color: "bg-purple-500/20 text-purple-400",
        label: "Đã duyệt",
        icon: CheckCircle,
      },
      DANG_BAN: {
        color: "bg-green-500/20 text-green-400",
        label: "Đang bán",
        icon: CheckCircle,
      },
      DA_BAN: {
        color: "bg-orange-500/20 text-orange-400",
        label: "Đã bán",
        icon: Archive,
      },
      BI_TU_CHOI: {
        color: "bg-red-500/20 text-red-400",
        label: "Bị từ chối",
        icon: XCircle,
      },
      KHONG_DAT_KIEM_DINH: {
        color: "bg-red-500/20 text-red-400",
        label: "Không đạt KĐ",
        icon: XCircle,
      },
      HET_HAN: {
        color: "bg-gray-500/20 text-gray-400",
        label: "Hết hạn",
        icon: Clock,
      },
      REMOVED_FROM_WAREHOUSE: {
        color: "bg-purple-500/20 text-purple-400",
        label: "Đã gỡ",
        icon: Archive,
      },
    };
    return (
      statusMap[status] || {
        color: "bg-gray-500/20 text-gray-400",
        label: status,
        icon: AlertCircle,
      }
    );
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.productname.toLowerCase().includes(lower) ||
          p.productid.toString().includes(lower) ||
          p.type.toLowerCase().includes(lower) ||
          (p.users && p.users.username.toLowerCase().includes(lower))
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    return filtered;
  }, [allProducts, searchTerm, typeFilter, statusFilter]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <Loader2
          className={`w-12 h-12 animate-spin ${
            isDark ? "text-purple-400" : "text-purple-500"
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
          Quản Lý Sản Phẩm
        </AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Giám sát toàn bộ sản phẩm trên hệ thống
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div
          className={`flex items-center gap-3 p-4 rounded-xl ${
            isDark ? "bg-gray-800/50" : "bg-white shadow-md"
          }`}
        >
          <SearchIcon className={isDark ? "text-gray-400" : "text-gray-500"} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã SP, loại, người bán..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 bg-transparent border-none outline-none ${
              isDark
                ? "text-white placeholder-gray-500"
                : "text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            {["all", "Car EV", "Battery"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  typeFilter === type
                    ? isDark
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-purple-500 text-white"
                    : isDark
                    ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {type === "all" ? "Tất cả" : type}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {["all", "DANG_BAN", "DA_BAN", "CHO_DUYET"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === status
                    ? isDark
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-blue-500 text-white"
                    : isDark
                    ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {status === "all" ? "Tất cả TT" : getStatusBadge(status).label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const statusBadge = getStatusBadge(product.status);
          const StatusIcon = statusBadge.icon;
          const TypeIcon = product.type === "Car EV" ? Car : Battery;
          const productImage =
            product.imgs && product.imgs.length > 0
              ? product.imgs[0].url
              : "/placeholder.jpg";
          return (
            <div
              key={product.productid}
              className={`rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                isDark
                  ? "bg-gray-800/50 backdrop-blur-sm"
                  : "bg-white shadow-lg"
              }`}
            >
              <div className="relative h-48 overflow-hidden bg-gray-700">
                <img
                  src={productImage}
                  alt={product.productname}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                  <TypeIcon className="w-4 h-4 text-white" />
                  <span className="text-xs font-medium text-white">
                    {product.type}
                  </span>
                </div>
                {product.inWarehouse && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/80 backdrop-blur-sm">
                    <Package className="w-4 h-4 text-white" />
                    <span className="text-xs font-medium text-white">
                      Trong kho
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3
                  className={`font-bold text-lg mb-2 line-clamp-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {product.productname}
                </h3>

                <div className="flex items-center gap-2 mb-3">
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

                <div className="flex items-center gap-2 mb-3">
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
                    {product.users ? product.users.username : "N/A"}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${statusBadge.color}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {statusBadge.label}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/manager/products/${product.productid}`)
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
                      isDark
                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Chi tiết
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(product.productid, product.productname)
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isDark
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p
                  className={`text-xs mt-3 text-center ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Mã SP: #{product.productid}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package
            className={`w-16 h-16 mx-auto mb-4 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Không tìm thấy sản phẩm nào
          </p>
        </div>
      )}
    </div>
  );
}

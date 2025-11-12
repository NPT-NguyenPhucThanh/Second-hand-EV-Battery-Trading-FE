import React, { useEffect, useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { getReportSystem } from "../../../services/managerSystemService";
import {
  Users,
  ShoppingBag,
  ShoppingCart,
  AlertTriangle,
  Eye,
  TrendingUp,
  CheckCircle,
  Clock,
  Package,
  Car,
  Battery,
  Loader2,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import AuroraText from "../../../components/common/AuroraText";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function SystemManagement() {
  const { isDark } = useTheme();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSystemReport = async () => {
    setLoading(true);
    try {
      const response = await getReportSystem();
      setReport(response);
    } catch (error) {
      toast.error("Không thể tải báo cáo hệ thống!");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemReport();
  }, []);

  if (loading || !report) {
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

  const formatValue = (value) =>
    value !== null && value !== undefined ? value : 0;

  // User Stats for Pie Chart
  const userStatsData = [
    {
      name: "Người mua",
      value: formatValue(report.totalBuyers),
      color: "#3b82f6",
    },
    {
      name: "Người bán",
      value: formatValue(report.totalSellers),
      color: "#10b981",
    },
  ];

  // Product Stats for Bar Chart
  const productStatsData = [
    { name: "Xe bán", value: formatValue(report.carsOnSale), color: "#3b82f6" },
    {
      name: "Pin bán",
      value: formatValue(report.batteriesOnSale),
      color: "#10b981",
    },
    {
      name: "Trong kho",
      value: formatValue(report.productsInWarehouse),
      color: "#f59e0b",
    },
  ];

  // Order Stats for Bar Chart
  const orderStatsData = [
    {
      name: "Hoàn tất",
      value: formatValue(report.completedOrders),
      color: "#10b981",
    },
    {
      name: "Chờ xử lý",
      value: formatValue(report.pendingOrders),
      color: "#f59e0b",
    },
    {
      name: "Tranh chấp",
      value: formatValue(report.openDisputes),
      color: "#ef4444",
    },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  // Main Stats Cards
  const mainStatsCards = [
    {
      title: "Tổng Người Dùng",
      value: formatValue(report.totalUsers),
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      iconBg: isDark ? "bg-blue-500/20" : "bg-blue-100",
      iconColor: isDark ? "text-blue-400" : "text-blue-500",
    },
    {
      title: "Tổng Sản Phẩm",
      value: formatValue(report.totalProducts),
      icon: ShoppingBag,
      gradient: "from-purple-500 to-pink-500",
      iconBg: isDark ? "bg-purple-500/20" : "bg-purple-100",
      iconColor: isDark ? "text-purple-400" : "text-purple-500",
    },
    {
      title: "Tổng Đơn Hàng",
      value: formatValue(report.totalOrders),
      icon: ShoppingCart,
      gradient: "from-green-500 to-emerald-500",
      iconBg: isDark ? "bg-green-500/20" : "bg-green-100",
      iconColor: isDark ? "text-green-400" : "text-green-500",
    },
    {
      title: "Tranh Chấp Mở",
      value: formatValue(report.openDisputes),
      icon: AlertTriangle,
      gradient: "from-red-500 to-orange-500",
      iconBg: isDark ? "bg-red-500/20" : "bg-red-100",
      iconColor: isDark ? "text-red-400" : "text-red-500",
    },
  ];

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Header */}
      <div className="mb-8">
        <AuroraText className="text-4xl font-bold mb-2">
          Báo Cáo Hệ Thống
        </AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Tổng quan về người dùng, sản phẩm và đơn hàng
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainStatsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${
                isDark
                  ? "bg-gray-800/50 backdrop-blur-sm"
                  : "bg-white shadow-lg"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
              <p
                className={`text-sm font-medium mb-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {card.title}
              </p>
              <p
                className={`text-3xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {card.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Distribution Pie Chart */}
        <div
          className={`rounded-2xl p-6 ${
            isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <Users
              className={`w-6 h-6 ${
                isDark ? "text-blue-400" : "text-blue-500"
              }`}
            />
            <h3
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Phân Bố Người Dùng
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userStatsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userStatsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  color: isDark ? "#ffffff" : "#000000",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Product Stats Bar Chart */}
        <div
          className={`rounded-2xl p-6 ${
            isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag
              className={`w-6 h-6 ${
                isDark ? "text-purple-400" : "text-purple-500"
              }`}
            />
            <h3
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Thống Kê Sản Phẩm
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productStatsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  color: isDark ? "#ffffff" : "#000000",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {productStatsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Stats Bar Chart */}
      <div
        className={`rounded-2xl p-6 mb-8 ${
          isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart
            className={`w-6 h-6 ${
              isDark ? "text-green-400" : "text-green-500"
            }`}
          />
          <h3
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Thống Kê Đơn Hàng
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={orderStatsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: "none",
                borderRadius: "12px",
                color: isDark ? "#ffffff" : "#000000",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {orderStatsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Market Trends */}
      <div
        className={`rounded-2xl p-6 ${
          isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp
            className={`w-6 h-6 ${
              isDark ? "text-orange-400" : "text-orange-500"
            }`}
          />
          <h3
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Xu Hướng Thị Trường
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trending Category */}
          <div
            className={`p-4 rounded-xl ${
              isDark ? "bg-gray-700/50" : "bg-blue-50"
            }`}
          >
            <p
              className={`text-sm font-medium mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Danh mục nổi bật
            </p>
            <div className="flex items-center gap-2">
              <BarChart3
                className={isDark ? "text-blue-400" : "text-blue-500"}
              />
              <span
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {report.trendingCategory || "N/A"}
              </span>
            </div>
          </div>

          {/* Most Viewed Product */}
          <div
            className={`p-4 rounded-xl ${
              isDark ? "bg-gray-700/50" : "bg-purple-50"
            }`}
          >
            <p
              className={`text-sm font-medium mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Sản phẩm xem nhiều nhất
            </p>
            <div className="flex items-center gap-2">
              <Eye className={isDark ? "text-purple-400" : "text-purple-500"} />
              <span
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {report.mostViewedProduct?.productName || "Chưa có dữ liệu"}
              </span>
            </div>
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {formatValue(report.mostViewedProduct?.views)} lượt xem
            </p>
          </div>

          {/* Total Views */}
          <div
            className={`p-4 rounded-xl ${
              isDark ? "bg-gray-700/50" : "bg-green-50"
            }`}
          >
            <p
              className={`text-sm font-medium mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Tổng lượt xem
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className={isDark ? "text-blue-400" : "text-blue-500"} />
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Xe
                  </span>
                </div>
                <span
                  className={`font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {formatValue(report.totalCarViews).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery
                    className={isDark ? "text-green-400" : "text-green-500"}
                  />
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Pin
                  </span>
                </div>
                <span
                  className={`font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {formatValue(report.totalBatteryViews).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { getRevenue } from "../../../services/managerSystemService";
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Battery,
  Car,
  Loader2,
  PieChart as PieChartIcon,
} from "lucide-react";
import { toast } from "sonner";
import AuroraText from "../../../components/common/AuroraText";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const formatCurrency = (value) => {
  if (typeof value !== "number") return value;
  return `${value.toLocaleString("vi-VN")} ₫`;
};

const formatNumber = (value) => {
  if (typeof value !== "number") return value;
  return value.toLocaleString("vi-VN");
};

export default function RevenueManagement() {
  const { isDark } = useTheme();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueReport = async () => {
      setLoading(true);
      try {
        const response = await getRevenue();
        setReport(response);
      } catch (error) {
        toast.error("Không thể tải báo cáo doanh thu!");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueReport();
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
            isDark ? "text-blue-400" : "text-blue-500"
          }`}
        />
      </div>
    );
  }

  // Data for Bar Chart (Revenue Breakdown)
  const revenueBreakdownData = [
    {
      name: "Xe",
      value: report.carRevenue || 0,
      color: isDark ? "#3b82f6" : "#2563eb",
    },
    {
      name: "Pin",
      value: report.batteryRevenue || 0,
      color: isDark ? "#10b981" : "#059669",
    },
    {
      name: "Gói DV",
      value: report.packageRevenue || 0,
      color: isDark ? "#f59e0b" : "#d97706",
    },
  ];

  // Data for Pie Chart (Revenue Distribution)
  const revenueDistributionData = [
    {
      name: "Doanh thu bán xe",
      value: report.carRevenue || 0,
      color: "#3b82f6",
    },
    {
      name: "Doanh thu bán pin",
      value: report.batteryRevenue || 0,
      color: "#10b981",
    },
    {
      name: "Doanh thu gói dịch vụ",
      value: report.packageRevenue || 0,
      color: "#f59e0b",
    },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  // Stats Cards Data
  const statsCards = [
    {
      title: "Tổng Doanh Thu",
      value: formatCurrency(report.totalRevenue),
      icon: TrendingUp,
      gradient: "from-blue-500 to-purple-500",
      iconBg: isDark ? "bg-blue-500/20" : "bg-blue-100",
      iconColor: isDark ? "text-blue-400" : "text-blue-500",
    },
    {
      title: "Doanh Thu Nền Tảng",
      value: formatCurrency(report.platformRevenue),
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500",
      iconBg: isDark ? "bg-green-500/20" : "bg-green-100",
      iconColor: isDark ? "text-green-400" : "text-green-500",
    },
    {
      title: "Tổng Hoa Hồng",
      value: formatCurrency(report.totalCommission),
      subtitle: `(${report.commissionRate})`,
      icon: Package,
      gradient: "from-orange-500 to-amber-500",
      iconBg: isDark ? "bg-orange-500/20" : "bg-orange-100",
      iconColor: isDark ? "text-orange-400" : "text-orange-500",
    },
    {
      title: "Đơn Hàng Hoàn Tất",
      value: formatNumber(report.totalCompletedOrders),
      icon: ShoppingCart,
      gradient: "from-pink-500 to-rose-500",
      iconBg: isDark ? "bg-pink-500/20" : "bg-pink-100",
      iconColor: isDark ? "text-pink-400" : "text-pink-500",
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <div className="mb-8">
        <AuroraText
          text="Báo cáo Doanh thu"
          className="text-3xl font-bold mb-2"
        />
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Dữ liệu tổng hợp từ các đơn hàng đã hoàn tất trong hệ thống
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 animate-fade-in ${
                isDark
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-white border border-gray-200 shadow-lg"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div
                  className={`px-3 py-1 rounded-full bg-gradient-to-r ${card.gradient} text-white text-xs font-semibold`}
                >
                  Live
                </div>
              </div>
              <h3
                className={`text-sm font-medium mb-2 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {card.title}
              </h3>
              <p
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {card.value}
              </p>
              {card.subtitle && (
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-gray-500" : "text-gray-600"
                  }`}
                >
                  {card.subtitle}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart - Revenue Breakdown */}
        <div
          className={`rounded-2xl p-6 ${
            isDark
              ? "bg-gray-800/50 border border-gray-700"
              : "bg-white border border-gray-200 shadow-lg"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-2 rounded-xl ${
                isDark ? "bg-blue-500/20" : "bg-blue-100"
              }`}
            >
              <PieChartIcon
                className={`w-5 h-5 ${
                  isDark ? "text-blue-400" : "text-blue-500"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Phân tích Doanh thu
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueBreakdownData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#374151" : "#e5e7eb"}
              />
              <XAxis
                dataKey="name"
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "12px",
                  color: isDark ? "#ffffff" : "#000000",
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend
                wrapperStyle={{
                  color: isDark ? "#9ca3af" : "#6b7280",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              >
                {revenueBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Revenue Distribution */}
        <div
          className={`rounded-2xl p-6 ${
            isDark
              ? "bg-gray-800/50 border border-gray-700"
              : "bg-white border border-gray-200 shadow-lg"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-2 rounded-xl ${
                isDark ? "bg-green-500/20" : "bg-green-100"
              }`}
            >
              <TrendingUp
                className={`w-5 h-5 ${
                  isDark ? "text-green-400" : "text-green-500"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Phân bổ Doanh thu
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={800}
              >
                {revenueDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "12px",
                  color: isDark ? "#ffffff" : "#000000",
                }}
                formatter={(value) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
            isDark
              ? "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30"
              : "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`p-3 rounded-xl ${
                isDark ? "bg-blue-500/20" : "bg-blue-200"
              }`}
            >
              <Car
                className={`w-6 h-6 ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Doanh thu Bán Xe
            </h3>
          </div>
          <p
            className={`text-3xl font-bold ${
              isDark ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {formatCurrency(report.carRevenue)}
          </p>
        </div>

        <div
          className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
            isDark
              ? "bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30"
              : "bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`p-3 rounded-xl ${
                isDark ? "bg-green-500/20" : "bg-green-200"
              }`}
            >
              <Battery
                className={`w-6 h-6 ${
                  isDark ? "text-green-400" : "text-green-600"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Doanh thu Bán Pin
            </h3>
          </div>
          <p
            className={`text-3xl font-bold ${
              isDark ? "text-green-400" : "text-green-600"
            }`}
          >
            {formatCurrency(report.batteryRevenue)}
          </p>
        </div>

        <div
          className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
            isDark
              ? "bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30"
              : "bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200"
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`p-3 rounded-xl ${
                isDark ? "bg-orange-500/20" : "bg-orange-200"
              }`}
            >
              <Package
                className={`w-6 h-6 ${
                  isDark ? "text-orange-400" : "text-orange-600"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Gói Dịch Vụ
            </h3>
          </div>
          <p
            className={`text-3xl font-bold ${
              isDark ? "text-orange-400" : "text-orange-600"
            }`}
          >
            {formatCurrency(report.packageRevenue)}
          </p>
          <p
            className={`text-sm mt-2 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {formatNumber(report.totalPackagesSold)} gói đã bán
          </p>
        </div>
      </div>
    </div>
  );
}

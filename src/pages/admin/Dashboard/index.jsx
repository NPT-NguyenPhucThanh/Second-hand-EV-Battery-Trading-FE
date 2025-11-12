import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardOverview } from "../../../services/managerSystemService";
import { useTheme } from "../../../contexts/ThemeContext";
import { toast } from "sonner";
import AuroraText from "../../../components/common/AuroraText";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  BarChart3,
  Eye,
  Battery,
  Car,
  FileCheck,
  ClipboardCheck,
  AlertTriangle,
  UserCheck,
  Loader2,
  ArrowRight,
} from "lucide-react";

const formatCurrency = (value) => `${(value || 0).toLocaleString("vi-VN")} ₫`;

export default function Dashboard() {
  const { isDark } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApi = async () => {
    setLoading(true);
    try {
      const response = await getDashboardOverview();
      if (response && response.status === "success") {
        setDashboardData(response);
      } else {
        toast.error(response.message || "Không thể tải dữ liệu dashboard!");
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến server!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  if (loading || !dashboardData) {
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

  const pendingTasks = dashboardData?.pendingTasks || {};
  const revenueSummary = dashboardData?.revenueSummary || {};
  const quickStats = dashboardData?.quickStats || {};
  const marketTrends = dashboardData?.marketTrends || {};

  const pendingListData = [
    {
      title: "Duyệt sản phẩm mới",
      value: pendingTasks.pendingApprovalProducts,
      icon: FileCheck,
      color: "blue",
      link: "/manager/posts",
    },
    {
      title: "Chờ kiểm định",
      value: pendingTasks.pendingInspectionProducts,
      icon: ClipboardCheck,
      color: "orange",
      link: "/manager/posts",
    },
    {
      title: "Duyệt đơn hàng",
      value: pendingTasks.pendingOrders,
      icon: ShoppingCart,
      color: "green",
      link: "/staff/transactions",
    },
    {
      title: "Tranh chấp đang mở",
      value: pendingTasks.openDisputes,
      icon: AlertTriangle,
      color: "red",
      link: "/manager/disputes",
    },
    {
      title: "Duyệt nâng cấp Seller",
      value: pendingTasks.pendingSellerUpgrades,
      icon: UserCheck,
      color: "purple",
      link: "/staff/user-upgrade",
    },
  ];

  const getIconColor = (color) => {
    const colors = {
      blue: isDark ? "text-blue-400" : "text-blue-500",
      orange: isDark ? "text-orange-400" : "text-orange-500",
      green: isDark ? "text-green-400" : "text-green-500",
      red: isDark ? "text-red-400" : "text-red-500",
      purple: isDark ? "text-purple-400" : "text-purple-500",
    };
    return colors[color] || colors.blue;
  };

  const getIconBg = (color) => {
    const colors = {
      blue: isDark ? "bg-blue-500/20" : "bg-blue-100",
      orange: isDark ? "bg-orange-500/20" : "bg-orange-100",
      green: isDark ? "bg-green-500/20" : "bg-green-100",
      red: isDark ? "bg-red-500/20" : "bg-red-100",
      purple: isDark ? "bg-purple-500/20" : "bg-purple-100",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Header */}
      <div className="mb-8">
        <AuroraText className="text-4xl font-bold mb-2">Dashboard</AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Tổng quan về hoạt động hệ thống
        </p>
      </div>

      {/* Revenue & User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <Link to="/manager/revenue" className="block">
          <div
            className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${
              isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl ${
                  isDark ? "bg-blue-500/20" : "bg-blue-100"
                }`}
              >
                <DollarSign
                  className={`w-6 h-6 ${
                    isDark ? "text-blue-400" : "text-blue-500"
                  }`}
                />
              </div>
            </div>
            <p
              className={`text-sm font-medium mb-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Tổng Doanh Thu
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {formatCurrency(revenueSummary.totalRevenue)}
            </p>
          </div>
        </Link>

        {/* Platform Revenue */}
        <Link to="/manager/revenue" className="block">
          <div
            className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${
              isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl ${
                  isDark ? "bg-green-500/20" : "bg-green-100"
                }`}
              >
                <TrendingUp
                  className={`w-6 h-6 ${
                    isDark ? "text-green-400" : "text-green-500"
                  }`}
                />
              </div>
            </div>
            <p
              className={`text-sm font-medium mb-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Doanh Thu Nền Tảng
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {formatCurrency(revenueSummary.platformRevenue)}
            </p>
          </div>
        </Link>

        {/* Total Users */}
        <Link to="/manager/users" className="block">
          <div
            className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${
              isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl ${
                  isDark ? "bg-purple-500/20" : "bg-purple-100"
                }`}
              >
                <Users
                  className={`w-6 h-6 ${
                    isDark ? "text-purple-400" : "text-purple-500"
                  }`}
                />
              </div>
            </div>
            <p
              className={`text-sm font-medium mb-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Tổng Người Dùng
            </p>
            <p
              className={`text-3xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {(quickStats.totalUsers || 0).toLocaleString()}
            </p>
          </div>
        </Link>

        {/* Total Orders */}
        <div
          className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${
            isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-xl ${
                isDark ? "bg-orange-500/20" : "bg-orange-100"
              }`}
            >
              <ShoppingCart
                className={`w-6 h-6 ${
                  isDark ? "text-orange-400" : "text-orange-500"
                }`}
              />
            </div>
          </div>
          <p
            className={`text-sm font-medium mb-1 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Tổng Đơn Hàng
          </p>
          <p
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {(quickStats.totalOrders || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Pending Tasks & Market Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Tasks */}
        <div
          className={`lg:col-span-1 rounded-2xl p-6 ${
            isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
          }`}
        >
          <h3
            className={`text-xl font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Tác vụ chờ xử lý
          </h3>
          <div className="space-y-4">
            {pendingListData
              .filter((item) => item.value > 0)
              .map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    to={item.link}
                    className={`flex items-center justify-between p-4 rounded-xl transform transition-all duration-300 hover:scale-105 ${
                      isDark
                        ? "bg-gray-700/50 hover:bg-gray-700"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${getIconBg(item.color)}`}
                      >
                        <Icon
                          className={`w-5 h-5 ${getIconColor(item.color)}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.title}
                        </p>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {item.value} tác vụ đang chờ
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xl font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.value}
                      </span>
                      <ArrowRight
                        className={`w-5 h-5 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      />
                    </div>
                  </Link>
                );
              })}
            {pendingListData.filter((item) => item.value > 0).length === 0 && (
              <p
                className={`text-center py-8 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Không có tác vụ nào đang chờ
              </p>
            )}
          </div>
        </div>

        {/* Market Trends */}
        <div className="lg:col-span-2 space-y-6">
          {/* Most Viewed Product */}
          <div
            className={`rounded-2xl p-6 ${
              isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Eye
                className={`w-6 h-6 ${
                  isDark ? "text-blue-400" : "text-blue-500"
                }`}
              />
              <h3
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Sản phẩm được xem nhiều nhất
              </h3>
            </div>
            <p
              className={`text-2xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {marketTrends.mostViewedProduct?.productName || "N/A"}
            </p>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {(marketTrends.mostViewedProduct?.views || 0).toLocaleString()}{" "}
              lượt xem
            </p>
          </div>

          {/* Market Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trending Category */}
            <div
              className={`rounded-2xl p-6 ${
                isDark
                  ? "bg-gray-800/50 backdrop-blur-sm"
                  : "bg-white shadow-lg"
              }`}
            >
              <div
                className={`p-3 rounded-xl mb-4 ${
                  isDark ? "bg-purple-500/20" : "bg-purple-100"
                }`}
              >
                <BarChart3
                  className={`w-6 h-6 ${
                    isDark ? "text-purple-400" : "text-purple-500"
                  }`}
                />
              </div>
              <p
                className={`text-sm font-medium mb-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Danh mục hot
              </p>
              <p
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {marketTrends.trendingCategory || "N/A"}
              </p>
            </div>

            {/* Car Views */}
            <div
              className={`rounded-2xl p-6 ${
                isDark
                  ? "bg-gray-800/50 backdrop-blur-sm"
                  : "bg-white shadow-lg"
              }`}
            >
              <div
                className={`p-3 rounded-xl mb-4 ${
                  isDark ? "bg-blue-500/20" : "bg-blue-100"
                }`}
              >
                <Car
                  className={`w-6 h-6 ${
                    isDark ? "text-blue-400" : "text-blue-500"
                  }`}
                />
              </div>
              <p
                className={`text-sm font-medium mb-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Lượt xem Xe
              </p>
              <p
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {(marketTrends.totalCarViews || 0).toLocaleString()}
              </p>
            </div>

            {/* Battery Views */}
            <div
              className={`rounded-2xl p-6 ${
                isDark
                  ? "bg-gray-800/50 backdrop-blur-sm"
                  : "bg-white shadow-lg"
              }`}
            >
              <div
                className={`p-3 rounded-xl mb-4 ${
                  isDark ? "bg-green-500/20" : "bg-green-100"
                }`}
              >
                <Battery
                  className={`w-6 h-6 ${
                    isDark ? "text-green-400" : "text-green-500"
                  }`}
                />
              </div>
              <p
                className={`text-sm font-medium mb-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Lượt xem Pin
              </p>
              <p
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {(marketTrends.totalBatteryViews || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

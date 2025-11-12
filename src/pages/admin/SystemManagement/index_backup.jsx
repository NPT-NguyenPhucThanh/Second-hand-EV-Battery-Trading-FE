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
    <>
      <Title level={2}>Báo cáo Tổng quan Hệ thống</Title>

      <Title level={4} style={{ marginTop: "20px", marginBottom: "16px" }}>
        Thống kê Người dùng
      </Title>
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem
            title="Tổng Người Dùng"
            value={formatValue(report.totalUsers)}
            icon={<UserOutlined />}
          />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem
            title="Tổng Người Mua (Buyer)"
            value={formatValue(report.totalBuyers)}
            icon={<UserOutlined style={{ color: "#1890ff" }} />}
          />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem
            title="Tổng Người Bán (Seller)"
            value={formatValue(report.totalSellers)}
            icon={<UserOutlined style={{ color: "#52c41a" }} />}
          />
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: "20px", marginBottom: "16px" }}>
        Thống kê Sản phẩm
      </Title>
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem
            title="Tổng Sản Phẩm"
            value={formatValue(report.totalProducts)}
            icon={<AppstoreOutlined />}
          />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem
            title="Xe đang bán"
            value={formatValue(report.carsOnSale)}
            icon={<CarOutlined style={{ color: "#1890ff" }} />}
          />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem
            title="Pin đang bán"
            value={formatValue(report.batteriesOnSale)}
            icon={<ThunderboltOutlined style={{ color: "#52c41a" }} />}
          />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem
            title="Sản phẩm trong kho"
            value={formatValue(report.productsInWarehouse)}
            icon={<InboxOutlined />}
          />
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: "20px", marginBottom: "16px" }}>
        Thống kê Đơn hàng & Tác vụ
      </Title>
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem
            title="Tổng Đơn Hàng"
            value={formatValue(report.totalOrders)}
            icon={<ShoppingCartOutlined />}
          />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem
            title="Đơn hàng hoàn tất"
            value={formatValue(report.completedOrders)}
            icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem
            title="Đơn hàng chờ xử lý"
            value={formatValue(report.pendingOrders)}
            icon={<ClockCircleOutlined style={{ color: "#faad14" }} />}
          />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem
            title="Tranh chấp đang mở"
            value={formatValue(report.openDisputes)}
            icon={<WarningOutlined style={{ color: "#f5222d" }} />}
          />
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: "20px", marginBottom: "16px" }}>
        Xu Hướng Thị Trường
      </Title>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <CardItem title="Thông tin thị trường" icon={<RiseOutlined />}>
            <Descriptions bordered size="small">
              <Descriptions.Item label="Danh mục nổi bật">
                <Tag color="blue">{report.trendingCategory || "N/A"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Sản phẩm xem nhiều nhất" span={2}>
                {report.mostViewedProduct?.productName || "Chưa có dữ liệu"}
              </Descriptions.Item>
              <Descriptions.Item label="Lượt xem (Xe)">
                {formatValue(report.totalCarViews)} <EyeOutlined />
              </Descriptions.Item>
              <Descriptions.Item label="Lượt xem (Pin)">
                {formatValue(report.totalBatteryViews)} <EyeOutlined />
              </Descriptions.Item>
              <Descriptions.Item label="Lượt xem (SP Hot)">
                {formatValue(report.mostViewedProduct?.views)} <EyeOutlined />
              </Descriptions.Item>
            </Descriptions>
          </CardItem>
        </Col>
      </Row>
    </>
  );
}

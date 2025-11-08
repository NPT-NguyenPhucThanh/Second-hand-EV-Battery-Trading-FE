// src/components/profile/RevenueContent.jsx
import React, { useState, useEffect } from "react";
import { Spin, Card, Statistic, Row, Col, Tag, Empty, Divider, message } from "antd";
import { get } from "../../utils/api";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value ?? 0);
};

export default function RevenueContent() {
  const [stats, setStats] = useState(null);     // /statistics
  const [revenue, setRevenue] = useState(null); // /revenue
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [statsRes, revRes] = await Promise.all([
          get("api/seller/statistics"),
          get("api/seller/revenue"),
        ]);

        // --- XỬ LÝ /statistics ---
        if (statsRes?.status === "success" && statsRes.statistics) {
          setStats(statsRes.statistics);
        } else {
          console.warn("API /statistics thiếu dữ liệu → dùng mặc định");
          setStats({
            netRevenue: 0,
            completedCarOrders: 0,
            completedBatteryOrders: 0,
            averageViewsPerProduct: 0,
            mostViewedProduct: null,
            totalBatteries: 0,
            batteryViews: 0,
            totalProducts: 0,
            totalViews: 0,
            totalCars: 0,
            carViews: 0,
          });
        }

        // --- XỬ LÝ /revenue ---
        if (revRes?.status === "success" && revRes.revenue) {
          setRevenue(revRes.revenue);
        } else {
          console.warn("API /revenue thiếu dữ liệu → dùng mặc định");
          setRevenue({
            commissionRate: "5%",
            netRevenue: 0,
            carRevenue: 0,
            commission: 0,
            batteryRevenue: 0,
            totalRevenue: 0,
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError(err.message || "Không thể tải dữ liệu");
        message.error("Không thể tải dữ liệu doanh thu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // === LOADING ===
  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <p className="mt-3 text-gray-500">Đang tải thống kê...</p>
      </div>
    );
  }

  // === LỖI ===
  if (error) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-xs text-gray-500 mt-2">
              Kiểm tra API: <code>/api/seller/statistics</code> và <code>/api/seller/revenue</code>
            </p>
          </div>
        }
        className="py-12"
      />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Thống Kê & Doanh Thu
      </h2>

      {/* === 1. DOANH THU CHI TIẾT === */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
          <i className="fa-solid fa-coins mr-2"></i>
          Doanh Thu Chi Tiết
        </h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm border-l-4 border-l-green-500">
              <Statistic
                title="Doanh thu thuần"
                value={revenue.netRevenue}
                formatter={formatCurrency}
                valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
                prefix={<i className="fa-solid fa-sack-dollar mr-1"></i>}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm border-l-4 border-l-red-500">
              <Statistic
                title="Tổng doanh thu"
                value={revenue.totalRevenue}
                formatter={formatCurrency}
                valueStyle={{ color: "#cf1322", fontWeight: "bold" }}
                prefix={<i className="fa-solid fa-coins mr-1"></i>}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm border-l-4 border-l-orange-500">
              <Statistic
                title="Hoa hồng"
                value={revenue.commission}
                formatter={formatCurrency}
                valueStyle={{ color: "#d4380d", fontWeight: "bold" }}
                prefix={<i className="fa-solid fa-percent mr-1"></i>}
              />
              <div className="text-xs text-gray-500 mt-2">
                Tỷ lệ: {revenue.commissionRate}
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <Statistic
                title="Đơn hàng hoàn tất"
                value={stats.completedCarOrders + stats.completedBatteryOrders}
                valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                prefix={<i className="fa-solid fa-check-circle mr-1"></i>}
              />
              <div className="text-xs text-gray-500 mt-2">
                Xe: {stats.completedCarOrders} | Pin: {stats.completedBatteryOrders}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* === 2. DOANH THU THEO LOẠI === */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
          <i className="fa-solid fa-chart-pie mr-2"></i>
          Doanh Thu Theo Loại
        </h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title={<span><i className="fa-solid fa-car text-blue-600 mr-2"></i> Xe điện</span>}
              className="shadow-sm"
            >
              <Statistic
                title="Doanh thu"
                value={revenue.carRevenue}
                formatter={formatCurrency}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title={<span><i className="fa-solid fa-battery-full text-green-600 mr-2"></i> Pin</span>}
              className="shadow-sm"
            >
              <Statistic
                title="Doanh thu"
                value={revenue.batteryRevenue}
                formatter={formatCurrency}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* === 3. THỐNG KÊ LƯỢT XEM === */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-purple-700 mb-4 flex items-center">
          <i className="fa-solid fa-chart-line mr-2"></i>
          Thống Kê Lượt Xem
        </h3>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12}>
            <Card
              title={<span><i className="fa-solid fa-trophy text-yellow-500 mr-2"></i> Sản phẩm nổi bật</span>}
              className="shadow-sm"
            >
              {stats.mostViewedProduct ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg line-clamp-1">
                      {stats.mostViewedProduct.productName}
                    </p>
                    <p className="text-sm text-gray-600">ID: #{stats.mostViewedProduct.productId}</p>
                    <Tag
                      color={stats.mostViewedProduct.type === "Battery" ? "green" : "blue"}
                      className="mt-1"
                    >
                      {stats.mostViewedProduct.type === "Battery" ? "Pin" : "Xe"}
                    </Tag>
                  </div>
                  <Statistic
                    value={stats.mostViewedProduct.views}
                    prefix={<i className="fa-solid fa-eye text-blue-600 mr-1"></i>}
                    valueStyle={{ color: "#1890ff", fontSize: "1.8rem" }}
                  />
                </div>
              ) : (
                <p className="text-gray-500">Chưa có</p>
              )}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title={<span><i className="fa-solid fa-eye text-purple-600 mr-2"></i> Tổng quan</span>}
              className="shadow-sm"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Tổng lượt xem" value={stats.totalViews} />
                </Col>
                <Col span={12}>
                  <Statistic title="Số sản phẩm" value={stats.totalProducts} />
                </Col>
                <Col span={24} className="mt-3">
                  <Statistic
                    title="Lượt xem trung bình"
                    value={stats.averageViewsPerProduct}
                    prefix={<i className="fa-solid fa-calculator mr-1"></i>}
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title={<span><i className="fa-solid fa-battery-full text-green-600 mr-2"></i> Pin</span>}
              className="shadow-sm"
            >
              <Statistic title="Số lượng" value={stats.totalBatteries} />
              <Statistic title="Lượt xem" value={stats.batteryViews} prefix={<i className="fa-solid fa-eye"></i>} />
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title={<span><i className="fa-solid fa-car text-blue-600 mr-2"></i> Xe điện</span>}
              className="shadow-sm"
            >
              <Statistic title="Số lượng" value={stats.totalCars} />
              <Statistic title="Lượt xem" value={stats.carViews} prefix={<i className="fa-solid fa-eye"></i>} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
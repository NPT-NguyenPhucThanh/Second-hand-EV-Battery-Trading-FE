import React, { useEffect, useState } from 'react';
import { Row, Col, message, Spin } from 'antd';
import { Link } from "react-router-dom";
import CardItem from '../../../components/admin/CardItem';
import LineChart from '../../../components/admin/LineChart';
import PieChart from '../../../components/admin/PieChart';
import AdminBreadcrumb from '../../../components/admin/AdminBreadcrumb';
import { getDashboardOverview } from '../../../services/managerSystemService';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  DollarCircleOutlined,
  RiseOutlined,
  BarChartOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  CarOutlined,
  FileDoneOutlined
} from '@ant-design/icons';

// Dữ liệu mẫu cho biểu đồ, vì API không trả về dữ liệu chi tiết
import { revenueData, carStatusData } from '../../../dataAdmin';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApi = async () => {
    setLoading(true);
    try {
      const response = await getDashboardOverview();
      if (response && response.status === 'success') {
        setDashboardData(response);
      } else {
        message.error(response.message || "Không thể tải dữ liệu dashboard!");
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', marginTop: '50px' }} />;
  }

  // Gán giá trị từ API vào các biến để dễ sử dụng
  const pendingTasks = dashboardData?.pendingTasks || {};
  const revenueSummary = dashboardData?.revenueSummary || {};
  const quickStats = dashboardData?.quickStats || {};
  const marketTrends = dashboardData?.marketTrends || {};

  return (
    <>
      <AdminBreadcrumb />
      
      {/* Hàng 1: Doanh thu & Người dùng */}
      <h3 style={{ marginBottom: 16 }}>Doanh Thu & Người Dùng</h3>
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24} xs={24}>
          <Link to="/manager/revenue">
            <CardItem title="Tổng Doanh Thu" value={`${revenueSummary.totalRevenue?.toLocaleString('vi-VN')} ₫`} icon={<DollarCircleOutlined style={{ color: '#1890ff' }} />} />
          </Link>
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24} xs={24}>
          <Link to="/manager/revenue">
            <CardItem title="Doanh Thu Nền Tảng" value={`${revenueSummary.platformRevenue?.toLocaleString('vi-VN')} ₫`} icon={<RiseOutlined style={{ color: '#52c41a' }} />} />
          </Link>
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24} xs={24}>
          <Link to="/manager/users">
            <CardItem title="Tổng Người Dùng" value={quickStats.totalUsers} icon={<UserOutlined style={{ color: '#722ed1' }} />} />
          </Link>
        </Col>
         <Col xxl={6} xl={6} lg={12} md={12} sm={24} xs={24}>
          <CardItem title="Tổng Đơn Hàng" value={quickStats.totalOrders} icon={<ShoppingOutlined style={{ color: '#faad14' }} />} />
        </Col>
      </Row>
      
      {/* Hàng 2: Xu Hướng Thị Trường */}
      <h3 style={{ marginTop: 20, marginBottom: 16 }}>Xu Hướng Thị Trường</h3>
      <Row gutter={[20, 20]}>
         <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
            <CardItem title="Sản phẩm được xem nhiều nhất" icon={<EyeOutlined />}>
              <p style={{ margin: 0, fontWeight: 600 }}>{marketTrends.mostViewedProduct?.productName || 'N/A'}</p>
              <small>{marketTrends.mostViewedProduct?.views || 0} lượt xem</small>
            </CardItem>
        </Col>
        <Col xxl={4} xl={4} lg={8} md={8} sm={24} xs={24}>
            <CardItem title="Danh mục hot" value={marketTrends.trendingCategory} icon={<BarChartOutlined />} />
        </Col>
        <Col xxl={4} xl={4} lg={8} md={8} sm={24} xs={24}>
            <CardItem title="Lượt xem Xe" value={marketTrends.totalCarViews} icon={<CarOutlined />} />
        </Col>
        <Col xxl={4} xl={4} lg={8} md={8} sm={24} xs={24}>
            <CardItem title="Lượt xem Pin" value={marketTrends.totalBatteryViews} icon={<ThunderboltOutlined />} />
        </Col>
      </Row>

      {/* Hàng 3: Biểu đồ (vẫn dùng dữ liệu mẫu) */}
      <Row gutter={[20, 20]} className='mt-20'>
        <Col xxl={16} xl={16} lg={24} md={24} sm={24} xs={24}>
          <CardItem title="Doanh thu theo tháng (Dữ liệu mẫu)" style={{ height: '400px' }} >
            <LineChart data={revenueData} />
          </CardItem>
        </Col>
        <Col xxl={8} xl={8} lg={24} md={24} sm={24} xs={24}>
          <CardItem title="Tác vụ chờ xử lý (Dữ liệu mẫu)" style={{ height: '400px' }} >
             {/* Component PieChart có thể không phù hợp, bạn có thể thay bằng danh sách hoặc một biểu đồ cột nhỏ */}
            <PieChart data={carStatusData} />
          </CardItem>
        </Col>
      </Row>
    </>
  )
}
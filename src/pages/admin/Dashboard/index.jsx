import React, { useEffect, useState } from 'react';
import { Row, Col, message, Spin, List, Typography } from 'antd'; 
import { Link } from "react-router-dom";
import CardItem from '../../../components/admin/CardItem';
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
  FileProtectOutlined, 
  AuditOutlined,       
  WarningOutlined,    
  UserSwitchOutlined   
} from '@ant-design/icons';

const { Title } = Typography;

const formatCurrency = (value) => `${(value || 0).toLocaleString('vi-VN')} ₫`;

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

  if (loading || !dashboardData) {
    return <Spin size="large" style={{ display: 'block', marginTop: '50px' }} />;
  }

  const pendingTasks = dashboardData?.pendingTasks || {};
  const revenueSummary = dashboardData?.revenueSummary || {};
  const quickStats = dashboardData?.quickStats || {};
  const marketTrends = dashboardData?.marketTrends || {};

  const pendingListData = [
    {
      title: 'Duyệt sản phẩm mới',
      value: pendingTasks.pendingApprovalProducts,
      icon: <FileProtectOutlined style={{ color: '#1890ff' }} />,
      link: '/manager/posts' 
    },
    {
      title: 'Chờ kiểm định',
      value: pendingTasks.pendingInspectionProducts,
      icon: <AuditOutlined style={{ color: '#faad14' }} />,
      link: '/manager/posts' 
    },
    {
      title: 'Duyệt đơn hàng',
      value: pendingTasks.pendingOrders,
      icon: <ShoppingOutlined style={{ color: '#52c41a' }} />,
      link: '/staff/transactions' 
    },
    {
      title: 'Tranh chấp đang mở',
      value: pendingTasks.openDisputes,
      icon: <WarningOutlined style={{ color: '#f5222d' }} />,
      link: '/manager/disputes' 
    },
    {
      title: 'Duyệt nâng cấp Seller',
      value: pendingTasks.pendingSellerUpgrades,
      icon: <UserSwitchOutlined style={{ color: '#722ed1' }} />,
      link: '/staff/user-upgrade' 
    }
  ];

  return (
    <>
      {/* KHỐI 1: DOANH THU & NGƯỜI DÙNG */}
      <Title level={3} style={{ marginBottom: 16 }}>Doanh Thu & Người Dùng</Title>
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24} xs={24}>
          <Link to="/manager/revenue">
            <CardItem title="Tổng Doanh Thu" value={formatCurrency(revenueSummary.totalRevenue)} icon={<DollarCircleOutlined style={{ color: '#1890ff' }} />} />
          </Link>
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24} xs={24}>
          <Link to="/manager/revenue">
            <CardItem title="Doanh Thu Nền Tảng" value={formatCurrency(revenueSummary.platformRevenue)} icon={<RiseOutlined style={{ color: '#52c41a' }} />} />
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

      {/* KHỐI 2: TÁC VỤ CHỜ & XU HƯỚNG */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        {/* TÁC VỤ CHỜ (Sử dụng dữ liệu thật) */}
        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
           <CardItem title="Tác vụ chờ xử lý" style={{ height: '100%' }}>
              <List
                itemLayout="horizontal"
                dataSource={pendingListData.filter(item => item.value > 0)} // Chỉ hiển thị tác vụ có giá trị > 0
                locale={{ emptyText: "Không có tác vụ nào đang chờ" }}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={React.cloneElement(item.icon, { style: { ...item.icon.props.style, fontSize: '24px' } })}
                      title={<Link to={item.link} style={{ color: 'var(--text-primary)' }}>{item.title}</Link>}
                      description={`Có ${item.value} tác vụ đang chờ`}
                    />
                    <span style={{ fontSize: 20, fontWeight: 'bold' }}>{item.value}</span>
                  </List.Item>
                )}
              />
           </CardItem>
        </Col>

        {/* XU HƯỚNG THỊ TRƯỜNG */}
        <Col xxl={16} xl={16} lg={12} md={12} sm={24} xs={24}>
           <Row gutter={[20, 20]}>
              <Col span={24}>
                  <CardItem title="Sản phẩm được xem nhiều nhất" icon={<EyeOutlined />}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{marketTrends.mostViewedProduct?.productName || 'N/A'}</p>
                    <small>{marketTrends.mostViewedProduct?.views || 0} lượt xem</small>
                  </CardItem>
              </Col>
              <Col xxl={8} xl={8} lg={8} md={8} sm={24} xs={24}>
                  <CardItem title="Danh mục hot" value={marketTrends.trendingCategory} icon={<BarChartOutlined />} />
              </Col>
              <Col xxl={8} xl={8} lg={8} md={8} sm={24} xs={24}>
                  <CardItem title="Lượt xem Xe" value={marketTrends.totalCarViews} icon={<CarOutlined />} />
              </Col>
              <Col xxl={8} xl={8} lg={8} md={8} sm={24} xs={24}>
                  <CardItem title="Lượt xem Pin" value={marketTrends.totalBatteryViews} icon={<ThunderboltOutlined />} />
              </Col>
           </Row>
        </Col>
      </Row>
    </>
  )
}
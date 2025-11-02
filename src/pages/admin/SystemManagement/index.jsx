import React, { useEffect, useState } from 'react';
import { Row, Col, message, Spin, Descriptions, Tag, Typography } from 'antd';
import { 
  UserOutlined, 
  AppstoreOutlined, 
  ShoppingCartOutlined, 
  WarningOutlined, 
  EyeOutlined, 
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  CarOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import CardItem from '../../../components/admin/CardItem';
import { getReportSystem } from '../../../services/managerSystemService'; 

const { Title } = Typography;

export default function SystemManagement() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSystemReport = async () => {
    setLoading(true);
    try {
      const response = await getReportSystem();
      setReport(response);
    } catch (error) {
      message.error("Không thể tải báo cáo hệ thống!");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemReport();
  }, []);

  if (loading || !report) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  const formatValue = (value) => (value !== null && value !== undefined) ? value : 0;

  return (
    <>
      <Title level={2}>Báo cáo Tổng quan Hệ thống</Title>

      <Title level={4} style={{ marginTop: '20px', marginBottom: '16px' }}>Thống kê Người dùng</Title>
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Người Dùng" value={formatValue(report.totalUsers)} icon={<UserOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Người Mua (Buyer)" value={formatValue(report.totalBuyers)} icon={<UserOutlined style={{ color: '#1890ff' }} />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Người Bán (Seller)" value={formatValue(report.totalSellers)} icon={<UserOutlined style={{ color: '#52c41a' }} />} />
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: '20px', marginBottom: '16px' }}>Thống kê Sản phẩm</Title>
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Sản Phẩm" value={formatValue(report.totalProducts)} icon={<AppstoreOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Xe đang bán" value={formatValue(report.carsOnSale)} icon={<CarOutlined style={{ color: '#1890ff' }} />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Pin đang bán" value={formatValue(report.batteriesOnSale)} icon={<ThunderboltOutlined style={{ color: '#52c41a' }} />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Sản phẩm trong kho" value={formatValue(report.productsInWarehouse)} icon={<InboxOutlined />} />
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: '20px', marginBottom: '16px' }}>Thống kê Đơn hàng & Tác vụ</Title>
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Đơn Hàng" value={formatValue(report.totalOrders)} icon={<ShoppingCartOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Đơn hàng hoàn tất" value={formatValue(report.completedOrders)} icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Đơn hàng chờ xử lý" value={formatValue(report.pendingOrders)} icon={<ClockCircleOutlined style={{ color: '#faad14' }} />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tranh chấp đang mở" value={formatValue(report.openDisputes)} icon={<WarningOutlined style={{ color: '#f5222d' }} />} />
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: '20px', marginBottom: '16px' }}>Xu Hướng Thị Trường</Title>
       <Row gutter={[20, 20]}>
        <Col span={24}>
            <CardItem title="Thông tin thị trường" icon={<RiseOutlined />}>
                <Descriptions bordered size="small">
                    <Descriptions.Item label="Danh mục nổi bật">
                        <Tag color="blue">{report.trendingCategory || 'N/A'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Sản phẩm xem nhiều nhất" span={2}>
                        {report.mostViewedProduct?.productName || 'Chưa có dữ liệu'}
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
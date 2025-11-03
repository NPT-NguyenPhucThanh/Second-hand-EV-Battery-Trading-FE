import React, { useEffect, useState } from 'react';
import { Row, Col, message, Spin, Descriptions, Tag } from 'antd';
import { UserOutlined, AppstoreOutlined, ShoppingCartOutlined, WarningOutlined, EyeOutlined, RiseOutlined } from '@ant-design/icons';
import AdminBreadcrumb from '../../../components/admin/AdminBreadcrumb';
import CardItem from '../../../components/admin/CardItem';
import { getReportSystem } from '../../../services/managerSystemService';

export default function SystemManagement() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSystemReport = async () => {
    setLoading(true);
    try {
      const response = await getReportSystem();
      // API của bạn trả về dữ liệu trực tiếp
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

  return (
    <>
      <AdminBreadcrumb />
      <h2>Báo cáo Tổng quan Hệ thống</h2>

      {/* Hàng 1: Thống kê Người dùng */}
      <h3 style={{ marginTop: '20px', marginBottom: '16px' }}>Thống kê Người dùng</h3>
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Người Dùng" value={report.totalUsers} icon={<UserOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Người Mua (Buyer)" value={report.totalBuyers} icon={<UserOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Người Bán (Seller)" value={report.totalSellers} icon={<UserOutlined />} />
        </Col>
      </Row>

      {/* Hàng 2: Thống kê Sản phẩm */}
      <h3 style={{ marginTop: '20px', marginBottom: '16px' }}>Thống kê Sản phẩm</h3>
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Sản Phẩm" value={report.totalProducts} icon={<AppstoreOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Xe đang bán" value={report.carsOnSale} icon={<AppstoreOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Pin đang bán" value={report.batteriesOnSale} icon={<AppstoreOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Sản phẩm trong kho" value={report.productsInWarehouse} icon={<AppstoreOutlined />} />
        </Col>
      </Row>

      {/* Hàng 3: Thống kê Đơn hàng và Tranh chấp */}
      <h3 style={{ marginTop: '20px', marginBottom: '16px' }}>Thống kê Đơn hàng & Tranh chấp</h3>
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Đơn Hàng" value={report.totalOrders} icon={<ShoppingCartOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Đơn hàng hoàn tất" value={report.completedOrders} icon={<ShoppingCartOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Đơn hàng chờ xử lý" value={report.pendingOrders} icon={<ShoppingCartOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tranh chấp đang mở" value={report.openDisputes} icon={<WarningOutlined />} />
        </Col>
      </Row>
      
      {/* Hàng 4: Xu hướng thị trường */}
      <h3 style={{ marginTop: '20px', marginBottom: '16px' }}>Xu Hướng Thị Trường</h3>
       <Row gutter={[20, 20]}>
        <Col span={24}>
            <CardItem title="Thông tin thị trường" icon={<RiseOutlined />}>
                <Descriptions bordered>
                    <Descriptions.Item label="Danh mục nổi bật">
                        <Tag color="blue">{report.trendingCategory}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Sản phẩm xem nhiều nhất">
                        {report.mostViewedProduct?.productName || 'Chưa có dữ liệu'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Lượt xem">
                        {report.mostViewedProduct?.views || 0} <EyeOutlined />
                    </Descriptions.Item>
                </Descriptions>
            </CardItem>
        </Col>
      </Row>
    </>
  );
}
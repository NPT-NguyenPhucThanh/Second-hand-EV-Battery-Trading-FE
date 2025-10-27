import React, { useEffect, useState } from 'react';
import { Row, Col, message, Spin } from 'antd';
import { DollarCircleOutlined, RiseOutlined, ShoppingCartOutlined, GiftOutlined, CarOutlined, ThunderboltOutlined } from '@ant-design/icons';
import AdminBreadcrumb from '../../../components/admin/AdminBreadcrumb';
import CardItem from '../../../components/admin/CardItem';
import LineChart from '../../../components/admin/LineChart';
import { getRevenue } from '../../../services/managerSystemService';
import { revenueData } from '../../../dataAdmin'; // Dùng dữ liệu mẫu cho biểu đồ

export default function RevenueManagement() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenueReport = async () => {
    setLoading(true);
    try {
      const response = await getRevenue();
      // API của bạn trả về dữ liệu trực tiếp, không có key 'status'
      setReport(response);
    } catch (error) {
      message.error("Không thể tải báo cáo doanh thu!");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueReport();
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  const formatCurrency = (value) => `${(value || 0).toLocaleString('vi-VN')} ₫`;

  return (
    <>
      <AdminBreadcrumb />
      <h2>Báo cáo Doanh thu</h2>

      {/* Hàng 1: Các chỉ số doanh thu chính */}
      <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Doanh Thu (Từ Bán Hàng)" value={formatCurrency(report?.totalRevenue)} icon={<DollarCircleOutlined style={{ color: '#1890ff' }} />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Doanh Thu Nền Tảng" value={formatCurrency(report?.platformRevenue)} icon={<RiseOutlined style={{ color: '#52c41a' }} />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Tổng Hoa Hồng (5%)" value={formatCurrency(report?.totalCommission)} icon={<ShoppingCartOutlined style={{ color: '#faad14' }} />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
          <CardItem title="Doanh Thu Bán Gói" value={formatCurrency(report?.packageRevenue)} icon={<GiftOutlined style={{ color: '#722ed1' }} />} />
        </Col>
      </Row>

      {/* Hàng 2: Chi tiết doanh thu theo loại sản phẩm */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
            <CardItem title="Doanh Thu Bán Xe" value={formatCurrency(report?.carRevenue)} icon={<CarOutlined />} />
        </Col>
        <Col xxl={6} xl={6} lg={12} md={12} sm={24}>
            <CardItem title="Doanh Thu Bán Pin" value={formatCurrency(report?.batteryRevenue)} icon={<ThunderboltOutlined />} />
        </Col>
      </Row>

      {/* Hàng 3: Biểu đồ */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col span={24}>
          <CardItem title="Biểu đồ Doanh thu (Sử dụng dữ liệu mẫu)" style={{ height: '400px' }}>
            <LineChart data={revenueData} />
            <p style={{textAlign: 'center', color: '#888', marginTop: '10px'}}>Lưu ý: Biểu đồ này sử dụng dữ liệu mẫu. Cần API trả về dữ liệu theo chuỗi thời gian để hiển thị chính xác.</p>
          </CardItem>
        </Col>
      </Row>
    </>
  );
}
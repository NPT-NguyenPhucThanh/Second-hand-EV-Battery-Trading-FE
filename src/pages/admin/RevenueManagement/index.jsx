import React, { useEffect, useState } from 'react';
import { Table, message, Spin, Typography } from 'antd';
import { getRevenue } from '../../../services/managerSystemService';

const { Title, Text } = Typography;

const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    return value; 
  }
  return `${value.toLocaleString('vi-VN')} ₫`;
};

export default function RevenueManagement() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueReport = async () => {
      setLoading(true);
      try {
        const response = await getRevenue();
        setReport(response); 
      } catch (error) {
        message.error("Không thể tải báo cáo doanh thu!");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueReport();
  }, []);

  if (loading || !report) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  const dataSource = [
    {
      key: '1',
      item: 'Tổng Doanh Thu (Từ Bán Hàng)',
      value: formatCurrency(report.totalRevenue),
    },
    {
      key: '2',
      item: 'Doanh Thu Nền Tảng (Lợi nhuận)',
      value: formatCurrency(report.platformRevenue),
    },
    {
      key: '3',
      item: 'Tổng Hoa Hồng (Tạm tính)',
      value: `${formatCurrency(report.totalCommission)} (${report.commissionRate})`, 
    },
    {
      key: '4',
      item: 'Doanh Thu Bán Gói Dịch Vụ',
      value: formatCurrency(report.packageRevenue),
    },
    {
      key: '5',
      item: 'Doanh Thu Bán Xe',
      value: formatCurrency(report.carRevenue),
    },
    {
      key: '6',
      item: 'Doanh Thu Bán Pin',
      value: formatCurrency(report.batteryRevenue),
    },
    {
      key: '7',
      item: 'Số Đơn Hàng Hoàn Tất',
      value: report.totalCompletedOrders?.toLocaleString('vi-VN'),
    },
    {
      key: '8',
      item: 'Số Gói Dịch Vụ Đã Bán',
      value: report.totalPackagesSold?.toLocaleString('vi-VN'),
    },
  ];

  const columns = [
    {
      title: 'Chỉ mục Báo cáo',
      dataIndex: 'item',
      key: 'item',
      width: '70%', 
      render: (text) => <Text strong>{text}</Text>, 
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      width: '30%',
    },
  ];

  return (
    <>
      <Title level={2}>Báo cáo Doanh thu</Title>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        Dữ liệu tổng hợp từ các đơn hàng đã hoàn tất trong hệ thống.
      </Text>

      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered 
        rowKey="key"
      />
    </>
  );
}
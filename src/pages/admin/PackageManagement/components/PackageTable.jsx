import React from 'react';
import { Table, Button, Space, Modal } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const PackageTable = ({
  dataSource,
  loading,
  packageType,
  onAdd,
  onEdit,
  onDelete
}) => {
  
  const baseColumns = [
    { title: 'Mã gói', dataIndex: 'packageid', key: 'packageid' },
    { title: 'Tên gói', dataIndex: 'name', key: 'name' },
    { title: 'Thời hạn (tháng)', dataIndex: 'durationMonths', key: 'durationMonths' },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (price ? price.toLocaleString('vi-VN') : 0),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString('vi-VN')
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>Sửa</Button>
          <Button icon={<DeleteOutlined />} onClick={() => onDelete(record.packageid)}>Xóa</Button>
        </Space>
        </>
      ),
    },
  ];

  const specificColumn = packageType === 'BATTERY'
    ? { title: 'Pin tối đa', dataIndex: 'maxBatteries', key: 'maxBatteries' }
    : { title: 'Xe tối đa', dataIndex: 'maxCars', key: 'maxCars' };

  const columns = [...baseColumns.slice(0, 4), specificColumn, ...baseColumns.slice(4)];

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onAdd}
        style={{ marginBottom: 16 }}
      >
        Tạo {packageType === 'BATTERY' ? 'gói pin' : 'gói xe'}
      </Button>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="packageid"
        pagination={{ pageSize: 5 }}
        loading={loading}
      />
    </>
  );
};

export default PackageTable;

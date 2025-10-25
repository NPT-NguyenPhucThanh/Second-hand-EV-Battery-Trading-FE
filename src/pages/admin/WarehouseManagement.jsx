import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Image, Modal } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useWarehouseProducts } from '../../services/warehouseService'; // Import hook

// Hàm helper để tạo Tag màu mè cho trạng thái
const getStatusTag = (status) => {
  switch (status) {
    case 'CHO_DUYET':
      return <Tag color="gold">Chờ duyệt</Tag>;
    case 'DA_DUYET': // Giả sử có trạng thái này
      return <Tag color="green">Đã duyệt</Tag>;
    case 'TU_CHOI': // Giả sử có trạng thái này
      return <Tag color="red">Từ chối</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

export default function WarehouseManagement() {
  
  const { products, loading, fetchProducts } = useWarehouseProducts();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  console.log(products);// mảng trống là sao
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
  };
  
  // Định nghĩa các cột cho bảng
  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'productid',
      key: 'productid',
      // Nhắc nhở: đổi thành productId nếu backend dùng camelCase
    },
    {
      title: 'Ảnh',
      dataIndex: 'imgs',
      key: 'imgs',
      render: (imgs) => {
        // Dùng optional chaining (?.) để tránh lỗi nếu imgs là null hoặc rỗng
        const imageUrl = imgs?.[0]?.url;
        return imageUrl ? <Image width={60} src={imageUrl} /> : 'Không có ảnh';
      },
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productname',
      key: 'productname',
    },
    {
      title: 'Người bán',
      dataIndex: 'users',
      key: 'seller',
      render: (user) => user?.displayname || 'Không xác định',
    },
    {
      title: 'Số lượng',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'cost',
      key: 'cost',
      render: (price) => (price ? price.toLocaleString('vi-VN') : 0),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
            Xem
          </Button>
          <Button icon={<EditOutlined />} onClick={() => { /* Logic sửa */ }}>
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <h2>Quản lý kho hàng 🚚</h2>
      
      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="productid" // Nhớ đổi thành productId nếu cần
        pagination={{ pageSize: 10 }}
      />

      {/* Modal để xem thông tin chi tiết */}
      <Modal
        title="Chi tiết sản phẩm"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedProduct && (
          <div>
            <h3>{selectedProduct.productname}</h3>
            <p><strong>Mô tả:</strong> {selectedProduct.description}</p>
            <p><strong>Thông số:</strong> {selectedProduct.specs}</p>
            <p><strong>Model:</strong> {selectedProduct.model}</p>
            {/* Hiển thị thêm các thông tin chi tiết khác từ selectedProduct */}
          </div>
        )}
      </Modal>
    </>
  );
}
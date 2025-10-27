import React from 'react';
import { Modal, Descriptions, Tag, Table, Image, Button } from 'antd';

const TransactionDetailModal = ({ order, visible, onClose }) => {
  if (!order) return null;

  const productColumns = [
    { 
      title: 'Sản phẩm', 
      dataIndex: ['products', 'productname'], 
      key: 'name' 
    },
    { 
        title: 'Ảnh', 
        dataIndex: ['products', 'imgs'], 
        key: 'image',
        render: (imgs) => (
            imgs && imgs.length > 0 
            ? <Image src={imgs[0].url} width={50} /> 
            : 'N/A'
        )
    },
    { 
      title: 'Số lượng', 
      dataIndex: 'quantity', 
      key: 'quantity' 
    },
    { 
      title: 'Đơn giá', 
      dataIndex: 'unit_price', 
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')} ₫`
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={`Chi tiết Giao dịch #${order.orderid}`}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={900}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Mã Đơn hàng">{order.orderid}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
            <Tag color="blue">{order.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tên người mua">{order.users?.displayname || order.users?.username}</Descriptions.Item>
        <Descriptions.Item label="Email">{order.users?.email}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ giao hàng" span={2}>{order.shippingaddress}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{new Date(order.createdat).toLocaleString('vi-VN')}</Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">{order.paymentmethod}</Descriptions.Item>
        <Descriptions.Item label="Tổng tiền (chưa ship)">{order.totalamount?.toLocaleString('vi-VN')} ₫</Descriptions.Item>
        <Descriptions.Item label="Phí ship">{order.shippingfee?.toLocaleString('vi-VN')} ₫</Descriptions.Item>
        <Descriptions.Item label="Tổng cuối cùng" span={2}>
            <strong>{order.totalfinal?.toLocaleString('vi-VN')} ₫</strong>
        </Descriptions.Item>
      </Descriptions>
      
      <h3 style={{ marginTop: 20, marginBottom: 10 }}>Các sản phẩm trong đơn</h3>
      <Table
        columns={productColumns}
        dataSource={order.details || []}
        rowKey="detailid"
        pagination={false}
      />
    </Modal>
  );
};

export default TransactionDetailModal;
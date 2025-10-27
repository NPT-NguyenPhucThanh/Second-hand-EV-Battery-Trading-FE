import React from 'react';
import { Modal, Descriptions, Image, Tag, Button } from 'antd';

const UserDetailModal = ({ user, visible, onClose }) => {
  if (!user) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={`Chi tiết người dùng: ${user.username}`}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={800}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="UserID">{user.userId}</Descriptions.Item>
        <Descriptions.Item label="Tên đăng nhập">{user.username}</Descriptions.Item>
        <Descriptions.Item label="Tên hiển thị">{user.displayName || 'Chưa cập nhật'}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{user.phone || 'Chưa cập nhật'}</Descriptions.Item>
        <Descriptions.Item label="Vai trò">
          {user.roles?.map(role => <Tag key={role}>{role}</Tag>)}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{new Date(user.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{user.isActive ? 'Hoạt động' : 'Bị khóa'}</Descriptions.Item>
        
        {/* Hiển thị thông tin nâng cấp seller */}
        <Descriptions.Item label="Trạng thái Seller" span={2}>
          {user.sellerUpgradeStatus || 'Chưa yêu cầu'}
        </Descriptions.Item>
        
        {user.cccdFrontUrl && (
          <Descriptions.Item label="Ảnh CCCD mặt trước" span={1}>
            <Image width={200} src={user.cccdFrontUrl} />
          </Descriptions.Item>
        )}
        
        {user.cccdBackUrl && (
          <Descriptions.Item label="Ảnh CCCD mặt sau" span={1}>
            <Image width={200} src={user.cccdBackUrl} />
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
};

export default UserDetailModal;
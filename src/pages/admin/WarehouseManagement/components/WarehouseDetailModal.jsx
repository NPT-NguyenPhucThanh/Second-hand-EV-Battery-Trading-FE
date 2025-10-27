import React from "react";
import { Modal, Descriptions, Tag, Badge } from "antd";

export default function WarehouseDetailModal({ open, onClose, product }) {
  if (!product) return null;

  return (
    <Modal
      title="Chi tiết sản phẩm"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Tên sản phẩm">
          {product.productname}
        </Descriptions.Item>
        <Descriptions.Item label="Giá">
          {product.cost?.toLocaleString("vi-VN")} ₫
        </Descriptions.Item>

        <Descriptions.Item label="Người bán">
          {product.users?.displayname || product.users?.username}
        </Descriptions.Item>
        <Descriptions.Item label="SĐT">
          {product.users?.phone || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái" span={2}>
          {(() => {
            const statusMap = {
              DANG_BAN: { color: "green", label: "Đang bán" },
              DA_BAN: { color: "volcano", label: "Đã bán" },
              CHO_DUYET: { color: "blue", label: "Chờ duyệt" },
              DA_DUYET: { color: "geekblue", label: "Đã duyệt" },
              HUY_BO: { color: "red", label: "Đã hủy" },
            };

            const current = statusMap[product.status] || {
              color: "default",
              label: product.status,
            };
            return <Tag color={current.color}>{current.label}</Tag>;
          })()}
        </Descriptions.Item>

        <Descriptions.Item label="Trong kho" span={2}>
          {product.inWarehouse ? (
            <Badge status="processing" text="Còn trong kho" />
          ) : (
            <Badge status="default" text="Đã xuất kho" />
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Mô tả" span={2}>
          {product.description}
        </Descriptions.Item>

        <Descriptions.Item label="Năm SX">
          {product.brandcars?.year || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Màu sắc">
          {product.brandcars?.color || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Odo (km)">
          {product.brandcars?.odo?.toLocaleString("vi-VN") || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Lượt xem">
          {product.viewCount}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}

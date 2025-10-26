// components/WarehouseUpdate.jsx

import React, { useState } from "react";
import { Button, Popconfirm, Select, message, Space } from "antd";
import { EditOutlined } from "@ant-design/icons";
// Đảm bảo bạn đã tạo hàm này trong service
import { updateProductStatus } from "../../../../services/warehouseService";

// Danh sách các trạng thái để người dùng lựa chọn
const statusOptions = [
  { value: "CHO_DUYET", label: "Chờ duyệt sơ bộ" },
  { value: "CHO_KIEM_DUYET", label: "Chờ kiểm định" },
  { value: "DA_DUYET", label: "Đã duyệt - Chờ ký hợp đồng" },
  { value: "DANG_BAN", label: "Đang bán" },
  { value: "DA_BAN", label: "Đã bán" },
  { value: "BI_TU_CHOI", label: "Bị từ chối" },
  { value: "KHONG_DAT_KIEM_DINH", label: "Không đạt kiểm định" },
  { value: "HET_HAN", label: "Hết hạn gói" },
  { value: "REMOVED_FROM_WAREHOUSE", label: "Đã gỡ khỏi kho" },
];

export default function WarehouseUpdate({ record, onReload, type }) {
  const [newStatus, setNewStatus] = useState(record.status);
  const [popconfirmOpen, setPopconfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleConfirm = async () => {
    if (newStatus === record.status) {
      setPopconfirmOpen(false);
      return; // Không làm gì nếu trạng thái không đổi
    }

    setLoading(true);

    const response = await updateProductStatus(record.productid, newStatus);
    console.log(response)
    if (response) {
      onReload();
      messageApi.success("Cập nhật trạng thái thành công!");
    } else {
      messageApi.error("Cập nhật trạng thái thất bại!");
    }
    setLoading(false);
    setPopconfirmOpen(false);
  };

  const handleCancel = () => {
    setNewStatus(record.status); 
    setPopconfirmOpen(false);
  };

  const popconfirmTitle = (
    <Space direction="vertical">
      <span>Chọn trạng thái mới cho sản phẩm:</span>
      <Select
        defaultValue={record.status}
        style={{ width: 250 }}
        onChange={(value) => setNewStatus(value)} 
        options={statusOptions}
        onClick={(e) => e.stopPropagation()}
      />
    </Space>
  );

  return (
    <>
      {contextHolder}
      <Popconfirm
        title={popconfirmTitle}
        open={popconfirmOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{ loading: loading }}
      >
        <Button
          type={type}
          icon={<EditOutlined />}
          onClick={() => setPopconfirmOpen(true)}
        >
          Cập nhật
        </Button>
      </Popconfirm>
    </>
  );
}

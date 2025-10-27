import React, { useState } from "react";
import { Button, message, Modal, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { removeProduct } from "../../../../services/warehouseService";

export default function WarehouseRemove({ record, onReload, type = "primary" }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleRemove = async () => {
    if (!reason.trim()) {
      messageApi.warning("Vui lòng nhập lý do xuất kho!");
      return;
    }

    setLoading(true);
    const response = await removeProduct(record.productid, { reason: reason.trim() });

    if (response) {
      messageApi.success(`Xuất kho thành công sản phẩm "${record.productname}"!`);
      onReload();
      setIsModalVisible(false);
      setReason("");
    } else {
      onReload();
      messageApi.error("Xuất kho thất bại!");
    }

    setLoading(false);
  };

  return (
    <>
      {contextHolder}
      <>
      <Button
        type={type}
        danger
        icon={<ArrowLeftOutlined />}
        size="small"
        onClick={() => setIsModalVisible(true)}
      >
        Xuất kho
      </Button>

      <Modal
        title={`Xuất kho sản phẩm "${record.productname}"`}
        open={isModalVisible}
        onOk={handleRemove}
        onCancel={() => setIsModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Input.TextArea
          rows={3}
          placeholder="Nhập lý do xuất kho..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
      </>
    </>
  );
}

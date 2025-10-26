import React, { useState } from "react";
import { Button, message, Modal, Input } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { approveSellerRequest } from "../../../../services/sellerUpgradeService";

export default function RejectSeller({ record, onReload }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const handleReject = async () => {
    if (!reason.trim()) {
      messageApi.warning("Vui lòng nhập lý do từ chối!");
      return;
    }
      setLoading(true);
      const body = {
        approved: false,
        rejectionReason: reason.trim(),
      };

      const response = await approveSellerRequest(record.userId, body);
      if (response.status === "success") {
        await messageApi.success(`Đã từ chối yêu cầu của ${record.username}`);
        setIsModalVisible(false);
        setReason("");
        onReload();
      } else {
        await messageApi.error("Từ chối thất bại!");
      }
      setLoading(false);
  };

  return (
    <>
      {contextHolder}
      <Button
        size="small"
        danger
        icon={<CloseOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Từ chối
      </Button>

      <Modal
        title={`Từ chối yêu cầu của ${record.username}`}
        open={isModalVisible}
        onOk={handleReject}
        onCancel={() => setIsModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Input.TextArea
          rows={3}
          placeholder="Nhập lý do từ chối..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </>
  );
}

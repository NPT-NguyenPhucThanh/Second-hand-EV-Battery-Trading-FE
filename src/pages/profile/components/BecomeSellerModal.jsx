// src/pages/profile/components/BecomeSellerModal.jsx
import React, { useState } from "react";
import { Modal, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { postUpload } from "../../../utils/api";
import { useUser } from "../../../contexts/UserContext";

export default function BecomeSellerModal({ visible, onClose, onSuccess }) {
  const { updateUser } = useUser();
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    if (!front || !back) return message.warning("Chọn đủ 2 ảnh");

    const fd = new FormData();
    fd.append("cccdFront", front);
    fd.append("cccdBack", back);

    setLoading(true);
    try {
      await postUpload("api/client/request-seller-upgrade", fd);
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err.message || "Gửi thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={520} centered
      title={<h2 className="text-3xl font-bold text-center">Trở thành Người bán</h2>}>
      <div className="p-6 space-y-6">
        <Upload beforeUpload={f => (setFront(f), false)} fileList={front ? [front] : []}>
          <Button icon={<UploadOutlined />} block size="large" className="h-14">Mặt trước CCCD</Button>
        </Upload>
        <Upload beforeUpload={f => (setBack(f), false)} fileList={back ? [back] : []}>
          <Button icon={<UploadOutlined />} block size="large" className="h-14">Mặt sau CCCD</Button>
        </Upload>
        <Button 
          type="primary" 
          size="large" 
          block 
          loading={loading}
          onClick={handleOk}
          className="h-16 text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600"
        >
          {loading ? "Đang gửi..." : "GỬI YÊU CẦU"}
        </Button>
      </div>
    </Modal>
  );
}
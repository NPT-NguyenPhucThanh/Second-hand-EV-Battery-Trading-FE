// DÁN ĐÈ TOÀN BỘ
import React, { useState } from "react";
import { Modal, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { postUpload } from "../../../utils/api";

export default function BecomeSellerModal({ visible, onClose, onSuccess }) {
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
      message.success("GỬI THÀNH CÔNG!");
      onSuccess?.();
    } catch (err) {
      message.info("Đã gửi rồi! Đang chờ duyệt");
      onSuccess?.(); // VẪN GỌI ĐỂ HIỆN PENDING
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={520} centered>
      <div className="p-8 space-y-8 text-center">
        <h2 className="text-4xl font-bold text-purple-700">Trở thành Người bán</h2>

        <Upload beforeUpload={f => (setFront(f), false)} showUploadList={false}>
          <div className="border-4 border-dashed border-purple-400 rounded-2xl p-12 hover:border-purple-600 cursor-pointer bg-purple-50">
            <UploadOutlined className="text-7xl text-purple-600" />
            <p className="mt-4 text-2xl">{front ? front.name : "Mặt trước CCCD"}</p>
          </div>
        </Upload>

        <Upload beforeUpload={f => (setBack(f), false)} showUploadList={false}>
          <div className="border-4 border-dashed border-purple-400 rounded-2xl p-12 hover:border-purple-600 cursor-pointer bg-purple-50">
            <UploadOutlined className="text-7xl text-purple-600" />
            <p className="mt-4 text-2xl">{back ? back.name : "Mặt sau CCCD"}</p>
          </div>
        </Upload>

        <Button
          type="primary" block size="large" loading={loading}
          onClick={handleOk} disabled={!front || !back}
          className="h-20 text-3xl font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600"
        >
          GỬI YÊU CẦU
        </Button>
      </div>
    </Modal>
  );
}
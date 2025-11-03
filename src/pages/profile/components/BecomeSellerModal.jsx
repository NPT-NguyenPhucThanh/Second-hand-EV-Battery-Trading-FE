// src/pages/profile/components/BecomeSellerModal.jsx
import React, { useState } from "react";
import { Modal, Button, Upload, message } from "antd";
import { UploadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import api from "../../../utils/api";

export default function BecomeSellerModal({ visible, onClose }) {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    if (!front || !back) {
      message.warning("Vui lòng chọn đủ 2 mặt CCCD!");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("cccdFront", front);
    fd.append("cccdBack", back);

    try {
      await api.post("/api/client/request-seller-upgrade", fd);
      message.success({
        content: "Gửi yêu cầu thành công! Staff sẽ duyệt trong 24h",
        icon: <CheckCircleOutlined className="text-green-500" />,
        duration: 4,
      });
      onClose();
    } catch (err) {
      const errMsg = err.message || "Lỗi kết nối server";
      message.error(`Gửi thất bại: ${errMsg}`);
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFront(null);
    setBack(null);
  };

  return (
    <Modal
      open={visible}
      onCancel={() => {
        reset();
        onClose();
      }}
      footer={null}
      width={520}
      centered
      closeIcon={<i className="fa-solid fa-xmark text-xl"></i>}
      title={
        <div className="text-center pb-2">
          <CheckCircleOutlined className="text-5xl text-green-500 mb-3 block" />
          <h2 className="text-2xl font-bold text-gray-800">Trở thành Người bán</h2>
        </div>
      }
    >
      <div className="space-y-6">
        <p className="text-center text-gray-600 leading-relaxed">
          Chỉ <strong>30 giây</strong> để mở shop riêng!<br />
          Upload CCCD → Chờ duyệt → Bán ngay!
        </p>

        {/* Mặt trước */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 text-center">
            Mặt trước CCCD
          </p>
          <Upload
            beforeUpload={(file) => {
              setFront(file);
              return false;
            }}
            fileList={front ? [{ uid: "-1", name: front.name, status: "done" }] : []}
            onRemove={() => setFront(null)}
            accept="image/*"
            showUploadList={{ showRemoveIcon: true }}
          >
            <Button
              icon={<UploadOutlined />}
              block
              size="large"
              className="h-12 border-dashed border-2 border-blue-300 hover:border-blue-500"
            >
              {front ? "Đã chọn: " + front.name : "Chọn ảnh"}
            </Button>
          </Upload>
        </div>

        {/* Mặt sau */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 text-center">
            Mặt sau CCCD
          </p>
          <Upload
            beforeUpload={(file) => {
              setBack(file);
              return false;
            }}
            fileList={back ? [{ uid: "-2", name: back.name, status: "done" }] : []}
            onRemove={() => setBack(null)}
            accept="image/*"
            showUploadList={{ showRemoveIcon: true }}
          >
            <Button
              icon={<UploadOutlined />}
              block
              size="large"
              className="h-12 border-dashed border-2 border-purple-300 hover:border-purple-500"
            >
              {back ? "Đã chọn: " + back.name : "Chọn ảnh"}
            </Button>
          </Upload>
        </div>

        {/* Nút gửi */}
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={handleOk}
          disabled={!front || !back}
          className="h-14 text-xl font-bold rounded-xl shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-60"
        >
          {loading ? "Đang gửi yêu cầu..." : "Gửi ngay & chờ duyệt"}
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Không cần CCCD thật để test • Ảnh sẽ được mã hóa
          </p>
        </div>
      </div>
    </Modal>
  );
}
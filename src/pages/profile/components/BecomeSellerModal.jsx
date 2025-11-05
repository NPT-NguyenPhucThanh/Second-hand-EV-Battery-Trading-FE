// DÁN ĐÈ TOÀN BỘ
import React, { useState } from "react";
import { Modal, Button, Upload, message, Alert } from "antd";
import { UploadOutlined, IdcardOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { postUpload } from "../../../utils/api";

export default function BecomeSellerModal({ visible, onClose, onSuccess }) {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!front || !back) {
      message.warning("Vui lòng chọn đủ ảnh mặt trước và mặt sau CCCD/CMND");
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(front.type) || !allowedTypes.includes(back.type)) {
      message.error("Chỉ chấp nhận file ảnh định dạng JPG hoặc PNG");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (front.size > maxSize || back.size > maxSize) {
      message.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("cccdFront", front);
    formData.append("cccdBack", back);

    setLoading(true);
    try {
      const result = await postUpload("api/client/request-seller-upgrade", formData);
      console.log("[BecomeSellerModal] Upload result:", result);
      
      message.success("Gửi yêu cầu thành công!");
      
      // Give the backend a moment to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call onSuccess to reload profile
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err) {
      console.error("[BecomeSellerModal] Error:", err);
      if (err.message?.includes("already") || err.message?.includes("exists")) {
        message.info("Yêu cầu của bạn đã được gửi và đang chờ duyệt");
        if (onSuccess) await onSuccess();
        onClose();
      } else {
        message.error("Có lỗi xảy ra: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      open={visible}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      className="seller-upgrade-modal"
    >
      <div className="px-8 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <SafetyCertificateOutlined className="text-5xl text-purple-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Đăng ký trở thành Người bán
          </h2>
          <p className="text-gray-600">
            Để đảm bảo an toàn giao dịch, vui lòng cung cấp ảnh CCCD/CMND
          </p>
        </div>

        {/* Important Notice */}
        <Alert
          message="Lưu ý quan trọng"
          description={
            <ul className="list-disc pl-4">
              <li>Ảnh CCCD/CMND phải rõ nét, không bị mờ</li>
              <li>Chấp nhận file JPG, PNG, dung lượng tối đa 5MB</li>
              <li>Thông tin trên CCCD/CMND phải khớp với thông tin tài khoản</li>
              <li>Thời gian xét duyệt trong vòng 24h làm việc</li>
            </ul>
          }
          type="info"
          showIcon
          className="mb-8"
        />

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Front Side */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
              <IdcardOutlined className="mr-2" /> Mặt trước CCCD/CMND
            </h3>
            <Upload
              beforeUpload={(file) => {
                setFront(file);
                return false;
              }}
              showUploadList={false}
            >
              <div className={`
                border-2 border-dashed rounded-xl p-8
                transition-all duration-300 cursor-pointer
                flex flex-col items-center justify-center
                min-h-[200px]
                ${front 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}
              `}>
                <UploadOutlined className={`text-4xl ${front ? 'text-purple-600' : 'text-gray-400'}`} />
                <p className="mt-4 text-base text-gray-600">
                  {front ? front.name : "Nhấp để chọn ảnh"}
                </p>
              </div>
            </Upload>
          </div>

          {/* Back Side */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
              <IdcardOutlined className="mr-2" /> Mặt sau CCCD/CMND
            </h3>
            <Upload
              beforeUpload={(file) => {
                setBack(file);
                return false;
              }}
              showUploadList={false}
            >
              <div className={`
                border-2 border-dashed rounded-xl p-8
                transition-all duration-300 cursor-pointer
                flex flex-col items-center justify-center
                min-h-[200px]
                ${back 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}
              `}>
                <UploadOutlined className={`text-4xl ${back ? 'text-purple-600' : 'text-gray-400'}`} />
                <p className="mt-4 text-base text-gray-600">
                  {back ? back.name : "Nhấp để chọn ảnh"}
                </p>
              </div>
            </Upload>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            size="large"
            onClick={onClose}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleUpload}
            loading={loading}
            disabled={!front || !back}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
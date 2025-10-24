import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber } from "antd";

const PackageModal = ({
  open,
  onSave,
  onCancel,
  editingPackage,
  packageType,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingPackage) {
      form.setFieldsValue(editingPackage);
    } else {
      form.resetFields();
    }
  }, [editingPackage, form, open]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSave(editingPackage ? { ...editingPackage, ...values } : values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const title = `${editingPackage ? "Chỉnh sửa" : "Tạo"} ${
    packageType === "BATTERY" ? "gói pin" : "gói xe"
  }`;

  return (
    <Modal
      open={open}
      title={title}
      okText="Lưu"
      cancelText="Hủy"
      onCancel={onCancel}
      onOk={handleOk}
      forceRender
      destroyOnHidden
    >
      <Form form={form} layout="vertical" name="package_form">
        <Form.Item
          name="name"
          label="Tên gói"
          rules={[{ required: true, message: "Vui lòng nhập tên gói!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="durationMonths"
          label="Thời hạn (tháng)"
          rules={[{ required: true, message: "Vui lòng nhập thời hạn!" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        {packageType === "BATTERY" && (
          <Form.Item
            name="maxBatteries"
            label="Pin tối đa"
            rules={[
              { required: true, message: "Vui lòng nhập số pin tối đa!" },
            ]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        )}
        {packageType === "CAR" && (
          <Form.Item
            name="maxCars"
            label="Xe tối đa"
            rules={[{ required: true, message: "Vui lòng nhập số xe tối đa!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        )}
        <Form.Item
          name="price"
          label="Giá (VNĐ)"
          rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
        >
          <InputNumber
            min={1000}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PackageModal;

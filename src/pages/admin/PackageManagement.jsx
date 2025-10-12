import React, { useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb';
import { packageData, userPackageData } from "../../dataAdmin";


export default function PackageManagement() {
  const [packages, setPackages] = useState(packageData);
  const [userPackages] = useState(userPackageData);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [form] = Form.useForm();

  const showCreateModal = () => {
    setEditingPackage(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (pkg) => {
    setEditingPackage(pkg);
    form.setFieldsValue(pkg);
    setIsModalVisible(true);
  };

  const handleDelete = (packageid) => {
    Modal.confirm({
      title: "Xác nhận xóa gói?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setPackages((prev) => prev.filter((p) => p.packageid !== packageid));
        message.success("Đã xóa gói thành công!");
      },
    });
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingPackage) {
          // Cập nhật
          setPackages((prev) =>
            prev.map((p) =>
              p.packageid === editingPackage.packageid
                ? { ...editingPackage, ...values }
                : p
            )
          );
          message.success("Cập nhật gói thành công!");
        } else {
          // Tạo mới
          const newPackage = {
            ...values,
            packageid: Date.now(),
            created_at: new Date().toISOString().split("T")[0],
          };
          setPackages((prev) => [...prev, newPackage]);
          message.success("Tạo gói mới thành công!");
        }
        setIsModalVisible(false);
      })
      .catch(() => {});
  };

  const packageColumns = [
    { title: "Mã gói", dataIndex: "packageid", key: "packageid" },
    { title: "Tên gói", dataIndex: "name", key: "name" },
    { title: "Thời hạn (tháng)", dataIndex: "duration_months", key: "duration_months" },
    { title: "Pin tối đa", dataIndex: "max_batteries", key: "max_batteries" },
    { title: "Xe tối đa", dataIndex: "max_cars", key: "max_cars" },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      render: (price) => price.toLocaleString("vi-VN"),
    },
    { title: "Ngày tạo", dataIndex: "created_at", key: "created_at" },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.packageid)}
            danger
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const userPackageColumns = [
    { title: "Tên đăng nhập", dataIndex: "username", key: "username" },
    { title: "Mã UserPackage", dataIndex: "userpackageid", key: "userpackageid" },
    { title: "Tên gói", dataIndex: "name", key: "name" },
    { title: "Ngày mua", dataIndex: "purchase_date", key: "purchase_date" },
    { title: "Ngày hết hạn", dataIndex: "expiry_date", key: "expiry_date" },
    { title: "Pin còn lại", dataIndex: "remaining_batteries", key: "remaining_batteries" },
    { title: "Xe còn lại", dataIndex: "remaining_cars", key: "remaining_cars" },
  ];

  return (
    <>
    <AdminBreadcrumb />
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Danh sách gói dịch vụ",
            children: (
              <>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showCreateModal}
                  style={{ marginBottom: 16 }}
                >
                  Tạo gói mới
                </Button>
                <Table
                  columns={packageColumns}
                  dataSource={packages}
                  rowKey="packageid"
                  pagination={{ pageSize: 5 }}
                />
              </>
            ),
          },
          {
            key: "2",
            label: "Người dùng đang sử dụng gói",
            children: (
              <Table
                columns={userPackageColumns}
                dataSource={userPackages}
                rowKey="userpackageid"
                pagination={{ pageSize: 5 }}
              />
            ),
          },
        ]}
      />
      <Modal
        title={editingPackage ? "Chỉnh sửa gói" : "Tạo gói mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên gói"
            rules={[{ required: true, message: "Nhập tên gói!" }]}
          >
            <Input placeholder="Nhập tên gói..." />
          </Form.Item>
          <Form.Item
            name="duration_months"
            label="Thời hạn (tháng)"
            rules={[{ required: true, message: "Nhập thời hạn!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="max_batteries"
            label="Pin tối đa"
            rules={[{ required: true, message: "Nhập số pin tối đa!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="max_cars"
            label="Xe tối đa"
            rules={[{ required: true, message: "Nhập số xe tối đa!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[{ required: true, message: "Nhập giá gói!" }]}
          >
            <InputNumber min={1000} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

import React, { useState, useEffect } from "react";
import { List, Button, Modal, Form, Input, Skeleton, Empty, Popconfirm } from "antd";
import { Plus, MapPin, Trash2 } from "lucide-react";
import { getSavedAddresses, addSavedAddress, deleteSavedAddress } from "../../services/addressService"; // Import service mới
import { toast } from "sonner";

const AddressContent = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getSavedAddresses();
      setAddresses(data);
    } catch (error) {
      toast.error("Không thể tải danh sách địa chỉ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const showModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleAddAddress = async (values) => {
    try {
      const response = await addSavedAddress(values);
      if (response.status === "success") {
        toast.success("Đã thêm địa chỉ mới!");
        setIsModalOpen(false);
        fetchAddresses(); // Tải lại danh sách
      } else {
        throw new Error(response.message || "Lỗi khi thêm địa chỉ");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (addressId) => {
    try {
      const response = await deleteSavedAddress(addressId);
      if (response.status === "success") {
        toast.success("Đã xóa địa chỉ.");
        fetchAddresses(); // Tải lại danh sách
      } else {
        throw new Error(response.message || "Lỗi khi xóa");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Địa Chỉ Của Tôi</h2>
        <Button
          type="primary"
          icon={<Plus />}
          onClick={showModal}
          className="bg-blue-500"
        >
          Thêm Địa Chỉ Mới
        </Button>
      </div>

      <Skeleton loading={loading} active>
        {addresses.length === 0 ? (
          <Empty description="Bạn chưa có địa chỉ nào được lưu." />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={addresses}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Popconfirm
                    title="Bạn có chắc muốn xóa địa chỉ này?"
                    onConfirm={() => handleDelete(item.addressid)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button type="text" danger icon={<Trash2 size={16} />} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<MapPin className="w-6 h-6 text-blue-500 mt-1" />}
                  title={<span className="font-semibold">{item.street}</span>}
                  description={`${item.ward}, ${item.district}, ${item.province}`}
                />
              </List.Item>
            )}
          />
        )}
      </Skeleton>

      <Modal
        title="Thêm Địa Chỉ Mới"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleAddAddress}>
          <Form.Item
            name="street"
            label="Số nhà, Tên đường"
            rules={[{ required: true, message: "Vui lòng nhập tên đường!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ward"
            label="Phường / Xã"
            rules={[{ required: true, message: "Vui lòng nhập phường/xã!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="district"
            label="Quận / Huyện"
            rules={[{ required: true, message: "Vui lòng nhập quận/huyện!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="province"
            label="Tỉnh / Thành phố"
            rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành phố!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="country"
            label="Quốc gia"
            initialValue="Việt Nam"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddressContent;
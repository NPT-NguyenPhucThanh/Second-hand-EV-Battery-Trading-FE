// src/components/profile/DisputesContent.jsx
import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import api from "../../utils/api";
import {
  Tag,
  Button,
  Spin,
  Empty,
  Form,
  Input,
  Select,
  message,
  Modal,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { getOrderNumber } from "../../utils/orderUtils";
const { TextArea } = Input;
const { Option } = Select;

const currency = (value) => {
  if (value === null || value === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export default function DisputesContent() {
  const { user } = useUser();
  const [disputes, setDisputes] = useState([]);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [allOrders, setAllOrders] = useState([]);
  useEffect(() => {
    const fetchDisputes = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await api.get("api/buyer/disputes");
        if (res.status === "success" && Array.isArray(res.disputes)) {
          // API đã trả về kèm `order` → xử lý trực tiếp
          const processed = res.disputes.map((d) => {
            const order = d.order || {};
            const items = order.items || [];
            const productNames =
              items.length > 0
                ? items
                    .map((item) => item.productName || item.name || "Sản phẩm")
                    .join(", ")
                : "Không có sản phẩm";

            return {
              id: d.disputeid,
              orderId: order.orderid,
              productNames,
              total: order.totalfinal,
              reason: d.description?.split(".")[0] || "Không rõ lý do", // Lấy phần đầu làm lý do
              fullDescription: d.description,
              status: d.status,
              createdAt: d.createdAt,
              orderStatus: order.status,
            };
          });
          setDisputes(processed);
        } else {
          setDisputes([]);
          message.info(res.message || "Không có khiếu nại nào.");
        }
      } catch (err) {
        message.error("Lỗi kết nối khi tải khiếu nại");
      } finally {
        setLoading(false);
      }
    };

    const fetchAllOrders = async () => {
      try {
        const res = await api.get("api/buyer/orders");
        if (res.status === "success") {
          const all = (res.orders || []).sort(
            (a, b) => new Date(a.createdat) - new Date(b.createdat)
          );
          setAllOrders(all); // state mới
          const eligible = all.filter((o) =>
            ["DA_HOAN_TAT", "DA_DUYET"].includes(o.status)
          );
          setEligibleOrders(eligible);
        }
      } catch (err) {
        console.error("Không thể tải đơn hàng");
      }
    };

    fetchDisputes();
    fetchAllOrders();
  }, [user]);

  const handleSubmitDispute = async (values) => {
    setSubmitting(true);
    try {
      const res = await api.post("api/buyer/dispute", {
        orderId: values.orderId,
        reasonType: values.reason,
        description: values.description || "",
      });

      if (res.status === "success") {
        message.success(res.message || "Gửi khiếu nại thành công!");

        // Lấy thông tin đơn hàng vừa khiếu nại
        const order = eligibleOrders.find((o) => o.orderid === values.orderId);
        const productNames = order?.items?.[0]?.productName || "Sản phẩm";

        const newDispute = {
          id: res.dispute.disputeid,
          orderId: res.dispute.order.orderid,
          productNames,
          total: res.dispute.order.totalfinal,
          reason: values.reason,
          fullDescription: values.description,
          status: "OPEN",
          createdAt: new Date().toISOString(),
          orderStatus: "TRANH_CHAP",
        };

        setDisputes([newDispute, ...disputes]);
        setIsModalOpen(false);
        form.resetFields();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      message.error(err.message || "Gửi khiếu nại thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const showCreateModal = () => {
    if (eligibleOrders.length === 0) {
      message.warning("Bạn không có đơn hàng nào đủ điều kiện để khiếu nại.");
      return;
    }
    setIsModalOpen(true);
  };

  const statusMap = {
    OPEN: { text: "Mới mở", color: "processing" },
    PENDING: { text: "Đang xử lý", color: "processing" },
    RESOLVED: { text: "Đã giải quyết", color: "success" },
    REJECTED: { text: "Bị từ chối", color: "error" },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Khiếu Nại Của Tôi
        </h2>
        <Button type="primary" onClick={showCreateModal}>
          Tạo Khiếu Nại Mới
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <Spin size="large" />
        </div>
      ) : disputes.length === 0 ? (
        <Empty description="Bạn chưa có khiếu nại nào." />
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => {
  const orderNumber = getOrderNumber(allOrders, d.orderId);
  const status = statusMap[d.status] || { text: d.status, color: "default" };

  return (
    <div key={d.id} className="border rounded-lg p-5 hover:shadow transition">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <p className="font-bold text-lg">
            Khiếu nại #{orderNumber || d.id}
            {orderNumber && <span className="text-gray-500 ml-2"></span>}
          </p>
          <p className="text-sm text-gray-600">
            Đơn giá: <span className="font-medium"></span>
            {"  "}
            <span className="text-blue-600">{currency(d.total)}</span>
                    </p>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      Lý do: <span className="font-medium">{d.reason}</span>
                    </p>
                    {d.fullDescription && (
                      <p className="text-sm text-gray-700 mt-2 italic">
                        
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Tag color={status.color}>{status.text}</Tag>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(d.createdAt).toLocaleString("vi-VN")}
                    </p>
                    {d.orderStatus && (
                      <Tag color="warning" className="mt-1 block">
                        Đơn hàng:{" "}
                        {d.orderStatus === "TRANH_CHAP"
                          ? "Tranh chấp"
                          : d.orderStatus}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal tạo khiếu nại */}
      <Modal
        title="Tạo Khiếu Nại Mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitDispute}>
          <Form.Item
            name="orderId"
            label="Chọn đơn hàng"
            rules={[{ required: true, message: "Vui lòng chọn đơn hàng" }]}
          >
            <Select placeholder="Chọn đơn hàng cần khiếu nại">
              {eligibleOrders.map((order) => (
                <Option key={order.orderid} value={order.orderid}>
                  #{order.orderid} -{" "}
                  {order.items?.[0]?.productName || "Sản phẩm"} -{" "}
                  {currency(order.totalfinal)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do khiếu nại"
            rules={[{ required: true, message: "Vui lòng chọn lý do" }]}
          >
            <Select placeholder="Chọn lý do">
              <Option value="Hàng lỗi/hỏng">Hàng lỗi/hỏng</Option>
              <Option value="Không giao hàng">Không giao hàng</Option>
              <Option value="Sai sản phẩm">Sai sản phẩm</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả chi tiết (tùy chọn)">
            <TextArea rows={3} placeholder="Mô tả rõ vấn đề..." />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button
              onClick={() => setIsModalOpen(false)}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Gửi Khiếu Nại
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
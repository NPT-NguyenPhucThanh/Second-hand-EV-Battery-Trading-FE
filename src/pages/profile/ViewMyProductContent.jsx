// src/components/profile/ViewMyProductContent.jsx
import React, { useState, useEffect } from "react";
import { Spin, Empty, Tabs, Tag, Button, Table, Tooltip, Select } from "antd";
import { get } from "../../utils/api";

const { TabPane } = Tabs;
const { Option } = Select;

// Định dạng tiền tệ
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

// Định dạng ngày giờ
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Ẩn email
const maskEmail = (email) => {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return local.length > 3 ? `${local.slice(0, 3)}...@${domain}` : email;
};

// Tag trạng thái
const OrderStatusTag = ({ status }) => {
  const statusMap = {
    CHO_DUYET: { text: "Chờ duyệt", color: "processing" },
    DA_DUYET: { text: "Đã duyệt", color: "cyan" },
    DA_THANH_TOAN: { text: "Đã thanh toán", color: "success" },
    DA_HOAN_TAT: { text: "Hoàn tất", color: "success" },
    BI_TU_CHOI: { text: "Bị từ chối", color: "error" },
    TRANH_CHAP: { text: "Tranh chấp", color: "warning" },
  };

  const item = statusMap[status] || { text: status, color: "default" };
  return <Tag color={item.color}>{item.text}</Tag>;
};

export default function ViewMyProductContent() {
  const [carOrders, setCarOrders] = useState([]);
  const [batteryOrders, setBatteryOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc trạng thái
  const [carFilter, setCarFilter] = useState("ALL");
  const [batteryFilter, setBatteryFilter] = useState("ALL");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const [carRes, batteryRes] = await Promise.all([
          get("api/seller/orders/cars"),
          get("api/seller/orders/batteries"),
        ]);

        const EXCLUDED_STATUSES = ["CHO_THANH_TOAN", "DA_HUY", "THAT_BAI"];

        const processOrders = (res) => {
          if (res.status === "success" && Array.isArray(res.orders)) {
            return res.orders
              .filter(order => !EXCLUDED_STATUSES.includes(order.status))
              .map(order => ({
                key: order.orderid,
                orderid: order.orderid,
                totalfinal: order.totalfinal,
                shippingaddress: order.shippingaddress,
                paymentmethod: order.paymentmethod,
                createdat: order.createdat,
                status: order.status,
                buyer: {
                  name: order.users?.username || "Khách vãng lai",
                  phone: order.users?.phone || "—",
                  email: order.users?.email || "—",
                },
              }))
              // SẮP XẾP: MỚI NHẤT LÊN ĐẦU
              .sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
          }
          return [];
        };

        setCarOrders(processOrders(carRes));
        setBatteryOrders(processOrders(batteryRes));
      } catch (err) {
        console.error("Lỗi kết nối API:", err);
        setCarOrders([]);
        setBatteryOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Lọc theo trạng thái
  const filterOrders = (orders, filter) => {
    if (filter === "ALL") return orders;
    return orders.filter(order => order.status === filter);
  };

  const filteredCarOrders = filterOrders(carOrders, carFilter);
  const filteredBatteryOrders = filterOrders(batteryOrders, batteryFilter);

  // Danh sách trạng thái cho bộ lọc
  const statusOptions = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "CHO_DUYET", label: "Chờ duyệt" },
    { value: "DA_DUYET", label: "Đã duyệt" },
    { value: "DA_THANH_TOAN", label: "Đã thanh toán" },
    { value: "DA_HOAN_TAT", label: "Hoàn tất" },
    { value: "BI_TU_CHOI", label: "Bị từ chối" },
    { value: "TRANH_CHAP", label: "Tranh chấp" },
  ];

  // Cột bảng – ĐÁNH SỐ THỨ TỰ: #1 = MỚI NHẤT
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) => {
        return <span className="font-semibold text-blue-600">#{1 + index}</span>;
      },
    },
    {
      title: "Người mua",
      key: "buyer",
      render: (_, record) => {
        const b = record.buyer;
        return (
          <div className="text-sm leading-tight">
            <p className="font-semibold text-gray-800">{b.name}</p>
            <p className="text-gray-600">
              <i className="fa-solid fa-phone text-xs mr-1"></i>
              {b.phone}
            </p>
            <Tooltip title={b.email}>
              <p className="text-gray-500 text-xs">{maskEmail(b.email)}</p>
            </Tooltip>
          </div>
        );
      },
      width: 180,
    },
    {
      title: "Địa chỉ giao",
      dataIndex: "shippingaddress",
      key: "address",
      render: (addr) => (
        <p className="text-xs text-gray-600 line-clamp-2" title={addr}>
          <i className="fa-solid fa-map-marker-alt mr-1"></i>
          {addr || "—"}
        </p>
      ),
      width: 180,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalfinal",
      key: "total",
      render: (value) => (
        <span className="font-semibold text-green-600">{formatCurrency(value)}</span>
      ),
      width: 130,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <OrderStatusTag status={status} />,
      width: 120,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdat",
      key: "date",
      render: (date) => <span className="text-xs">{formatDate(date)}</span>,
      width: 140,
    },
    {
      title: "Hành động",
      key: "action",
      render: () => (
        <Button type="link" size="small" className="text-blue-600">
          Xem chi tiết
        </Button>
      ),
      width: 100,
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <p className="mt-3 text-gray-500">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Đơn Hàng Của Tôi
      </h2>

      <Tabs defaultActiveKey="cars" type="card">
        {/* Tab Xe */}
        <TabPane
          tab={
            <span>
              <i className="fa-solid fa-car mr-2"></i>
              Xe ({filteredCarOrders.length})
            </span>
          }
          key="cars"
        >
          <div className="mb-4 flex justify-end">
            <Select
              value={carFilter}
              onChange={setCarFilter}
              style={{ width: 220 }}
              placeholder="Lọc theo trạng thái"
            >
              {statusOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </div>

          {filteredCarOrders.length > 0 ? (
            <Table
              dataSource={filteredCarOrders}
              columns={columns}
              rowKey="key"
              pagination={{ pageSize: 6 }}
              scroll={{ x: 1000 }}
              bordered
              size="middle"
            />
          ) : (
            <Empty description="Không có đơn hàng phù hợp." className="py-10" />
          )}
        </TabPane>

        {/* Tab Pin */}
        <TabPane
          tab={
            <span>
              <i className="fa-solid fa-battery-full mr-2"></i>
              Pin ({filteredBatteryOrders.length})
            </span>
          }
          key="batteries"
        >
          <div className="mb-4 flex justify-end">
            <Select
              value={batteryFilter}
              onChange={setBatteryFilter}
              style={{ width: 220 }}
              placeholder="Lọc theo trạng thái"
            >
              {statusOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </div>

          {filteredBatteryOrders.length > 0 ? (
            <Table
              dataSource={filteredBatteryOrders}
              columns={columns}
              rowKey="key"
              pagination={{ pageSize: 6 }}
              scroll={{ x: 1000 }}
              bordered
              size="middle"
            />
          ) : (
            <Empty description="Không có đơn hàng phù hợp." className="py-10" />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}
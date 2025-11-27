import React, { useState, useEffect } from "react";
import { Spin, Empty, Tabs, Tag, Table, Tooltip, Select } from "antd";
import { get } from "../../utils/api";
import { useTheme } from "../../contexts/ThemeContext";

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

// Tag trạng thái đẹp
const OrderStatusTag = ({ status }) => {
  const statusMap = {
    CHO_THANH_TOAN: { text: "Chờ thanh toán", color: "orange" },
    CHO_DAT_COC: { text: "Chờ đặt cọc 10%", color: "gold" },
    CHO_XAC_NHAN: { text: "Chờ xác nhận", color: "processing" },
    DA_DAT_COC: { text: "Đã đặt cọc 10%", color: "lime" },
    CHO_DUYET: { text: "Chờ manager duyệt", color: "blue" },
    DA_DUYET: { text: "Đã duyệt - Chờ thanh toán cuối", color: "cyan" },
    DA_THANH_TOAN: { text: "Đã thanh toán đầy đủ", color: "success" },
    DANG_VAN_CHUYEN: { text: "Đang vận chuyển", color: "purple" },
    DA_GIAO: { text: "Đã giao - Chờ xác nhận", color: "magenta" },
    DA_HOAN_TAT: { text: "Hoàn tất", color: "green" },
    BI_TU_CHOI: { text: "Bị từ chối", color: "error" },
    TRANH_CHAP: { text: "Tranh chấp", color: "warning" },
    DISPUTE_RESOLVED: { text: "Đã giải quyết tranh chấp", color: "geekblue" },
    RESOLVED_WITH_REFUND: { text: "Giải quyết - Có hoàn tiền", color: "volcano" },
    DA_HUY: { text: "Đã hủy", color: "default" },
    THAT_BAI: { text: "Thanh toán thất bại", color: "red" },
  };

  const config = statusMap[status] || { text: status || "Không xác định", color: "default" };

  return (
    <Tag color={config.color} className="font-medium text-xs px-3 py-1 rounded-full">
      {config.text}
    </Tag>
  );
};

export default function ViewMyProductContent() {
  const [carOrders, setCarOrders] = useState([]);
  const [batteryOrders, setBatteryOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

        const processOrders = (res) => {
          if (res.status === "success" && Array.isArray(res.orders)) {
            return res.orders
              .map((order) => {
                const productName =
                  order.details?.[0]?.products?.productname || "Sản phẩm không xác định";

                return {
                  key: order.orderid,
                  orderid: order.orderid,
                  productName,
                  totalfinal: order.totalfinal,
                  shippingaddress: order.shippingaddress,
                  paymentmethod: order.paymentmethod,
                  createdat: order.createdat,
                  status: order.status,
                  buyer: {
                    name: order.users?.displayname || order.users?.username || "Khách vãng lai",
                    phone: order.users?.phone || "—",
                    email: order.users?.email || "—",
                  },
                };
              })
              .sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
          }
          return [];
        };

        setCarOrders(processOrders(carRes));
        setBatteryOrders(processOrders(batteryRes));
      } catch (err) {
        console.error("Lỗi tải đơn hàng:", err);
        setCarOrders([]);
        setBatteryOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filterOrders = (orders, filter) => {
    if (filter === "ALL") return orders;
    return orders.filter((order) => order.status === filter);
  };

  const filteredCarOrders = filterOrders(carOrders, carFilter);
  const filteredBatteryOrders = filterOrders(batteryOrders, batteryFilter);

  const statusOptions = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "CHO_THANH_THANH_TOAN", label: "Chờ thanh toán" },
    { value: "CHO_DAT_COC", label: "Chờ đặt cọc 10%" },
    { value: "CHO_XAC_NHAN", label: "Chờ xác nhận" },
    { value: "DA_DAT_COC", label: "Đã đặt cọc 10%" },
    { value: "CHO_DUYET", label: "Chờ manager duyệt" },
    { value: "DA_DUYET", label: "Đã duyệt - Chờ thanh toán cuối" },
    { value: "DA_THANH_TOAN", label: "Đã thanh toán đầy đủ" },
    { value: "DANG_VAN_CHUYEN", label: "Đang vận chuyển" },
    { value: "DA_GIAO", label: "Đã giao - Chờ xác nhận" },
    { value: "DA_HOAN_TAT", label: "Hoàn tất" },
    { value: "BI_TU_CHOI", label: "Bị từ chối" },
    { value: "TRANH_CHAP", label: "Tranh chấp" },
    { value: "DISPUTE_RESOLVED", label: "Đã giải quyết tranh chấp" },
    { value: "RESOLVED_WITH_REFUND", label: "Giải quyết - Có hoàn tiền" },
    { value: "DA_HUY", label: "Đã hủy" },
    { value: "THAT_BAI", label: "Thanh toán thất bại" },
  ];

  // Columns động
  const getColumns = (addressTitle) => [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">#{index + 1}</span>
      ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      width: 260,
      render: (_, record) => (
        <div className="font-medium text-gray-900 dark:text-white line-clamp-2">
          {record.productName}
        </div>
      ),
    },
    {
      title: "Người mua",
      key: "buyer",
      width: 180,
      render: (_, record) => {
        const b = record.buyer;
        return (
          <div className="text-sm">
            <p className="font-semibold text-gray-900 dark:text-white">{b.name}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Phone: {b.phone}</p>
            <Tooltip title={b.email}>
              <p className="text-gray-500 text-xs truncate w-36">{maskEmail(b.email)}</p>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: <span className="font-semibold">{addressTitle}</span>,
      dataIndex: "shippingaddress",
      key: "address",
      width: 240,
      render: (addr) => (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2" title={addr}>
          {addr || "—"}
        </p>
      ),
    },
    {
      title: "Tổng tiền", // ĐÃ SỬA LỖI Ở ĐÂY
      dataIndex: "totalfinal",
      key: "total",
      width: 150,
      render: (value) => (
        <span className="font-bold text-green-600 dark:text-green-400">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status) => <OrderStatusTag status={status} />,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdat",
      key: "date",
      width: 150,
      render: (date) => <span className="text-xs text-gray-500">{formatDate(date)}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spin size="large" />
        <p className="mt-4 text-gray-500">Đang tải đơn hàng của bạn...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Đơn Hàng Của Tôi
      </h2>

      <Tabs defaultActiveKey="cars" type="card" size="large">
        {/* TAB XE */}
        <TabPane
          tab={<span className="flex items-center gap-2">Xe điện ({filteredCarOrders.length})</span>}
          key="cars"
        >
          <div className="mb-6 flex justify-end">
            <Select
              value={carFilter}
              onChange={setCarFilter}
              style={{ width: 300 }}
              placeholder="Lọc theo trạng thái"
              size="large"
            >
              {statusOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </div>

          {filteredCarOrders.length > 0 ? (
            <Table
              dataSource={filteredCarOrders}
              columns={getColumns("Địa chỉ giao dịch")}
              rowKey="key"
              pagination={{ pageSize: 8 }}
              scroll={{ x: 1400 }}
              bordered
              size="middle"
              className="shadow-lg rounded-lg overflow-hidden"
            />
          ) : (
            <Empty description="Chưa có đơn hàng xe điện nào" className="py-20" />
          )}
        </TabPane>

        {/* TAB PIN */}
        <TabPane
          tab={<span className="flex items-center gap-2">Pin ({filteredBatteryOrders.length})</span>}
          key="batteries"
        >
          <div className="mb-6 flex justify-end">
            <Select
              value={batteryFilter}
              onChange={setBatteryFilter}
              style={{ width: 300 }}
              placeholder="Lọc theo trạng thái"
              size="large"
            >
              {statusOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </div>

          {filteredBatteryOrders.length > 0 ? (
            <Table
              dataSource={filteredBatteryOrders}
              columns={getColumns("Địa chỉ giao hàng")}
              rowKey="key"
              pagination={{ pageSize: 8 }}
              scroll={{ x: 1400 }}
              bordered
              size="middle"
              className="shadow-lg rounded-lg overflow-hidden"
            />
          ) : (
            <Empty description="Chưa có đơn hàng pin nào" className="py-20" />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}
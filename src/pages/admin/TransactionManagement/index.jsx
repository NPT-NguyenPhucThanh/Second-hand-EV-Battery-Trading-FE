import React, { useState, useEffect, useCallback } from "react";
import {
  getOrders,
  approveOrder,
  getOrdersByStatus,
} from "../../../services/orderService";
import { useTheme } from "../../../contexts/ThemeContext";
import { toast } from "sonner";
import AuroraText from "../../../components/common/AuroraText";
import {
  ShoppingCart,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Loader2,
  Filter,
  Package,
  Car,
  Battery,
} from "lucide-react";

const ORDER_STATUS = {
  CHO_DUYET: "CHO_DUYET",
  CHO_THANH_TOAN: "CHO_THANH_TOAN",
  DA_DAT_COC: "DA_DAT_COC",
  DA_THANH_TOAN: "DA_THANH_TOAN",
  DA_HOAN_TAT: "DA_HOAN_TAT",
  BI_TU_CHOI: "BI_TU_CHOI",
  TRANH_CHAP: "TRANH_CHAP",
  DA_GIAO: "DA_GIAO",
  DA_HUY: "DA_HUY",
};

const filterOptions = [
  { value: "ALL", label: "Tất cả đơn hàng" },
  { value: ORDER_STATUS.CHO_DUYET, label: "Chờ duyệt" },
  { value: ORDER_STATUS.DA_DAT_COC, label: "Đã đặt cọc" },
  { value: ORDER_STATUS.DA_THANH_TOAN, label: "Đã thanh toán" },
  { value: ORDER_STATUS.TRANH_CHAP, label: "Đang tranh chấp" },
  { value: ORDER_STATUS.DA_HOAN_TAT, label: "Đã hoàn tất" },
  { value: ORDER_STATUS.BI_TU_CHOI, label: "Bị từ chối" },
  { value: ORDER_STATUS.DA_HUY, label: "Đã hủy" },
];

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${mi} ${day}/${m}/${y}`;
};

const getOrderProduct = (order) => order.details?.[0]?.products || null;

const getOrderImage = (order) => {
  const product = getOrderProduct(order);
  const imgs = product?.imgs || [];
  return imgs.length > 0 ? imgs[0].url : null;
};

export default function TransactionManagement() {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = useCallback(async (filterKey) => {
    setLoading(true);
    try {
      const response =
        filterKey === "ALL"
          ? await getOrders()
          : await getOrdersByStatus(filterKey);

      if (response?.status === "success") {
        const sorted = response.orders.sort(
          (a, b) => new Date(b.createdat) - new Date(a.createdat)
        );
        setOrders(sorted);
      } else {
        toast.error("Không thể tải danh sách giao dịch!");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter, fetchOrders]);


  const getStatusBadge = (status) => {
    const map = {
      CHO_DUYET: { color: "bg-orange-500/20 text-orange-400", label: "Chờ duyệt", icon: Clock },
      DA_DAT_COC: { color: "bg-blue-500/20 text-blue-400", label: "Đã đặt cọc", icon: DollarSign },
      DA_THANH_TOAN: { color: "bg-cyan-500/20 text-cyan-400", label: "Đã thanh toán", icon: CheckCircle },
      DA_HOAN_TAT: { color: "bg-green-500/20 text-green-400", label: "Đã hoàn tất", icon: CheckCircle },
      BI_TU_CHOI: { color: "bg-red-500/20 text-red-400", label: "Bị từ chối", icon: XCircle },
      TRANH_CHAP: { color: "bg-red-500/20 text-red-400", label: "Tranh chấp", icon: AlertTriangle },
      DA_HUY: { color: "bg-gray-500/20 text-gray-400", label: "Đã hủy", icon: XCircle },
    };
    return map[status] || { color: "bg-gray-500/20 text-gray-400", label: status, icon: FileText };
  };

  const openDetail = (o) => {
    setSelectedOrder(o);
    setModalVisible(true);
  };

  const closeDetail = () => {
    setSelectedOrder(null);
    setModalVisible(false);
  };


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>

      {/* PAGE TITLE */}
      <div className="mb-8">
        <AuroraText className="text-4xl font-bold mb-2">Quản Lý Giao Dịch</AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>Duyệt và theo dõi đơn hàng</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Filter className={isDark ? "text-gray-400" : "text-gray-500"} />
          <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Lọc theo trạng thái:
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === opt.value
                  ? isDark
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-blue-500 text-white"
                  : isDark
                  ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

        {orders.map((order) => {
          const prod = getOrderProduct(order);
          const image = getOrderImage(order);
          const status = getStatusBadge(order.status);
          const Title = prod ? prod.productname : `Gói dịch vụ #${order.packageId}`;

          return (
            <div
              key={order.orderid}
              className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${
                isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
              }`}
            >
              {/* IMAGE + STATUS */}
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center bg-gray-200">
                  {image ? (
                    <img src={image} className="w-full h-full object-cover" />
                  ) : prod ? (
                    prod.type === "Battery" ? (
                      <Battery className="w-10 h-10 text-gray-500" />
                    ) : (
                      <Car className="w-10 h-10 text-gray-500" />
                    )
                  ) : (
                    <Package className="w-10 h-10 text-gray-500" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                    #{order.orderid}
                  </span>
                  <div className={`mt-1 px-3 py-1 rounded-lg flex items-center gap-2 ${status.color}`}>
                    <status.icon className="w-4 h-4" />
                    <span className="text-xs">{status.label}</span>
                  </div>
                </div>
              </div>

              {/* PRODUCT TITLE */}
              <h3 className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                {Title}
              </h3>

              {/* BUYER */}
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>{order.users?.username}</span>
              </div>

              {/* PRICE */}
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-xl font-bold text-green-500">
                  {order.totalfinal.toLocaleString("vi-VN")} đ
                </span>
              </div>

              {/* DATE */}
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-gray-500" />
                {formatDateTime(order.createdat)}
              </div>

              <button
                onClick={() => openDetail(order)}
                className={`w-full py-2 rounded-lg font-medium transition-all ${
                  isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500 text-white"
                }`}
              >
                Xem chi tiết
              </button>
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-500">Không có đơn hàng nào</p>
        </div>
      )}

      {modalVisible && selectedOrder && (() => {
        const o = selectedOrder;
        const product = getOrderProduct(o);
        const battery = product?.brandbattery;
        const car = product?.brandcars;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
            onClick={closeDetail}
          >
            <div
              className={`rounded-2xl p-6 max-w-2xl w-full ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >

              <div className="flex gap-4 mb-6">
                <div className="w-28 h-28 rounded-lg overflow-hidden flex items-center justify-center bg-gray-200">
                  {getOrderImage(o) ? (
                    <img src={getOrderImage(o)} className="w-full h-full object-cover" />
                  ) : battery ? (
                    <Battery className="w-14 h-14 text-gray-500" />
                  ) : car ? (
                    <Car className="w-14 h-14 text-gray-500" />
                  ) : (
                    <Package className="w-14 h-14 text-gray-500" />
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-bold">
                    #{o.orderid} – {getStatusBadge(o.status).label}
                  </h3>
                  <p className="mt-2 text-lg font-semibold">
                    {product ? product.productname : `Gói dịch vụ #${o.packageId}`}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-400/20 pt-4 pb-4">
                <p><strong>Người mua:</strong> {o.users.displayname} ({o.users.username})</p>
                <p>Email: {o.users.email}</p>
                <p>Phone: {o.users.phone || ""}</p>
              </div>

              <div className="border-t border-gray-400/20 pt-4 pb-4">
                <p><strong>Tổng tiền:</strong> {o.totalfinal.toLocaleString("vi-VN")} đ</p>
                <p><strong>Thanh toán:</strong> {o.paymentmethod}</p>
                <p><strong>Ngày tạo:</strong> {formatDateTime(o.createdat)}</p>
                <p><strong>Địa chỉ giao hàng:</strong> {o.shippingaddress || ""}</p>
              </div>

              {product && (
                <div className="border-t border-gray-400/20 pt-4 pb-4">

                  {/* PIN EV */}
                  {battery && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Battery className="w-5 h-5 text-blue-400" />
                        <span className="text-lg font-semibold">Thông tin pin EV</span>
                      </div>

                      <p>- Model: {product.model}</p>
                      <p>- Dung lượng: {battery.capacity} kWh</p>
                      <p>- Điện áp: {battery.voltage} V</p>
                    </>
                  )}

                  {/* XE EV */}
                  {car && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="w-5 h-5 text-blue-400" />
                        <span className="text-lg font-semibold">Thông tin xe điện</span>
                      </div>

                      <p>- Hãng: {car.brand}</p>
                      <p>- Năm sản xuất: {car.year}</p>
                      <p>- Biển số: {car.licensePlate}</p>
                      <p>- Model: {product.model}</p>
                    </>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeDetail}
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
                >
                  Đóng
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}

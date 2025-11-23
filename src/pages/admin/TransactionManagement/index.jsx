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
  DA_DUYET: "DA_DUYET",
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
  if (!dateString) return "";
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

const getOrderImages = (order) => {
  const product = getOrderProduct(order);
  return product?.imgs || [];
};

export default function TransactionManagement() {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // State cho fullscreen gallery
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [dragStartX, setDragStartX] = useState(null);

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

  const handleApproveOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn DUYỆT đơn hàng này không?")) {
      return;
    }

    try {
      const payload = { approved: true };
      const response = await approveOrder(orderId, payload);

      if (response) {
        toast.success("Duyệt đơn hàng thành công!");
        fetchOrders(statusFilter);
      } else {
        toast.error(response.message || "Lỗi khi duyệt đơn hàng.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi hệ thống hoặc API.");
    }
  };

  const calculateDeposit = (order) => {
    if (!order?.totalfinal) return 0;
    return Math.round(order.totalfinal * 0.1);
  };

  const getStatusBadge = (status) => {
    const map = {
      CHO_DUYET: {
        color: "bg-orange-50 text-orange-600 border border-orange-200",
        label: "Chờ duyệt",
        icon: Clock,
      },
      DA_DAT_COC: {
        color: "bg-blue-50 text-blue-600 border border-blue-200",
        label: "Đã đặt cọc (10%)",
        icon: DollarSign,
      },
      DA_THANH_TOAN: {
        color: "bg-cyan-50 text-cyan-600 border border-cyan-200",
        label: "Đã thanh toán",
        icon: CheckCircle,
      },
      DA_HOAN_TAT: {
        color: "bg-green-50 text-green-600 border border-green-200",
        label: "Đã hoàn tất",
        icon: CheckCircle,
      },
      BI_TU_CHOI: {
        color: "bg-red-50 text-red-600 border border-red-200",
        label: "Bị từ chối",
        icon: XCircle,
      },
      TRANH_CHAP: {
        color: "bg-red-50 text-red-600 border border-red-200",
        label: "Tranh chấp",
        icon: AlertTriangle,
      },
      DA_HUY: {
        color: "bg-gray-50 text-gray-600 border border-gray-200",
        label: "Đã hủy",
        icon: XCircle,
      },
    };
    return (
      map[status] || {
        color: "bg-gray-50 text-gray-600 border border-gray-200",
        label: status,
        icon: FileText,
      }
    );
  };

  const openDetail = (o) => {
    setSelectedOrder(o);
    setModalVisible(true);
  };

  const closeDetail = () => {
    setSelectedOrder(null);
    setModalVisible(false);
  };

  // ==== FULLSCREEN GALLERY ====

  const openGallery = (imgs, startIndex = 0) => {
    if (!imgs || imgs.length === 0) return;
    setGalleryImages(imgs);
    setCurrentImageIndex(startIndex);
    setIsZoomed(false);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setIsZoomed(false);
    setGalleryImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (!galleryImages.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    if (!galleryImages.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  // Đóng bằng phím ESC
  useEffect(() => {
    if (!isGalleryOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeGallery();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryOpen, galleryImages.length]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}
    >
      <div className="mb-8 flex flex-col gap-2">
        <AuroraText className="text-4xl font-bold mb-1">
          Quản Lý Giao Dịch
        </AuroraText>
        <p className={isDark ? "text-slate-400" : "text-slate-600"}>
          Duyệt và theo dõi các đơn mua xe / pin của khách hàng
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Filter className={isDark ? "text-slate-400" : "text-slate-500"} />
          <span
            className={`font-medium ${
              isDark ? "text-slate-300" : "text-slate-800"
            }`}
          >
            Lọc theo trạng thái
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => {
            const isActive = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  isActive
                    ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                    : isDark
                    ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {orders.map((order) => {
          const prod = getOrderProduct(order);
          const image = getOrderImage(order);
          const status = getStatusBadge(order.status);
          const Title = prod
            ? prod.productname
            : `Gói dịch vụ #${order.packageId}`;
          const deposit =
            order.status === ORDER_STATUS.DA_DAT_COC ||
            order.status === ORDER_STATUS.DA_DUYET
              ? calculateDeposit(order)
              : 0;

          return (
            <div
              key={order.orderid}
              className={`flex flex-col h-full rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${
                isDark
                  ? "bg-slate-900/70 border-slate-700"
                  : "bg-white border-slate-100"
              }`}
            >
              <div className="flex items-start justify-between px-5 pt-4">
                <div>
                  <p className="text-xs text-slate-400">Mã đơn</p>
                  <p
                    className={`text-base font-semibold ${
                      isDark ? "text-slate-50" : "text-slate-900"
                    }`}
                  >
                    #{order.orderid}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(order.createdat)}
                  </p>
                </div>

                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                >
                  <status.icon className="w-3.5 h-3.5" />
                  <span>{status.label}</span>
                </div>
              </div>

              <div className="px-5 py-4 flex gap-3 border-t border-dashed border-slate-200/70">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center bg-slate-100">
                  {image ? (
                    <img
                      src={image}
                      className="w-full h-full object-cover"
                      alt={Title}
                    />
                  ) : prod ? (
                    prod.type === "Battery" ? (
                      <Battery className="w-9 h-9 text-slate-500" />
                    ) : (
                      <Car className="w-9 h-9 text-slate-500" />
                    )
                  ) : (
                    <Package className="w-9 h-9 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold line-clamp-2 ${
                      isDark ? "text-slate-50" : "text-slate-900"
                    }`}
                  >
                    {Title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Loại: {prod?.type || "Gói dịch vụ"}
                  </p>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Tổng thanh toán
                      </span>
                      <span className="text-base font-bold text-red-500">
                        {order.totalfinal.toLocaleString("vi-VN")} đ
                      </span>
                    </div>

                    {deposit > 0 && (
                      <div className="flex items-center justify-between text-xs text-blue-600">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Đã đặt cọc (10%)
                        </span>
                        <span className="font-semibold">
                          {deposit.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-4 border-t border-slate-100">
                <div className="flex justify-between gap-3 text-xs text-slate-600">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Người mua:</span>
                      <span className="font-medium">
                        {order.users?.username}
                      </span>
                    </div>
                    <p className="line-clamp-1">
                      Địa điểm:{" "}
                      {order.transactionLocation || order.shippingaddress || ""}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {order.status === ORDER_STATUS.DA_DAT_COC && (
                    <button
                      onClick={() => handleApproveOrder(order.orderid)}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold border border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all"
                    >
                      ✔ Duyệt đơn hàng
                    </button>
                  )}
                  <button
                    onClick={() => openDetail(order)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg text-slate-500">Không có đơn hàng nào</p>
        </div>
      )}

      {modalVisible &&
        selectedOrder &&
        (() => {
          const o = selectedOrder;
          const product = getOrderProduct(o);
          const battery = product?.brandbattery;
          const car = product?.brandcars;
          const status = getStatusBadge(o.status);
          const deposit =
            o.status === ORDER_STATUS.DA_DAT_COC ||
            o.status === ORDER_STATUS.DA_DUYET
              ? calculateDeposit(o)
              : 0;
          const seller = product?.users;
          const productImages = product?.imgs || [];

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={closeDetail}
            >
              <div
                className={`rounded-2xl w-full max-w-3xl shadow-xl ${
                  isDark ? "bg-slate-900 text-slate-50" : "bg-white"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 pt-5 pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Mã đơn</p>
                    <h3 className="text-xl font-bold">#{o.orderid}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      Tạo lúc {formatDateTime(o.createdat)}
                    </p>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                  >
                    <status.icon className="w-3.5 h-3.5" />
                    <span>{status.label}</span>
                  </div>
                </div>

                <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 flex flex-col gap-3">
                      <div className="flex gap-4">
                        <div className="flex flex-col gap-2">
                          <div
                            className="w-28 h-28 rounded-lg overflow-hidden flex items-center justify-center bg-slate-100 relative cursor-pointer group"
                            onClick={() => openGallery(productImages, 0)}
                          >
                            {getOrderImage(o) ? (
                              <img
                                src={getOrderImage(o)}
                                className="w-full h-full object-cover"
                                alt={product?.productname}
                              />
                            ) : battery ? (
                              <Battery className="w-12 h-12 text-slate-500" />
                            ) : car ? (
                              <Car className="w-12 h-12 text-slate-500" />
                            ) : (
                              <Package className="w-12 h-12 text-slate-500" />
                            )}

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100 transition">
                              Nhấn để phóng to
                            </div>
                          </div>

                          {productImages.length > 1 && (
                            <div className="flex gap-1">
                              {productImages.slice(0, 4).map((img, idx) => (
                                <button
                                  key={img.imgid || idx}
                                  type="button"
                                  className="w-10 h-10 rounded-md overflow-hidden border border-slate-200 hover:border-blue-500"
                                  onClick={() =>
                                    openGallery(productImages, idx)
                                  }
                                >
                                  <img
                                    src={img.url}
                                    className="w-full h-full object-cover"
                                    alt={`thumb-${idx}`}
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold line-clamp-2">
                            {product
                              ? product.productname
                              : `Gói dịch vụ #${o.packageId}`}
                          </p>
                          {product && (
                            <>
                              <p className="mt-1 text-sm text-slate-500">
                                Loại: {product.type}
                              </p>
                              {car && (
                                <div className="grid grid-cols-2 gap-x-4">
                                  <p className="mt-1 text-sm text-slate-500">
                                    Hãng: {car.brand}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Model: {product.model}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Biển số: {car.licensePlate}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Năm sản xuất: {car.year}
                                  </p>
                                </div>
                              )}
                              {battery && (
                                <div className="grid grid-cols-2 gap-x-4">
                                  <p className="mt-1 text-sm text-slate-500">
                                    Dung lượng: {battery.capacity} kWh
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Điện áp: {battery.voltage} V
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Thương hiệu: {battery.brand}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Tình trạng: {battery.condition}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {(() => {
                        const product = getOrderProduct(o);
                        const type = product?.type;
                        const isPackageOrder = !!o.packageId;

                        const deposit =
                          o.status === ORDER_STATUS.DA_DAT_COC ||
                          o.status === ORDER_STATUS.DA_DUYET ||
                          o.status === ORDER_STATUS.DA_THANH_TOAN ||
                          o.status === ORDER_STATUS.DA_HOAN_TAT
                            ? calculateDeposit(o)
                            : 0;
                        if (type === "Car EV") {
                          return (
                            <>
                              <p className="flex justify-between">
                                <span className="text-slate-500">
                                  Đã đặt cọc (10%):
                                </span>
                                <span className="font-semibold text-blue-600">
                                  {deposit.toLocaleString("vi-VN")} đ
                                </span>
                              </p>

                              {o.status === ORDER_STATUS.DA_THANH_TOAN ||
                              o.status === ORDER_STATUS.DA_HOAN_TAT ? (
                                <>
                                  <p className="flex justify-between">
                                    <span className="text-slate-500">
                                      Đã thanh toán:
                                    </span>
                                    <span className="font-semibold text-emerald-600">
                                      {(o.totalfinal - deposit).toLocaleString(
                                        "vi-VN"
                                      )}{" "}
                                      đ
                                    </span>
                                  </p>
                                  <p className="flex justify-between">
                                    <span className="text-slate-500">
                                      Tổng thanh toán:
                                    </span>
                                    <span className="font-semibold text-red-500">
                                      {o.totalfinal.toLocaleString("vi-VN")} đ
                                    </span>
                                  </p>
                                </>
                              ) : (
                                <p className="flex justify-between">
                                  <span className="text-slate-500">
                                    Còn phải thanh toán:
                                  </span>
                                  <span className="font-semibold text-red-500">
                                    {(o.totalfinal - deposit).toLocaleString(
                                      "vi-VN"
                                    )}{" "}
                                    đ
                                  </span>
                                </p>
                              )}
                            </>
                          );
                        }

                        if (type === "Battery") {
                          return (
                            <>
                              <p className="flex justify-between">
                                <span className="text-slate-500">Giá pin:</span>
                                <span className="font-semibold text-red-500">
                                  {o.totalamount.toLocaleString("vi-VN")} đ
                                </span>
                              </p>

                              <p className="flex justify-between">
                                <span className="text-slate-500">
                                  Phí vận chuyển:
                                </span>
                                <span className="font-semibold text-red-500">
                                  {o.shippingfee.toLocaleString("vi-VN")} đ
                                </span>
                              </p>

                              <p className="flex justify-between">
                                <span className="text-slate-500">
                                  Tổng đã thanh toán:
                                </span>
                                <span className="font-semibold text-red-500">
                                  {o.totalfinal.toLocaleString("vi-VN")} đ
                                </span>
                              </p>
                            </>
                          );
                        }
                        if (isPackageOrder) {
                          return (
                            <p className="flex justify-between">
                              <span className="text-slate-500">
                                Tổng đã thanh toán:
                              </span>
                              <span className="font-semibold text-red-500">
                                {o.totalfinal.toLocaleString("vi-VN")} đ
                              </span>
                            </p>
                          );
                        }

                        return null;
                      })()}

                      <p className="flex justify-between">
                        <span className="text-slate-500">
                          Phương Thức Thanh toán:
                        </span>
                        <span className="font-semibold">{o.paymentmethod}</span>
                      </p>
                    </div>
                  </div>

                  {product && (
                    <div className="border border-slate-200 rounded-xl p-4 text-sm space-y-1">
                      <p className="font-semibold mb-1">Thông tin thêm</p>
                      <p>
                        <span className="font-medium">Mô tả:</span>{" "}
                        {product.description || "Không có mô tả chi tiết."}
                      </p>
                      {product.specs && (
                        <p>
                          <span className="font-medium">
                            Thông số kỹ thuật:
                          </span>{" "}
                          {product.specs}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="border border-slate-200 rounded-xl p-4 space-y-1 text-sm">
                    <p className="font-semibold mb-1">Thông tin người mua</p>
                    <p>
                      <span className="font-medium">Tên hiển thị:</span>{" "}
                      {o.users.displayname || ""} ({o.users.username})
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {o.users.email}
                    </p>
                    <p>
                      <span className="font-medium">SĐT:</span>{" "}
                      {o.users.phone || "Chưa cung cấp"}
                    </p>
                  </div>

                  {seller && (
                    <div className="border border-slate-200 rounded-xl p-4 space-y-1 text-sm">
                      <p className="font-semibold mb-1">Thông tin người bán</p>
                      <p>
                        <span className="font-medium">Tên hiển thị:</span>{" "}
                        {seller.displayname || ""} ({seller.username})
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {seller.email}
                      </p>
                      <p>
                        <span className="font-medium">SĐT:</span>{" "}
                        {seller.phone || "Chưa cung cấp"}
                      </p>
                    </div>
                  )}

                  {(() => {
                    const isPackageOrder = !!o.packageId;
                    const product = getOrderProduct(o);
                    const type = product?.type;

                    if (isPackageOrder) return null;

                    if (type === "Car EV") {
                      return (
                        <div className="border border-slate-200 rounded-xl p-4 space-y-1 text-sm">
                          <p className="font-semibold mb-1">
                            Thông tin giao dịch
                          </p>

                          <p>
                            <span className="font-medium">
                              Địa điểm giao xe:
                            </span>{" "}
                            {o.transactionLocation || ""}
                          </p>

                          <p>
                            <span className="font-medium">Lịch hẹn:</span>{" "}
                            {o.appointmentDate
                              ? formatDateTime(o.appointmentDate)
                              : "Chưa đặt lịch"}
                          </p>
                        </div>
                      );
                    }

                    if (type === "Battery") {
                      return (
                        <div className="border border-slate-200 rounded-xl p-4 space-y-1 text-sm">
                          <p className="font-semibold mb-1">
                            Thông tin giao dịch
                          </p>

                          <p>
                            <span className="font-medium">
                              Địa điểm giao pin:
                            </span>{" "}
                            {o.transactionLocation || o.shippingaddress || ""}
                          </p>
                        </div>
                      );
                    }

                    return null;
                  })()}
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={closeDetail}
                    className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {isGalleryOpen && galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={closeGallery}
        >
          <div
            className="relative w-full max-w-5xl h-[80vh] flex flex-col items-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeGallery}
              className="absolute top-4 right-6 text-white/80 hover:text-white text-2xl"
            >
              ✕
            </button>
            <div className="flex-1 flex items-center justify-center w-full mt-8 mb-4">
              <button
                onClick={prevImage}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white mr-4"
              >
                ‹
              </button>

              <div
                className="relative max-w-4xl w-full h-full flex items-center justify-center overflow-hidden bg-black/40 rounded-xl"
                onMouseDown={(e) => setDragStartX(e.clientX)}
                onMouseUp={(e) => {
                  if (dragStartX === null) return;
                  const diff = e.clientX - dragStartX;
                  if (diff > 50) prevImage();
                  else if (diff < -50) nextImage();
                  setDragStartX(null);
                }}
                onMouseLeave={() => setDragStartX(null)}
                onClick={() => setIsZoomed((z) => !z)}
              >
                <img
                  src={galleryImages[currentImageIndex].url}
                  alt={`image-${currentImageIndex}`}
                  className={`max-h-full max-w-full transition-transform duration-200 ${
                    isZoomed
                      ? "scale-150 cursor-zoom-out"
                      : "scale-100 cursor-zoom-in"
                  }`}
                />
              </div>

              <button
                onClick={nextImage}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white ml-4"
              >
                ›
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-4 w-full justify-center">
              {galleryImages.map((img, idx) => (
                <button
                  key={img.imgid || idx}
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`w-16 h-16 rounded-md overflow-hidden border ${
                    idx === currentImageIndex
                      ? "border-blue-500"
                      : "border-white/30"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`thumb-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

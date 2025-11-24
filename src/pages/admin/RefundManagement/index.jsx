import React, { useEffect, useState } from "react";
import {
  getAllRefund,
  getRefundPending,
  getRefund,
  processRefund,
} from "../../../services/refundService";
import { useTheme } from "../../../contexts/ThemeContext";
import { toast } from "sonner";
import AuroraText from "../../../components/common/AuroraText";
import {
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  User,
  Package,
  Car,
  Battery,
  MapPin,
  CreditCard,
} from "lucide-react";

export default function RefundManagement() {
  const { isDark } = useTheme();
  const [allRefunds, setAllRefunds] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [managerNote, setManagerNote] = useState("");

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [dragStartX, setDragStartX] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        getAllRefund(),
        getRefundPending(),
      ]);
      setAllRefunds(allRes?.refunds || []);
      setPendingRefunds(pendingRes?.refunds || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu yêu cầu hoàn tiền!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: {
        color: isDark
          ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
          : "bg-orange-50 text-orange-600 border border-orange-200",
        label: "Chờ xử lý",
        icon: Clock,
      },
      COMPLETED: {
        color: isDark
          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
          : "bg-blue-50 text-blue-600 border border-blue-200",
        label: "Đã hoàn thành",
        icon: CheckCircle,
      },
      REJECTED: {
        color: isDark
          ? "bg-red-500/20 text-red-300 border border-red-500/40"
          : "bg-red-50 text-red-600 border border-red-200",
        label: "Đã từ chối",
        icon: XCircle,
      },
    };
    return (
      statusMap[status] || {
        color: isDark
          ? "bg-slate-700 text-slate-200 border border-slate-600"
          : "bg-slate-50 text-slate-600 border border-slate-200",
        label: status,
        icon: AlertCircle,
      }
    );
  };

  const getMainProduct = (refund) =>
    refund?.orders?.details?.[0]?.products || null;

  const getProductImages = (refund) => getMainProduct(refund)?.imgs || [];

  const getMainImageUrl = (refund) => {
    const imgs = getProductImages(refund);
    return imgs && imgs.length > 0 ? imgs[0].url : null;
  };

  const openDetail = async (refundId) => {
    try {
      const res = await getRefund(refundId);
      if (res?.status === "success") {
        setSelectedRefund(res.refund);
        setManagerNote(res.refund.note || "");
        setModalVisible(true);
      } else {
        toast.error(res?.message || "Không tìm thấy chi tiết yêu cầu.");
      }
    } catch (error) {
      toast.error("Lỗi khi tải chi tiết yêu cầu hoàn tiền!");
      console.error(error);
    }
  };

  const closeDetail = () => {
    setSelectedRefund(null);
    setModalVisible(false);
    setManagerNote(""); 
  };

  const handleProcess = async (approveAction) => {
    if (!selectedRefund) return;

    if (!approveAction && !managerNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối!");
      return;
    }

    const confirmationMessage = approveAction
      ? "Xác nhận CHẤP NHẬN yêu cầu hoàn tiền này?"
      : "Xác nhận TỪ CHỐI yêu cầu hoàn tiền này?";

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setProcessing(true);

    const payload = {
      approve: approveAction,
      refundMethod: "VNPAY",
      note: managerNote.trim(),
    };

    try {
      const response = await processRefund(selectedRefund.refundid, payload);
      if (response?.status === "success") {
        toast.success(response.message || "Xử lý yêu cầu thành công!");
        closeDetail();
        fetchData();
      } else {
        throw new Error(response?.message || "Xử lý yêu cầu thất bại!");
      }
    } catch (error) {
      toast.error(error.message || "Xử lý yêu cầu thất bại!");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const openGallery = (refund, startIndex = 0) => {
    const imgs = getProductImages(refund);
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

  useEffect(() => {
    if (!isGalleryOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeGallery();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryOpen, galleryImages.length]);

  const currentRefunds = activeTab === "pending" ? pendingRefunds : allRefunds;

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-slate-950" : "bg-slate-50"
        }`}
      >
        <Loader2
          className={`w-12 h-12 animate-spin ${
            isDark ? "text-blue-400" : "text-blue-500"
          }`}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        isDark ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mb-8">
        <AuroraText className="text-4xl font-bold mb-2">
          Quản Lý Hoàn Tiền
        </AuroraText>
        <p className={isDark ? "text-slate-400" : "text-slate-600"}>
          Xem và xử lý các yêu cầu hoàn tiền từ khách hàng
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
            activeTab === "pending"
              ? isDark
                ? "bg-blue-500 text-slate-950 border-blue-400 shadow-lg shadow-blue-500/20"
                : "bg-blue-500 text-white border-blue-500 shadow"
              : isDark
              ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          Chờ xử lý ({pendingRefunds.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
            activeTab === "all"
              ? isDark
                ? "bg-blue-500 text-slate-950 border-blue-400 shadow-lg shadow-blue-500/20"
                : "bg-blue-500 text-white border-blue-500 shadow"
              : isDark
              ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          Tất cả yêu cầu ({allRefunds.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {currentRefunds.map((refund) => {
          const badge = getStatusBadge(refund.status);
          const BadgeIcon = badge.icon;
          const product = getMainProduct(refund);
          const mainImage = getMainImageUrl(refund);
          const buyer = refund.orders?.users;
          const order = refund.orders;

          return (
            <div
              key={refund.refundid}
              className={`relative rounded-2xl overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                isDark
                  ? "bg-slate-900/70 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="p-4 pb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText
                      className={`w-4 h-4 ${
                        isDark ? "text-blue-300" : "text-blue-500"
                      }`}
                    />
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      YÊU CẦU HOÀN TIỀN
                    </span>
                  </div>
                  <p className="mt-1 text-base font-semibold">
                    #{refund.refundid}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(refund.createdat)}
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
                >
                  <BadgeIcon className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </div>
              </div>

              <div className="px-4 pb-4 flex gap-3">
                <div
                  className="w-24 h-24 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center cursor-pointer group"
                  onClick={() => openGallery(refund, 0)}
                >
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product?.productname || "Sản phẩm"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : product ? (
                    product.type === "Battery" ? (
                      <Battery className="w-8 h-8 text-slate-500" />
                    ) : (
                      <Car className="w-8 h-8 text-slate-500" />
                    )
                  ) : (
                    <Package className="w-8 h-8 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-semibold line-clamp-2">
                    {product
                      ? product.productname
                      : `Đơn hàng #${order?.orderid || ""}`}
                  </p>
                  <p className="text-xs text-slate-400">
                    Loại: {product?.type || "Không xác định"}
                  </p>
                  {buyer && (
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <User className="w-3.5 h-3.5" />
                      <span>
                        {buyer.displayname || buyer.username} • {buyer.email}
                      </span>
                    </p>
                  )}
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>
                      Đơn #{order?.orderid} • {order?.paymentmethod || "N/A"}
                    </span>
                  </p>
                  <div className="mt-2 flex items-end justify-between">
                    <div className="max-w-[60%]">
                      <p className="text-xs text-slate-400">Lý do:</p>
                      <p className="text-xs line-clamp-2">{refund.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">
                        Số tiền yêu cầu
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          isDark ? "text-blue-300" : "text-blue-500"
                        }`}
                      >
                        {Number(refund.amount || 0).toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`px-4 py-3 border-t flex justify-end ${
                  isDark ? "border-slate-800" : "border-slate-200"
                }`}
              >
                <button
                  onClick={() => openDetail(refund.refundid)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    isDark
                      ? "bg-blue-500 text-slate-950 hover:bg-blue-400"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {currentRefunds.length === 0 && (
        <div className="text-center py-16">
          <FileText
            className={`w-16 h-16 mx-auto mb-4 ${
              isDark ? "text-slate-700" : "text-slate-300"
            }`}
          />
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            Không có yêu cầu hoàn tiền nào
          </p>
        </div>
      )}

      {modalVisible && selectedRefund && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={closeDetail}
        >
          <div
            className={`w-full max-w-4xl rounded-2xl shadow-xl max-h-[90vh] overflow-hidden ${
              isDark ? "bg-slate-900 text-slate-50" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-6 py-4 border-b flex items-start justify-between gap-3 ${
                isDark ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <div>
                <p className="text-xs text-slate-400">
                  Chi tiết yêu cầu hoàn tiền
                </p>
                <h3 className="text-xl font-bold mt-1">
                  Yêu cầu #{selectedRefund.refundid}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  Tạo lúc {formatDateTime(selectedRefund.createdat)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {(() => {
                  const badge = getStatusBadge(selectedRefund.status);
                  const Icon = badge.icon;
                  return (
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </div>
                  );
                })()}
                <button
                  onClick={closeDetail}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Đóng
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {(() => {
                const refund = selectedRefund;
                const order = refund.orders;
                const product = getMainProduct(refund);
                const buyer = order?.users;
                const seller = product?.users;
                const imgs = getProductImages(refund);
                const car = product?.brandcars;
                const battery = product?.brandbattery;
                const processedBy = refund.processedBy;

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="md:col-span-2 flex gap-4">
                        <div className="flex flex-col gap-3">
                          <div
                            className="w-32 h-32 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center cursor-pointer group"
                            onClick={() => openGallery(refund, 0)}
                          >
                            {imgs && imgs.length > 0 ? (
                              <img
                                src={imgs[0].url}
                                alt={product?.productname || "Sản phẩm"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : product ? (
                              product.type === "Battery" ? (
                                <Battery className="w-10 h-10 text-slate-500" />
                              ) : (
                                <Car className="w-10 h-10 text-slate-500" />
                              )
                            ) : (
                              <Package className="w-10 h-10 text-slate-500" />
                            )}
                          </div>
                          {imgs && imgs.length > 1 && (
                            <div className="flex gap-2">
                              {imgs.slice(0, 4).map((img, idx) => (
                                <button
                                  key={img.imgid || idx}
                                  className="w-14 h-14 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-400"
                                  onClick={() => openGallery(refund, idx)}
                                >
                                  <img
                                    src={img.url}
                                    alt={`thumb-${idx}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-base font-semibold">
                            {product
                              ? product.productname
                              : `Đơn hàng #${order?.orderid}`}
                          </p>
                          {product && (
                            <p className="text-sm text-slate-400">
                              Loại: {product.type} • Model: {product.model}
                            </p>
                          )}
                          {car && (
                            <div className="grid grid-cols-2 gap-x-4 text-sm text-slate-400">
                              <p>Hãng: {car.brand}</p>
                              <p>Biển số: {car.licensePlate}</p>
                              <p>Năm SX: {car.year}</p>
                              <p>ODO: {car.odo} km</p>
                            </div>
                          )}
                          {battery && (
                            <div className="grid grid-cols-2 gap-x-4 text-sm text-slate-400">
                              <p>Dung lượng: {battery.capacity} kWh</p>
                              <p>Điện áp: {battery.voltage} V</p>
                              <p>Thương hiệu: {battery.brand}</p>
                              <p>Tình trạng: {battery.condition}</p>
                            </div>
                          )}
                          {product?.description && (
                            <p className="text-sm text-slate-300 line-clamp-3">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div
                          className={`rounded-xl px-4 py-3 ${
                            isDark ? "bg-slate-800" : "bg-slate-50"
                          }`}
                        >
                          <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                            Thông tin số tiền
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">
                              Giá đơn hàng:
                            </span>
                            <span className="font-semibold">
                              {Number(order?.totalamount || 0).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              đ
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">
                              Phí vận chuyển:
                            </span>
                            <span className="font-semibold">
                              {Number(order?.shippingfee || 0).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              đ
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">
                              Tổng thanh toán:
                            </span>
                            <span className="font-semibold">
                              {Number(order?.totalfinal || 0).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              đ
                            </span>
                          </p>
                          <div className="mt-3 pt-3 border-t border-dashed border-slate-600 flex justify-between items-baseline">
                            <span className="text-xs text-slate-400">
                              Số tiền yêu cầu hoàn
                            </span>
                            <span
                              className={`text-lg font-bold ${
                                isDark ? "text-blue-300" : "text-blue-500"
                              }`}
                            >
                              {Number(refund.amount || 0).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              đ
                            </span>
                          </div>
                        </div>

                        <div
                          className={`rounded-xl px-4 py-3 ${
                            isDark ? "bg-slate-800" : "bg-slate-50"
                          }`}
                        >
                          <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                            Thanh toán & giao dịch
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Phương thức:</span>
                            <span className="font-semibold">
                              {order?.paymentmethod || "N/A"}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">
                              Trạng thái đơn:
                            </span>
                            <span className="font-semibold">
                              {order?.status || "N/A"}
                            </span>
                          </p>
                          <p className="mt-2 flex items-start gap-2 text-xs text-slate-300">
                            <MapPin className="w-3.5 h-3.5 mt-0.5" />
                            <span>
                              {order?.transactionLocation ||
                                order?.shippingaddress ||
                                "Không có thông tin địa điểm"}
                            </span>
                          </p>
                          {order?.appointmentDate && (
                            <p className="mt-1 text-xs text-slate-400">
                              Lịch hẹn: {formatDateTime(order.appointmentDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`rounded-xl px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 ${
                        isDark
                          ? "bg-slate-900/80 border border-slate-800"
                          : "bg-slate-50 border border-slate-200"
                      }`}
                    >
                      {/* Cột 1: Người mua */}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                          Người yêu cầu hoàn tiền (Người mua)
                        </p>
                        {buyer ? (
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-slate-400">Tên:</span>{" "}
                              <span className="font-medium">
                                {buyer.displayname || buyer.username}
                              </span>
                            </p>
                            <p>
                              <span className="text-slate-400">Email:</span>{" "}
                              {buyer.email}
                            </p>
                            <p>
                              <span className="text-slate-400">SĐT:</span>{" "}
                              {buyer.phone || "Chưa cung cấp"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">
                            Không có thông tin người mua
                          </p>
                        )}
                      </div>
                      {/* Cột 2: Người bán (Đã được hiển thị) */}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                          Thông tin Người bán
                        </p>
                        {seller ? (
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-slate-400">Tên:</span>{" "}
                              <span className="font-medium">
                                {seller.displayname || seller.username}
                              </span>
                            </p>
                            <p>
                              <span className="text-slate-400">Email:</span>{" "}
                              {seller.email}
                            </p>
                            <p>
                              <span className="text-slate-400">SĐT:</span>{" "}
                              {seller.phone || "Chưa cung cấp"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">
                            Không có thông tin người bán
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Lý do yêu cầu */}
                    <div
                      className={`rounded-xl px-4 py-4 ${
                        isDark
                          ? "bg-slate-900/80 border border-slate-800"
                          : "bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                        Lý do yêu cầu hoàn tiền (từ Người mua)
                      </p>
                      <p className="text-sm whitespace-pre-line">
                        {selectedRefund.reason}
                      </p>
                    </div>

                    {/* Ghi chú Manager */}
                    <div
                      className={`rounded-xl px-4 py-4 ${
                        isDark
                          ? "bg-slate-900/80 border border-slate-800"
                          : "bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                        Ghi chú / Lý do xử lý (Manager's Note)
                      </p>
                      <textarea
                        rows={3}
                        value={managerNote}
                        onChange={(e) => setManagerNote(e.target.value)}
                        placeholder={
                          selectedRefund.status === "PENDING"
                            ? "Nhập lý do từ chối chi tiết hoặc ghi chú xác nhận..."
                            : selectedRefund.note ||
                              "Không có ghi chú từ người xử lý."
                        }
                        disabled={
                          processing || selectedRefund.status !== "PENDING"
                        }
                        className={`w-full p-3 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                          isDark
                            ? "bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                        } border disabled:opacity-70 disabled:bg-slate-700/50 disabled:cursor-not-allowed`}
                      />
                    </div>

                    {processedBy && (
                      <div
                        className={`rounded-xl px-4 py-4 ${
                          isDark
                            ? "bg-slate-900/80 border border-slate-800"
                            : "bg-slate-50 border border-slate-200"
                        }`}
                      >
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                          Thông tin xử lý
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <p>
                            <span className="text-slate-400">Người xử lý:</span>{" "}
                            <span className="font-medium">
                              {processedBy.displayname || processedBy.username}
                            </span>
                          </p>
                          <p>
                            <span className="text-slate-400">Email:</span>{" "}
                            {processedBy.email}
                          </p>
                          <p>
                            <span className="text-slate-400">SĐT:</span>{" "}
                            {processedBy.phone || "Chưa cung cấp"}
                          </p>
                          <p>
                            <span className="text-slate-400">
                              Thời gian xử lý:
                            </span>{" "}
                            {formatDateTime(selectedRefund.processedAt)}
                          </p>
                        </div>
                        {selectedRefund.refundMethod && (
                          <p className="mt-2 text-sm">
                            <span className="text-slate-400">
                              Phương thức hoàn:
                            </span>{" "}
                            <span className="font-medium">
                              {selectedRefund.refundMethod}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div
              className={`px-6 py-4 border-t flex justify-end gap-3 ${
                isDark ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <button
                onClick={closeDetail}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isDark
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
                disabled={processing}
              >
                Đóng
              </button>
              {selectedRefund.status === "PENDING" && (
                <>
                  <button
                    onClick={() => handleProcess(false)}
                    disabled={processing || !managerNote.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                  >
                    {processing && !managerNote.trim() ? (
                      <Loader2 className="w-4 h-4 animate-spin inline-block mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 inline-block mr-1" />
                    )}
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleProcess(true)}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin inline-block mr-1" />
                    ) : (
                      <CheckCircle className="w-4 h-4 inline-block mr-1" />
                    )}
                    Chấp nhận hoàn tiền
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
                      ? "border-blue-400"
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

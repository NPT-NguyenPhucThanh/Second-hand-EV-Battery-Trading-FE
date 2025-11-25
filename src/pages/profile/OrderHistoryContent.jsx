import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useTheme } from "../../contexts/ThemeContext";
import {
  ShoppingBag,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  CreditCard,
  Eye,
  PackageCheck,
  MapPin,
  Package,
  Truck,
  RefreshCw,
} from "lucide-react";
import AuroraText from "../../components/common/AuroraText";

const currency = (value) => {
  if (value === null || value === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// COMPONENT STATUS ĐẸP - HỖ TRỢ ĐẦY ĐỦ TẤT CẢ TRẠNG THÁI
const OrderStatusTag = ({ status, isDark }) => {
  const statusConfig = {
    CHO_THANH_TOAN:     { text: "Chờ thanh toán",          icon: Clock,        gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
    CHO_DAT_COC:        { text: "Chờ đặt cọc 10%",         icon: Clock,        gradient: "linear-gradient(135deg, #f97316, #ea580c)" },
    CHO_XAC_NHAN:       { text: "Chờ xác nhận",            icon: Clock,        gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    DA_DAT_COC:         { text: "Đã đặt cọc 10%",          icon: CheckCircle,  gradient: "linear-gradient(135deg, #10b981, #059669)" },
    CHO_DUYET:          { text: "Chờ duyệt",               icon: Clock,        gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
    DA_DUYET:           { text: "Đã duyệt",                icon: CheckCircle,  gradient: "linear-gradient(135deg, #3b82f6, #2563eb)" },
    DA_THANH_TOAN:      { text: "Đã thanh toán đầy đủ",    icon: CheckCircle,  gradient: "linear-gradient(135deg, #10b981, #059669)" },
    DANG_VAN_CHUYEN:    { text: "Đang vận chuyển",         icon: Truck,        gradient: "linear-gradient(135deg, #06b6d4, #0891b2)" },
    DA_GIAO:            { text: "Đã giao - Chờ xác nhận",  icon: Package,      gradient: "linear-gradient(135deg, #3b82f6, #2563eb)" },
    DA_HOAN_TAT:        { text: "Hoàn tất",                icon: CheckCircle,  gradient: "linear-gradient(135deg, #10b981, #059669)" },
    BI_TU_CHOI:         { text: "Bị từ chối",              icon: XCircle,      gradient: "linear-gradient(135deg, #ef4444, #dc2626)" },
    TRANH_CHAP:         { text: "Đang tranh chấp",         icon: AlertTriangle,gradient: "linear-gradient(135deg, #f97316, #ea580c)" },
    DISPUTE_RESOLVED:   { text: "Đã giải quyết tranh chấp",icon: CheckCircle,  gradient: "linear-gradient(135deg, #10b981, #059669)" },
    RESOLVED_WITH_REFUND:{ text: "Đã hoàn tiền",           icon: RefreshCw,    gradient: "linear-gradient(135deg, #ec4899, #db2777)" },
    DA_HUY:             { text: "Đã hủy",                  icon: XCircle,      gradient: "linear-gradient(135deg, #6b7280, #4b5563)" },
    THAT_BAI:           { text: "Thanh toán thất bại",     icon: XCircle,      gradient: "linear-gradient(135deg, #ef4444, #dc2626)" },
  };

  const config = statusConfig[status] || {
    text: status || "Không xác định",
    icon: Clock,
    gradient: "linear-gradient(135deg, #6b7280, #4b5563)",
  };

  const Icon = config.icon;

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-lg text-white"
      style={{ background: config.gradient }}
    >
      <Icon className="w-4 h-4" />
      {config.text}
    </div>
  );
};

export default function OrderHistoryContent() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colors = {
    aurora: isDark
      ? ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"]
      : ["#3b82f6", "#8b5cf6", "#06b6d4", "#3b82f6"],
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await api.get("api/buyer/orders");
        if (response.status === "success") {
          const sortedOrders = (response.orders || []).sort(
            (a, b) => new Date(b.createdat) - new Date(a.createdat)
          );
          setOrders(sortedOrders);
        } else {
          setError(response.message || "Không thể tải đơn hàng.");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleFinalPayment = (orderId) => {
    navigate(`/checkout/final-payment/${orderId}`);
  };

  const handleDepositAgain = (orderId) => {
    navigate(`/checkout/deposit/${orderId}`);
  };

  const handleViewTransactions = (orderId) => {
    navigate(`/profile/orders/${orderId}/transactions`);
  };

  const handleConfirmDelivery = async (orderId) => {
    if (!window.confirm("Xác nhận bạn đã nhận hàng? Hành động này không thể hoàn tác.")) return;

    try {
      const response = await api.post(`api/buyer/orders/${orderId}/confirm-delivery`);
      if (response.status === "success") {
        alert("Xác nhận nhận hàng thành công!");
        const refreshed = await api.get("api/buyer/orders");
        if (refreshed.status === "success") {
          setOrders((refreshed.orders || []).sort((a, b) => new Date(b.createdat) - new Date(a.createdat)));
        }
      } else {
        alert("Lỗi: " + (response.message || "Không thể xác nhận"));
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  return (
    <div className="relative min-h-screen pb-10">
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ background: isDark ? "radial-gradient(circle, #ef4444 0%, transparent 70%)" : "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
        <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl animate-pulse [animation-delay:1s]"
          style={{ background: isDark ? "radial-gradient(circle, #f97316 0%, transparent 70%)" : "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <AuroraText text="Lịch Sử Đơn Hàng" colors={colors.aurora} className="text-4xl font-black mb-8" />

        {loading ? (
          <div className="text-center py-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent" />
            <p className="mt-4 text-lg">Đang tải đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 dark:bg-red-900/30 rounded-3xl border border-red-200 dark:border-red-800">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <p className="text-lg">Lỗi: {error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800">
            <ShoppingBag className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <p className="text-xl">Bạn chưa có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const orderNumber = orders.length - index;
              const firstDetail = order.details?.[0];
              const productName = firstDetail?.products?.productname || "Đơn hàng gói dịch vụ";

              return (
                <div
                  key={order.orderid}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                  onClick={() => handleViewTransactions(order.orderid)}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      {/* Thông tin đơn hàng */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                          <AuroraText text={`Đơn hàng #${orderNumber}`} colors={colors.aurora} className="text-2xl font-bold" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">{productName}</span>
                            {order.details?.length > 1 && <span className="text-gray-500">+ {order.details.length - 1} sản phẩm</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">{order.shippingaddress || "Chưa có địa chỉ"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <span>{new Date(order.createdat).toLocaleDateString("vi-VN")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            <span className="text-xl font-bold text-emerald-600">{currency(order.totalfinal)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Trạng thái & Hành động */}
                      <div className="flex flex-col items-end gap-4">
                        <OrderStatusTag status={order.status} isDark={isDark} />

                        <div className="flex flex-wrap gap-3 justify-end">
                          {/* Thanh toán cuối / Thanh toán pin */}
                          {(order.status === "DA_DUYET" || order.status === "CHO_THANH_TOAN") && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleFinalPayment(order.orderid); }}
                              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                            >
                              <CreditCard className="w-5 h-5" />
                              {order.status === "DA_DUYET" ? "Thanh toán 90%" : "Thanh toán ngay"}
                            </button>
                          )}

                          {/* Thanh toán lại khi thất bại */}
                          {order.status === "THAT_BAI" && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleFinalPayment(order.orderid); }}
                                className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                              >
                                <CreditCard className="w-5 h-5" />
                                Thanh toán lại
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDepositAgain(order.orderid); }}
                                className="px-5 py-3 rounded-xl border-2 border-red-500 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                              >
                                Đặt cọc lại
                              </button>
                            </>
                          )}

                          {/* Xác nhận nhận hàng */}
                          {(order.status === "DA_GIAO" || order.status === "DA_THANH_TOAN") && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleConfirmDelivery(order.orderid); }}
                              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                            >
                              <PackageCheck className="w-5 h-5" />
                              Xác nhận nhận hàng
                            </button>
                          )}

                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewTransactions(order.orderid); }}
                            className="px-5 py-3 rounded-xl border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center gap-2"
                          >
                            <Eye className="w-5 h-5" />
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
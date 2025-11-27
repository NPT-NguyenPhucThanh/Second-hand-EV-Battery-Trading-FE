import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get } from "../../utils/api";
import { useTheme } from "../../contexts/ThemeContext";
import {
  ArrowLeft,
  DollarSign,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Package,
  RefreshCw,
  Percent,
  Battery,
  Coins,
  Calendar,
  MapPin,
  Truck,
  UserCircle2,
  Phone,
  Mail,
  Store,
  Car,
} from "lucide-react";
import AuroraText from "../../components/common/AuroraText";
import { toast } from "sonner";

// Format tiền tệ
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Format ngày giờ
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Tag trạng thái
const TransactionStatusTag = ({ status }) => {
  const config = {
    SUCCESS: { text: "Thành công", icon: CheckCircle, color: "#10b981" },
    PENDING: { text: "Đang xử lý", icon: Clock, color: "#f59e0b" },
    CANCELLED: { text: "Đã hủy", icon: XCircle, color: "#6b7280" },
    FAILED: { text: "Thất bại", icon: XCircle, color: "#ef4444" },
    DA_THANH_TOAN: {
      text: "Đã thanh toán",
      icon: CheckCircle,
      color: "#10b981",
    },
  }[status] || {
    text: status || "Không rõ",
    icon: AlertCircle,
    color: "#6b7280",
  };

  const Icon = config.icon;
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-medium text-xs text-white shadow-sm"
      style={{ backgroundColor: config.color + "dd" }}
    >
      <Icon className="w-4 h-4" />
      {config.text}
    </div>
  );
};

// Tag loại giao dịch
const TransactionTypeTag = ({ type }) => {
  const config = {
    DEPOSIT: { text: "Đặt cọc", icon: Coins, color: "#3b82f6" },
    FINAL_PAYMENT: {
      text: "Thanh toán cuối",
      icon: CreditCard,
      color: "#10b981",
    },
    REFUND: { text: "Hoàn tiền", icon: RefreshCw, color: "#f97316" },
    COMMISSION: { text: "Hoa hồng", icon: Percent, color: "#8b5cf6" },
    BATTERY_PAYMENT: {
      text: "Thanh toán pin",
      icon: Battery,
      color: "#06b6d4",
    },
    PACKAGE_PURCHASE: { text: "Mua gói", icon: Package, color: "#eab308" },
  }[type] || { text: type || "Khác", icon: Receipt, color: "#6b7280" };

  const Icon = config.icon;
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs"
      style={{
        color: config.color,
        backgroundColor: config.color + "15",
        border: `1px solid ${config.color}40`,
      }}
    >
      <Icon className="w-4 h-4" />
      {config.text}
    </div>
  );
};

export default function TransactionContent() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [transactionData, setTransactionData] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const colors = {
    aurora: isDark
      ? ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"]
      : ["#3b82f6", "#8b5cf6", "#06b6d4", "#3b82f6"],
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchData = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [transRes, orderRes] = await Promise.all([
          get(`api/buyer/orders/${orderId}/transactions`),
          get(`api/buyer/orders/${orderId}`),
        ]);

        if (transRes?.status === "success") {
          setTransactionData(transRes);
        }

        if (orderRes?.status === "success") {
          const order = orderRes.order || orderRes.data || orderRes;
          setOrderInfo(order);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        toast.error("Đã có lỗi xảy ra khi tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mb-4"
            style={{
              borderColor: isDark ? "#ef4444" : "#3b82f6",
              borderTopColor: "transparent",
            }}
          />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Đang tải thông tin đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className="text-center py-20">
        <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Không tìm thấy đơn hàng
        </p>
      </div>
    );
  }

  const { allTransactions = [] } = transactionData || {};
  const detail = orderInfo.details?.[0];
  const product = detail?.products;
  const isBattery = product?.type === "Battery";

  const totalSuccessfulDeposit = allTransactions
    .filter((t) => t.transactionType === "DEPOSIT" && t.status === "SUCCESS")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalSuccessfulRefund = allTransactions
    .filter((t) => t.transactionType === "REFUND" && t.status === "SUCCESS")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const seller = product?.users
    ? {
        name: product.users.displayname || "Người bán",
        phone: product.users.phone || "—",
        email: product.users.email || "—",
      }
    : { name: "Không xác định", phone: "—", email: "—" };

  // Parse specs thành object để hiển thị đẹp
  const parseSpecs = (specsString) => {
    if (!specsString) return [];
    return specsString.split(", ").map((item) => {
      const [key, ...valueParts] = item.split(": ");
      const value = valueParts.join(": ");
      return { key: key.trim(), value: value?.trim() || "—" };
    });
  };

  const specsList = product?.specs ? parseSpecs(product.specs) : [];

  return (
    <div className="min-h-screen pb-16">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{
            background: isDark
              ? "radial-gradient(circle, #ef4444 0%, transparent 70%)"
              : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            background: isDark
              ? "radial-gradient(circle, #f97316 0%, transparent 70%)"
              : "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <AuroraText
            text={`Đơn hàng #${orderId}`}
            colors={colors.aurora}
            speed={4}
            className="text-3xl md:text-4xl font-black tracking-tight"
          />
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all hover:scale-105 shadow-lg backdrop-blur-sm"
            style={{
              background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              border: `1px solid ${
                isDark ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)"
              }`,
              color: isDark ? "#e5e7eb" : "#1f2937",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>

        {/* THÔNG TIN SẢN PHẨM */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            {isBattery ? (
              <>
                <Battery className="w-8 h-8 text-cyan-500" />
                Thông tin pin
              </>
            ) : (
              <>
                <Car className="w-8 h-8 text-blue-500" />
                Thông tin xe
              </>
            )}
          </h3>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Hình ảnh */}
              <div className="lg:col-span-1">
                {product?.imgs?.[0]?.url ? (
                  <img
                    src={product.imgs[0].url}
                    alt={product.productname}
                    className="w-full h-64 object-cover rounded-2xl shadow-lg"
                  />
                ) : (
                  <div className="bg-gray-200 dark:bg-gray-700 border-2 border-dashed rounded-2xl w-full h-64 flex items-center justify-center">
                    {isBattery ? (
                      <Battery className="w-16 h-16 text-gray-400" />
                    ) : (
                      <Car className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Thông tin chi tiết */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {product?.productname || "Không có tên sản phẩm"}
                  </h4>
                  <p className="text-lg text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                    {formatCurrency(product?.cost)}
                  </p>
                </div>

                {/* Thông số chính */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {isBattery ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Dung lượng:
                        </span>
                        <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                          {product.brandbattery?.capacity || "—"} kWh
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Điện áp:
                        </span>
                        <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                          {product.brandbattery?.voltage || "—"}V
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Thương hiệu:
                        </span>
                        <span className="font-semibold">
                          {product.brandbattery?.brand || product.model || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Tình trạng:
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {product.brandbattery?.condition || "like new"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Model:
                        </span>
                        <span className="font-semibold">
                          {product?.model || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Hãng xe:
                        </span>
                        <span className="font-semibold">
                          {product?.brandcars?.brand || "—"}
                        </span>
                      </div>
                      {/* THÊM DÒNG NÀY – NĂM SẢN XUẤT */}
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Năm sản xuất:
                        </span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {product?.brandcars?.year > 0
                            ? product.brandcars.year
                            : "—"}
                        </span>
                      </div>
                      {/* Có thể thêm dòng trống hoặc giữ nguyên 4 ô nếu muốn đều */}
                      <div></div>
                    </>
                  )}
                </div>

                {/* Mô tả */}
                {product?.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Mô tả
                    </p>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Thông số kỹ thuật chi tiết - HIỂN THỊ CHO CẢ PIN VÀ XE */}
                {!isBattery && specsList.length > 0 && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Thông số kỹ thuật chi tiết
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {specsList.map((spec, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-3 px-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-blue-100 dark:border-blue-800/40"
                        >
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {spec.key}
                          </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 ml-4">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3 ô thông tin */}
        <div
          className={`grid grid-cols-1 ${
            isBattery ? "md:grid-cols-2" : "md:grid-cols-3"
          } gap-6 mb-10`}
        >
          {/* Địa chỉ */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-7 border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  {isBattery ? "Địa chỉ nhận hàng" : "Địa chỉ giao dịch"}
                </p>
                <p className="text-base font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                  {orderInfo.shippingaddress || "Chưa có địa chỉ"}
                </p>
              </div>
            </div>
          </div>

          {/* Người bán */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-7 border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
                  Thông tin người bán
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {seller.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {seller.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                      {seller.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tổng quan tài chính */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-500" />
            Tổng quan tài chính
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Tổng thanh toán",
                value: orderInfo.totalfinal || 0,
                gradient: "from-blue-500 to-blue-600",
              },
              {
                label: "Tiền hàng",
                value: orderInfo.totalamount || 0,
                gradient: "from-emerald-500 to-emerald-600",
              },
              {
                label: "Phí vận chuyển",
                value: orderInfo.shippingfee || 0,
                gradient: "from-purple-500 to-purple-600",
              },
              {
                label: "Đã đặt cọc",
                value: totalSuccessfulDeposit,
                gradient: "from-amber-500 to-amber-600",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all"
              >
                <div
                  className={`p-3 rounded-2xl bg-gradient-to-br ${item.gradient} w-fit mb-4 shadow-lg`}
                >
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(item.value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Lịch sử giao dịch */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Receipt className="w-8 h-8 text-blue-500" />
            Lịch sử giao dịch ({allTransactions.length})
          </h3>
          <div className="space-y-5">
            {allTransactions.length === 0 ? (
              <div className="text-center py-16 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800">
                <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Chưa có giao dịch nào
                </p>
              </div>
            ) : (
              allTransactions.map((t) => (
                <div
                  key={t.transactionId}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-4">
                      <TransactionTypeTag type={t.transactionType} />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {t.description || "Không có mô tả"}
                      </p>
                    </div>
                    <div className="lg:col-span-2">
                      <p
                        className={`text-2xl font-bold ${
                          t.status === "SUCCESS"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-gray-500"
                        }`}
                      >
                        {formatCurrency(t.amount)}
                      </p>
                    </div>
                    <div className="lg:col-span-2">
                      <div className="flex flex-wrap gap-2">
                        {t.method && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            <CreditCard className="w-3.5 h-3.5" />
                            {t.method}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <TransactionStatusTag status={t.status} />
                    </div>
                    <div className="lg:col-span-2 text-right">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(t.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

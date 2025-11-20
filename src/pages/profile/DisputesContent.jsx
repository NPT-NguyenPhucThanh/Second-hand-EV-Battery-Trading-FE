import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  X,
  FileText,
  Calendar,
} from "lucide-react";
import AuroraText from "../../components/common/AuroraText";

// Status tag component with modern gradients
const DisputeStatusTag = ({ status, isDark }) => {
  const statusConfig = {
    PENDING: {
      label: "Đang chờ",
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
      bg: isDark ? "bg-yellow-500/20" : "bg-yellow-100",
      text: isDark ? "text-yellow-400" : "text-yellow-700",
      border: "border-yellow-500/30",
    },
    IN_PROGRESS: {
      label: "Đang xử lý",
      icon: AlertTriangle,
      gradient: "from-blue-500 to-purple-500",
      bg: isDark ? "bg-blue-500/20" : "bg-blue-100",
      text: isDark ? "text-blue-400" : "text-blue-700",
      border: "border-blue-500/30",
    },
    RESOLVED: {
      label: "Đã giải quyết",
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-500",
      bg: isDark ? "bg-green-500/20" : "bg-green-100",
      text: isDark ? "text-green-400" : "text-green-700",
      border: "border-green-500/30",
    },
    REJECTED: {
      label: "Từ chối",
      icon: XCircle,
      gradient: "from-red-500 to-pink-500",
      bg: isDark ? "bg-red-500/20" : "bg-red-100",
      text: isDark ? "text-red-400" : "text-red-700",
      border: "border-red-500/30",
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} border ${config.border}`}
    >
      <Icon className={`w-4 h-4 ${config.text}`} />
      <span className={`text-sm font-medium ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
};

export default function DisputesContent() {
  const { isDark } = useTheme();
  const [disputes, setDisputes] = useState([]);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    orderId: "",
    reasonType: "",
    description: "",
  });

  const reasonTypes = [
    { value: "PRODUCT_NOT_AS_DESCRIBED", label: "Sản phẩm không đúng mô tả" },
    { value: "PRODUCT_DAMAGED", label: "Sản phẩm bị hỏng" },
    { value: "PRODUCT_NOT_RECEIVED", label: "Chưa nhận được sản phẩm" },
    { value: "SELLER_UNRESPONSIVE", label: "Người bán không phản hồi" },
    { value: "PAYMENT_ISSUE", label: "Vấn đề thanh toán" },
    { value: "OTHER", label: "Khác" },
  ];

  useEffect(() => {
    fetchDisputes();
    fetchEligibleOrders();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/buyer/disputes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns { status: "success", disputes: [...] }
        setDisputes(Array.isArray(data.disputes) ? data.disputes : []);
      } else {
        console.error("Failed to fetch disputes");
        setDisputes([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/buyer/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns { status: "success", orders: [...], totalOrders: n }
        const orders = Array.isArray(data.orders) ? data.orders : [];
        // Filter orders that can have disputes: DA_THANH_TOAN, DA_GIAO, DA_HOAN_TAT
        const eligible = orders.filter((order) =>
          ["DA_THANH_TOAN", "DA_GIAO", "DA_HOAN_TAT"].includes(order.status)
        );
        setEligibleOrders(eligible);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setEligibleOrders([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.orderId || !form.reasonType || !form.description.trim()) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/buyer/dispute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: parseInt(form.orderId),
          reasonType: form.reasonType,
          description: form.description,
        }),
      });

      if (response.ok) {
        alert("Khiếu nại đã được tạo thành công!");
        setShowModal(false);
        setForm({ orderId: "", reasonType: "", description: "" });
        fetchDisputes();
        fetchEligibleOrders();
      } else {
        const error = await response.text();
        alert(`Lỗi: ${error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Đã xảy ra lỗi khi tạo khiếu nại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Floating gradient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-3xl animate-float [animation-delay:2s]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <AuroraText text="Quản Lý Khiếu Nại" className="text-4xl font-bold" />

          <button
            onClick={() => setShowModal(true)}
            disabled={eligibleOrders.length === 0}
            className={`
              group relative px-6 py-3 rounded-xl font-semibold
              bg-gradient-to-r from-orange-500 to-red-500 text-white
              hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              transition-all duration-300
              flex items-center gap-2
            `}
          >
            <Plus className="w-5 h-5" />
            <span>Tạo Khiếu Nại Mới</span>
          </button>
        </div>

        {/* Disputes List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-500 rounded-full animate-spin [animation-delay:150ms]" />
            </div>
          </div>
        ) : disputes.length === 0 ? (
          <div
            className={`
            relative overflow-hidden rounded-2xl p-12
            ${
              isDark
                ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80"
                : "bg-gradient-to-br from-white/80 to-gray-50/80"
            }
            backdrop-blur-xl border ${
              isDark ? "border-gray-700/50" : "border-gray-200/50"
            }
            text-center
          `}
          >
            <FileText
              className={`w-20 h-20 mx-auto mb-4 ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <h3
              className={`text-xl font-semibold mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Chưa có khiếu nại
            </h3>
            <p className={`${isDark ? "text-gray-500" : "text-gray-600"}`}>
              {eligibleOrders.length > 0
                ? "Bạn chưa tạo khiếu nại nào. Nhấn nút 'Tạo Khiếu Nại Mới' để bắt đầu."
                : "Bạn chưa có đơn hàng nào đủ điều kiện để tạo khiếu nại."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {disputes.map((dispute, index) => (
              <div
                key={dispute.disputeId}
                className={`
                  group relative overflow-hidden rounded-2xl p-6
                  ${
                    isDark
                      ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80"
                      : "bg-gradient-to-br from-white/80 to-gray-50/80"
                  }
                  backdrop-blur-xl border ${
                    isDark ? "border-gray-700/50" : "border-gray-200/50"
                  }
                  hover:shadow-2xl hover:scale-[1.02]
                  transition-all duration-300
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Status and Date */}
                <div className="flex items-start justify-between mb-4">
                  <DisputeStatusTag status={dispute.status} isDark={isDark} />
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(dispute.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {/* Order Info */}
                <div className="mb-4">
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Đơn hàng #{dispute.order?.orderid || "N/A"}
                  </h3>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <p className="mb-1">
                      <span className="font-medium">Lý do:</span>{" "}
                      {reasonTypes.find((r) => r.value === dispute.reasonType)
                        ?.label || dispute.reasonType}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div
                  className={`
                  p-4 rounded-xl mb-4
                  ${isDark ? "bg-gray-900/50" : "bg-gray-100/50"}
                  border ${isDark ? "border-gray-700/50" : "border-gray-200/50"}
                `}
                >
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {dispute.description}
                  </p>
                </div>

                {/* Resolution (if exists) */}
                {dispute.resolution && (
                  <div
                    className={`
                    p-4 rounded-xl
                    ${
                      isDark
                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30"
                        : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50"
                    }
                    border
                  `}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle
                        className={`w-5 h-5 mt-0.5 ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          isDark ? "text-green-400" : "text-green-700"
                        }`}
                      >
                        Giải quyết:
                      </span>
                    </div>
                    <p
                      className={`text-sm ml-7 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {dispute.resolution}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dispute Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div
            className={`
            relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-8
            ${
              isDark
                ? "bg-gradient-to-br from-gray-800 to-gray-900"
                : "bg-gradient-to-br from-white to-gray-50"
            }
            border ${isDark ? "border-gray-700" : "border-gray-200"}
            shadow-2xl
            animate-scale-in
          `}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className={`
                absolute top-4 right-4 p-2 rounded-lg
                ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}
                transition-colors
              `}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <h2
              className={`text-2xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Tạo Khiếu Nại Mới
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Selection */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Chọn đơn hàng <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.orderId}
                  onChange={(e) =>
                    setForm({ ...form, orderId: e.target.value })
                  }
                  required
                  className={`
                    w-full px-4 py-3 rounded-xl
                    ${
                      isDark
                        ? "bg-gray-900/50 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }
                    border focus:outline-none focus:ring-2 focus:ring-orange-500
                    transition-all
                  `}
                >
                  <option value="">-- Chọn đơn hàng --</option>
                  {eligibleOrders.map((order) => (
                    <option key={order.orderid} value={order.orderid}>
                      Đơn hàng #{order.orderid} -{" "}
                      {order.totalcost?.toLocaleString("vi-VN")}₫
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason Type */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Lý do khiếu nại <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.reasonType}
                  onChange={(e) =>
                    setForm({ ...form, reasonType: e.target.value })
                  }
                  required
                  className={`
                    w-full px-4 py-3 rounded-xl
                    ${
                      isDark
                        ? "bg-gray-900/50 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }
                    border focus:outline-none focus:ring-2 focus:ring-orange-500
                    transition-all
                  `}
                >
                  <option value="">-- Chọn lý do --</option>
                  {reasonTypes.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                  rows={6}
                  placeholder="Vui lòng mô tả vấn đề của bạn một cách chi tiết..."
                  className={`
                    w-full px-4 py-3 rounded-xl resize-none
                    ${
                      isDark
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    }
                    border focus:outline-none focus:ring-2 focus:ring-orange-500
                    transition-all
                  `}
                />
              </div>

              {/* Warning */}
              <div
                className={`
                flex items-start gap-3 p-4 rounded-xl
                ${
                  isDark
                    ? "bg-yellow-500/20 border-yellow-500/30"
                    : "bg-yellow-50 border-yellow-200/50"
                }
                border
              `}
              >
                <AlertTriangle
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    isDark ? "text-yellow-400" : "text-yellow-600"
                  }`}
                />
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Khi tạo khiếu nại, tiền sẽ được giữ trong ví trung gian
                  (escrow) cho đến khi khiếu nại được giải quyết.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className={`
                    flex-1 px-6 py-3 rounded-xl font-semibold
                    ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all
                  `}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`
                    flex-1 px-6 py-3 rounded-xl font-semibold
                    bg-gradient-to-r from-orange-500 to-red-500 text-white
                    hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    transition-all duration-300
                  `}
                >
                  {submitting ? "Đang gửi..." : "Gửi Khiếu Nại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

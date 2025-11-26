import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  getAllDisputes,
  resolveDispute,
} from "../../../services/disputeService";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  X,
  FileText,
  User,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import AuroraText from "../../../components/common/AuroraText";

const DisputeStatusTag = ({ status, isDark }) => {
  const statusConfig = {
    OPEN: {
      label: "Đang mở",
      icon: AlertTriangle,
      bg: isDark ? "bg-orange-500/20" : "bg-orange-100",
      text: isDark ? "text-orange-400" : "text-orange-700",
      border: "border-orange-500/30",
    },
    IN_PROGRESS: {
      label: "Đang xử lý",
      icon: Clock,
      bg: isDark ? "bg-blue-500/20" : "bg-blue-100",
      text: isDark ? "text-blue-400" : "text-blue-700",
      border: "border-blue-500/30",
    },
    RESOLVED: {
      label: "Đã giải quyết",
      icon: CheckCircle,
      bg: isDark ? "bg-green-500/20" : "bg-green-100",
      text: isDark ? "text-green-400" : "text-green-700",
      border: "border-green-500/30",
    },
    CLOSED: {
      label: "Đã đóng",
      icon: CheckCircle,
      bg: isDark ? "bg-green-500/20" : "bg-green-100",
      text: isDark ? "text-green-400" : "text-green-700",
      border: "border-green-500/30",
    },
    CANCELLED: {
      label: "Đã hủy",
      icon: XCircle,
      bg: isDark ? "bg-red-500/20" : "bg-red-100",
      text: isDark ? "text-red-400" : "text-red-700",
      border: "border-red-500/30",
    },
  };

  const config = statusConfig[status] || statusConfig.OPEN;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} ${config.border}`}
    >
      <Icon className={`w-4 h-4 ${config.text}`} />
      <span className={`text-sm font-medium ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
};

export default function DisputeManagement() {
  const { isDark } = useTheme();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    resolution: "",
  });

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await getAllDisputes();

      if (res.status === "success") {
        const sortedDisputes = (res.disputes || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setDisputes(sortedDisputes || []);
      } else {
        toast.error(res.message || "Không thể tải danh sách tranh chấp!");
        setDisputes([]);
      }
    } catch (err) {
      if (err.message && err.message.includes("failed to lazily initialize")) {
        console.warn(
          "⚠️ Backend Error: Lazy loading issue in /api/manager/disputes endpoint. Backend needs to add @Transactional or @EntityGraph."
        );
        toast.error(
          "⚠️ Lỗi Backend: Không thể tải dữ liệu tranh chấp do lỗi lazy loading. Backend team cần thêm @Transactional vào endpoint này.",
          { duration: 5000 }
        );
      } else {
        console.error("Failed to fetch disputes:", err.message || err);
        toast.error(
          "Không thể tải danh sách tranh chấp. Vui lòng thử lại sau!"
        );
      }
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleView = (record) => {
    setSelectedDispute(record);
    setFormData({
      resolution: record.resolution || "",
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedDispute(null);
    setFormData({ resolution: "" });
  };

  const handleResolve = async (decision) => {
    if (!formData.resolution.trim()) {
      toast.error("Vui lòng nhập hướng xử lý!");
      return;
    }

    setSubmitting(true);
    try {
      const managerPayload = {
        decision,
        managerNote: formData.resolution,
      };

      const response = await resolveDispute(
        selectedDispute.disputeId,
        managerPayload
      );

      if (response && response.status === "success") {
        toast.success("Giải quyết tranh chấp thành công!");
        setIsModalOpen(false);
        fetchDisputes();
      } else {
        throw new Error(response.message || "Phản hồi không hợp lệ từ server");
      }
    } catch (error) {
      toast.error(`Giải quyết thất bại: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="mb-8">
        <AuroraText
          text="Quản lý Tranh chấp"
          className="text-3xl font-bold mb-2"
        />
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Xử lý các tranh chấp giữa người mua và người bán
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2
            className={`w-12 h-12 animate-spin ${
              isDark ? "text-blue-400" : "text-blue-500"
            }`}
          />
        </div>
      )}

      {!loading && disputes.length === 0 && (
        <div
          className={`rounded-2xl p-12 text-center ${
            isDark
              ? "bg-gray-800/50 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
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
            Không có tranh chấp
          </h3>
          <p className={isDark ? "text-gray-500" : "text-gray-600"}>
            Hiện tại chưa có tranh chấp nào cần xử lý
          </p>
        </div>
      )}

      {!loading && disputes.length > 0 && (
        <div className="grid gap-6">
          {disputes.map((dispute, index) => (
            <div
              key={dispute.disputeId}
              className={`rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] animate-fade-in ${
                isDark
                  ? "bg-gray-800/50 border border-gray-700 hover:bg-gray-800"
                  : "bg-white border border-gray-200 hover:shadow-xl"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      isDark ? "bg-orange-500/20" : "bg-orange-100"
                    }`}
                  >
                    <AlertTriangle
                      className={`w-6 h-6 ${
                        isDark ? "text-orange-400" : "text-orange-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Tranh chấp #{dispute.disputeId}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {new Date(dispute.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
                <DisputeStatusTag status={dispute.status} isDark={isDark} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div
                  className={`flex items-center gap-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-sm">
                    <strong>Đơn hàng:</strong> #{dispute.orderId}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">
                    <strong>Người mua:</strong> {dispute.buyerName || "N/A"}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">
                    <strong>Người bán:</strong> {dispute.sellerName || "N/A"}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl mb-4 ${
                  isDark ? "bg-gray-900/50" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-sm font-medium mb-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Lý do tranh chấp:
                </p>
                <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {dispute.description}
                </p>
              </div>

              <button
                onClick={() => handleView(dispute)}
                disabled={
                  dispute.status !== "OPEN" && dispute.status !== "IN_PROGRESS"
                }
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  dispute.status !== "OPEN" && dispute.status !== "IN_PROGRESS"
                    ? isDark
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105"
                }`}
              >
                {dispute.status !== "OPEN" && dispute.status !== "IN_PROGRESS"
                  ? "Đã xử lý"
                  : "Xử lý tranh chấp"}
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
          />

          <div
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 ${
              isDark
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            } shadow-2xl animate-scale-in`}
          >
            <button
              onClick={handleCancel}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <h2
              className={`text-2xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Giải quyết tranh chấp #{selectedDispute.disputeId}
            </h2>

            <div className="space-y-4 mb-6">
              <div
                className={`p-4 rounded-xl ${
                  isDark ? "bg-gray-900/50" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <strong>Đơn hàng:</strong> #{selectedDispute.orderId}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <strong>Lý do:</strong> {selectedDispute.description}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Phản hồi của Manager{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.resolution}
                  onChange={(e) =>
                    setFormData({ ...formData, resolution: e.target.value })
                  }
                  rows={4}
                  placeholder="Nhập cách giải quyết..."
                  className={`w-full px-4 py-3 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                    isDark
                      ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  } border`}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                disabled={submitting}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Hủy
              </button>
              <button
                onClick={() => handleResolve("REJECT_DISPUTE")}
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang xử lý..." : "Từ chối khiếu nại"}
              </button>
              <button
                onClick={() => handleResolve("APPROVE_REFUND")}
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? "Đang xử lý..." : "Chấp nhận hoàn tiền"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

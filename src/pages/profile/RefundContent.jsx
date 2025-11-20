import React, { useState, useEffect } from "react";
import {
  Spin,
  Empty,
  Alert,
  Tag,
  Button,
  Input,
  Modal,
} from "antd";
import api from "../../utils/api";
import { useTheme } from "../../contexts/ThemeContext";
import {
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";
import { toast } from "sonner";

const { TextArea } = Input;

const formatDate = (dateString) => {
  if (!dateString) return "Chưa có";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const OrderCard = ({ order, isDark, onRequestRefund }) => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canRefund = ["DA_DAT_COC", "DA_THANH_TOAN", "DANG_GIAO"].includes(order.status);
  const hasRequested = order.refundRequested;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do hoàn tiền");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        orderId: order.orderid,
        amount: order.totalfinal, // Hoàn toàn bộ
        reason: reason.trim(),
        note: note.trim(),
      };

      const response = await api.post("api/buyer/refund/request", payload);
      const { message: successMsg, refund } = response;

      onRequestRefund?.(order.orderid, refund);

      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-medium">{successMsg}</div>
          <div className="text-xs text-gray-500">
            Mã hoàn tiền: <strong>#{refund.refundid}</strong> • 
            Toàn bộ: <strong>{formatCurrency(refund.amount)}</strong>
          </div>
        </div>
      );

      setShowModal(false);
      setReason("");
      setNote("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={`border rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
              Đơn hàng #{order.orderid}
            </h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {order.products?.[0]?.productname || "Sản phẩm"}
            </p>
          </div>
          <div className="text-3xl text-blue-600">
            <Package />
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>Tổng tiền</span>
            <span className="font-bold text-lg text-green-600">
              {formatCurrency(order.totalfinal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>Ngày đặt</span>
            <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
              {formatDate(order.createdat)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>Trạng thái</span>
            <Tag
              color={
                order.status === "DA_DAT_COC"
                  ? "orange"
                  : order.status === "DA_THANH_TOAN"
                  ? "blue"
                  : order.status === "DANG_GIAO"
                  ? "processing"
                  : order.status === "HOAN_TAT"
                  ? "success"
                  : "default"
              }
            >
              {order.status === "DA_DAT_COC"
                ? "Đã đặt cọc"
                : order.status === "DA_THANH_TOAN"
                ? "Đã thanh toán"
                : order.status === "DANG_GIAO"
                ? "Đang giao"
                : order.status === "HOAN_TAT"
                ? "Hoàn tất"
                : order.status}
            </Tag>
          </div>

          {/* Hiển thị trạng thái hoàn tiền nếu có */}
          {hasRequested && order.refund && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
              <Clock className="w-4 h-4" />
              <div className="text-xs">
                <div className="font-medium">Đã gửi yêu cầu hoàn tiền</div>
                <div>
                  Mã: <strong>#{order.refund.refundid}</strong> •
                  {formatCurrency(order.refund.amount)} •
                  {formatDate(order.refund.createdat)}
                </div>
                <div className="mt-1">
                  <Tag color="warning" size="small">Đang chờ xử lý</Tag>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5">
          {canRefund && !hasRequested ? (
            <Button
              type="primary"
              danger
              size="small"
              onClick={() => setShowModal(true)}
              className="w-full"
            >
              Yêu cầu hoàn tiền
            </Button>
          ) : hasRequested ? (
            <Button
              disabled
              size="small"
              className="w-full flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              Đã yêu cầu
            </Button>
          ) : (
            <Button disabled size="small" className="w-full">
              Không thể hoàn tiền
            </Button>
          )}
        </div>
      </div>

      {/* Modal: CHỈ HIỆN LÝ DO, KHÔNG HIỆN TIỀN */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            <span className="font-semibold">Yêu cầu hoàn tiền - Đơn hàng #{order.orderid}</span>
          </div>
        }
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setReason("");
          setNote("");
        }}
        footer={null}
        width={500}
        centered
      >
        <div className="space-y-5 py-2">

          {/* LÝ DO - TỰ NHẬP */}
          <div>
            <label className={`block font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Lý do hoàn tiền <span className="text-red-500">*</span>
            </label>
            <TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mô tả chi tiết lý do bạn muốn hoàn tiền (xe lỗi, giao trễ, thay đổi ý định...)"
              rows={5}
              size="large"
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Càng chi tiết, càng dễ được duyệt
            </p>
          </div>

          {/* GHI CHÚ TÙY CHỌN */}
          <div>
            <label className={`block font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Ghi chú thêm (tùy chọn)
            </label>
            <TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Link ảnh, video, mô tả lỗi..."
              rows={2}
              size="large"
            />
          </div>

          {/* THÔNG BÁO */}
          <Alert
            message={
              <div className="flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <span>
                  Hoàn toàn bộ <strong>{formatCurrency(order.totalfinal)}</strong>. 
                  Quản lý sẽ duyệt trong <strong>24-48 giờ</strong>.
                </span>
              </div>
            }
            type="warning"
            showIcon={false}
            className="py-2"
          />

          {/* NÚT */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              onClick={() => {
                setShowModal(false);
                setReason("");
                setNote("");
              }}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleSubmit}
              loading={submitting}
              disabled={!reason.trim()}
              className="font-medium"
            >
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default function RefundContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("api/buyer/orders");
      const data = res.orders || res.data || [];

      const processed = data.map((order) => ({
        ...order,
        refundRequested:
          order.refundStatus === "REQUESTED" || order.refundStatus === "PROCESSING",
        refund: null,
      }));

      setOrders(processed);
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefundSuccess = (orderId, refundData) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderid === orderId
          ? { ...order, refundRequested: true, refund: refundData }
          : order
      )
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <p className={`mt-3 ${isDark ? "text-gray-200" : "text-gray-500"}`}>
          Đang tải danh sách đơn hàng...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert message="Lỗi tải dữ liệu" description={error} type="error" showIcon />
      </div>
    );
  }

  const refundableOrders = orders.filter((o) =>
    ["DA_DAT_COC", "DA_THANH_TOAN", "DANG_GIAO"].includes(o.status)
  );

  if (refundableOrders.length === 0) {
    return (
      <div className="py-8">
        <Alert
          message="Không có đơn hàng nào để hoàn tiền"
          description="Bạn chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã đặt cọc hoặc thanh toán."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className={`text-2xl font-semibold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>
        Yêu Cầu Hoàn Tiền
      </h2>

      <div
        className={`p-5 rounded-xl mb-8 ${
          isDark
            ? "bg-gray-700/50 border border-gray-600"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Chọn đơn hàng cần hoàn tiền và mô tả lý do. Quản lý sẽ xem xét trong vòng 24-48 giờ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {refundableOrders.map((order) => (
          <OrderCard
            key={order.orderid}
            order={order}
            isDark={isDark}
            onRequestRefund={handleRefundSuccess}
          />
        ))}
      </div>
    </div>
  );
}
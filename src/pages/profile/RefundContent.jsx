import React, { useState, useEffect } from "react";
import { Spin, Empty, Alert, Tag, Button, Input, Modal } from "antd";
import api from "../../utils/api";
import { useTheme } from "../../contexts/ThemeContext";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  User,
  Phone,
  Truck,
  Zap,
  Car,
} from "lucide-react";
import { toast } from "sonner";

const { TextArea } = Input;

const formatDate = (dateString) => {
  if (!dateString) return "Chưa có";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

const OrderRowCard = ({ order, isDark, onRequestRefund, productInfo }) => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canRefund = ["DA_DAT_COC", "DA_THANH_TOAN", "DANG_GIAO"].includes(order.status);
  const hasRequested = order.refundRequested;

  const product = productInfo?.product || {};
  const images = product.imgs?.map(img => img.url) || [];
  const productname = product.productname || "Xe điện";
  const model = product.model || "";
  const specs = product.specs || "";
  const brandInfo = product.brandcars || {};
  const seller = product.users || {};

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do hoàn tiền");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { orderId: order.orderid, amount: order.totalfinal, reason: reason.trim() };
      const response = await api.post("api/buyer/refund/request", payload);
      const { message: successMsg, refund } = response;

      onRequestRefund?.(order.orderid, refund);
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-medium">{successMsg || "Yêu cầu hoàn tiền thành công!"}</div>
          <div className="text-xs text-gray-500">
            Mã hoàn tiền: <strong>#{refund.refundid}</strong> • {formatCurrency(refund.amount)}
          </div>
        </div>
      );
      setShowModal(false);
      setReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi yêu cầu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* CARD NGANG */}
      <div
        className={`flex items-center gap-6 p-5 rounded-xl border shadow-sm hover:shadow-md transition-all ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        {/* Ảnh xe */}
        <div className="flex-shrink-0">
          {images[0] ? (
            <img
              src={images[0]}
              alt={productname}
              className="w-28 h-28 object-cover rounded-lg"
            />
          ) : (
            <div className="w-28 h-28 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Car className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {productname}
              </h3>
              {model && <p className="text-sm text-blue-600 font-medium">{model}</p>}
              {brandInfo.licensePlate && (
                <p className="text-xs text-gray-500">Biển số: {brandInfo.licensePlate}</p>
              )}
              {specs && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {specs}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Đơn hàng #{order.orderid}
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(order.totalfinal)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Đặt: {formatDate(order.createdat)}</span>
            </div>
            {/* {order.appointmentDate && (
              <div className="flex items-center gap-2 text-purple-600">
                <Truck className="w-4 h-4" />
                <span>Hẹn giao: {formatDate(order.appointmentDate)}</span>
              </div>
            )} */}
            {order.shippingaddress && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-xs">{order.shippingaddress}</span>
              </div>
            )}
          </div>

          {/* Người bán + Trạng thái */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {seller.displayname && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium">{seller.displayname}</span>
                  {seller.phone && <span className="text-xs text-gray-500">• {seller.phone}</span>}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Tag
                color={
                  order.status === "DA_DAT_COC" ? "orange" :
                  order.status === "DA_THANH_TOAN" ? "blue" :
                  order.status === "DANG_GIAO" ? "processing" :
                  order.status === "HOAN_TAT" ? "success" : "default"
                }
              >
                {order.status === "DA_DAT_COC" ? "Đã đặt cọc" :
                 order.status === "DA_THANH_TOAN" ? "Đã thanh toán" :
                 order.status === "DANG_GIAO" ? "Đang giao" :
                 order.status === "HOAN_TAT" ? "Hoàn tất" : order.status}
              </Tag>

              {/* Trạng thái hoàn tiền */}
              {hasRequested && order.refund && (
                <div className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                  <Clock className="w-4 h-4" />
                  Đã yêu cầu #{order.refund.refundid}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex-shrink-0 ml-4">
          {canRefund && !hasRequested ? (
            <Button
              type="primary"
              danger
              size="large"
              onClick={() => setShowModal(true)}
              className="font-semibold whitespace-nowrap"
            >
              Yêu cầu hoàn tiền
            </Button>
          ) : hasRequested ? (
            <Button disabled size="large" className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Đã yêu cầu
            </Button>
          ) : (
            <Button disabled size="large">
              Không thể hoàn
            </Button>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-red-500" />
            <div>
              <div className="font-bold text-lg">Yêu cầu hoàn tiền</div>
              <div className="text-sm text-gray-500">Đơn hàng #{order.orderid}</div>
            </div>
          </div>
        }
        open={showModal}
        onCancel={() => { setShowModal(false); setReason(""); }}
        footer={null}
        width={600}
        centered
      >
        <div className="space-y-5 py-4">
          <Alert
            type="info"
            showIcon
            message={
              <div className="space-y-3">
                <div className="font-bold text-lg">{productname}</div>
                {model && <div className="text-blue-600">Model: {model}</div>}
                {specs && <div className="text-xs text-gray-600">{specs}</div>}
                <div className="flex justify-between pt-3 border-t">
                  <span>Số tiền hoàn:</span>
                  <strong className="text-xl text-red-600">{formatCurrency(order.totalfinal)}</strong>
                </div>
              </div>
            }
          />

          <div>
            <label className="block font-medium mb-2">Lý do hoàn tiền <span className="text-red-500">*</span></label>
            <TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mô tả chi tiết lý do bạn muốn hoàn tiền..."
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button onClick={() => { setShowModal(false); setReason(""); }} disabled={submitting}>
              Hủy
            </Button>
            <Button
              type="primary"
              danger
              loading={submitting}
              disabled={!reason.trim()}
              onClick={handleSubmit}
            >
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default function RefundContent() {
  const [orders, setOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("api/buyer/orders");
      const data = (res.orders || res.data || []).filter(o =>
        ["DA_DAT_COC", "DA_THANH_TOAN", "DANG_GIAO"].includes(o.status)
      );

      const processed = data.map(o => ({
        ...o,
        refundRequested: o.refundStatus === "REQUESTED" || o.refundStatus === "PROCESSING",
      }));
      setOrders(processed);

      const productIds = [...new Set(
        processed.map(o => o.details?.[0]?.products?.productid).filter(Boolean)
      )];

      const responses = await Promise.all(
        productIds.map(id => api.get(`api/products/${id}`).catch(() => null))
      );

      const map = {};
      productIds.forEach((id, i) => {
        if (responses[i]?.product) map[id] = responses[i];
      });
      setProductsMap(map);
    } catch (err) {
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleRefundSuccess = (orderId, refundData) => {
    setOrders(prev => prev.map(o =>
      o.orderid === orderId ? { ...o, refundRequested: true, refund: refundData } : o
    ));
  };

  if (loading) return <div className="text-center py-20"><Spin size="large" /><p className="mt-4 text-gray-500">Đang tải...</p></div>;
  if (error) return <Alert message="Lỗi" description={error} type="error" className="m-4" />;
  if (orders.length === 0) return (
    <div className="text-center py-20">
      <Empty description="Không có đơn hàng nào có thể hoàn tiền" />
      <p className="mt-4 text-gray-500">Chỉ hiển thị đơn đã đặt cọc hoặc thanh toán</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-3">Yêu cầu hoàn tiền</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Chọn đơn hàng và gửi yêu cầu. Quản lý sẽ xử lý trong <strong>24-48 giờ</strong>.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const productId = order.details?.[0]?.products?.productid;
          const productResponse = productsMap[productId];

          return (
            <OrderRowCard
              key={order.orderid}
              order={order}
              productInfo={productResponse}
              isDark={isDark}
              onRequestRefund={handleRefundSuccess}
            />
          );
        })}
      </div>
    </div>
  );
}
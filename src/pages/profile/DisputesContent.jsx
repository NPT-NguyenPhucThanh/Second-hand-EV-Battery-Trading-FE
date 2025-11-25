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
  Car,
  Zap,
} from "lucide-react";
import AuroraText from "../../components/common/AuroraText";

// Status tag component - cập nhật theo backend
const DisputeStatusTag = ({ status, isDark }) => {
  const statusConfig = {
    OPEN: {
      label: "Đang chờ",
      icon: Clock,
      color: isDark ? "text-yellow-400" : "text-yellow-700",
      bg: isDark ? "bg-yellow-500/20" : "bg-yellow-100",
      border: isDark ? "border-yellow-500/30" : "border-yellow-300",
    },
    IN_PROGRESS: {
      label: "Đang xử lý",
      icon: AlertTriangle,
      color: isDark ? "text-blue-400" : "text-blue-700",
      bg: isDark ? "bg-blue-500/20" : "bg-blue-100",
      border: isDark ? "border-blue-500/30" : "border-blue-300",
    },
    RESOLVED: {
      label: "Đã giải quyết",
      icon: CheckCircle,
      color: isDark ? "text-green-400" : "text-green-700",
      bg: isDark ? "bg-green-500/20" : "bg-green-100",
      border: isDark ? "border-green-500/30" : "border-green-300",
    },
    REJECTED: {
      label: "Từ chối",
      icon: XCircle,
      color: isDark ? "text-red-400" : "text-red-700",
      bg: isDark ? "bg-red-500/20" : "bg-red-100",
      border: isDark ? "border-red-500/30" : "border-red-300",
    },
  };

  const config = statusConfig[status] || statusConfig.OPEN;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} border ${config.border}`}
    >
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-semibold ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

export default function DisputesContent() {
  const { isDark } = useTheme();
  const [disputes, setDisputes] = useState([]);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
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
    fetchEligibleOrdersAndProducts();
  }, []);

  const fetchDisputes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/buyer/disputes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDisputes(Array.isArray(data.disputes) ? data.disputes : []);
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
    }
  };

  const fetchEligibleOrdersAndProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const ordersRes = await fetch("http://localhost:8080/api/buyer/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!ordersRes.ok) throw new Error("Failed to fetch orders");
      const ordersData = await ordersRes.json();
      const allOrders = Array.isArray(ordersData.orders)
        ? ordersData.orders
        : [];

      const eligible = allOrders.filter((order) =>
        ["DA_THANH_TOAN", "DA_GIAO", "DA_HOAN_TAT"].includes(order.status)
      );
      setEligibleOrders(eligible);

      const productIds = [
        ...new Set(
          eligible
            .flatMap(
              (order) => order.details?.map((d) => d.products?.productid) || []
            )
            .filter(Boolean)
        ),
      ];

      const productPromises = productIds.map((id) =>
        fetch(`http://localhost:8080/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => (res.ok ? res.json() : null))
      );

      const productResponses = await Promise.all(productPromises);
      const map = {};
      productIds.forEach((id, i) => {
        const data = productResponses[i];
        if (data?.product) map[id] = data.product;
      });
      setProductsMap(map);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrder = eligibleOrders.find(
    (o) => o.orderid === parseInt(form.orderId)
  );
  const selectedProduct = selectedOrder?.details?.[0]?.products;
  const productInMap = selectedProduct?.productid
    ? productsMap[selectedProduct.productid]
    : null;

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
      } else {
        const error = await response.text();
        alert(`Lỗi: ${error}`);
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi tạo khiếu nại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-3xl animate-float [animation-delay:2s]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <AuroraText text="Quản Lý Khiếu Nại" className="text-4xl font-bold" />
          <button
            onClick={() => setShowModal(true)}
            disabled={eligibleOrders.length === 0}
            className="group relative px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo Khiếu Nại Mới</span>
          </button>
        </div>

        {/* Danh sách khiếu nại */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-500 rounded-full animate-spin [animation-delay:150ms]" />
            </div>
          </div>
        ) : disputes.length === 0 ? (
          <div
            className={`relative overflow-hidden rounded-2xl p-12 text-center ${
              isDark
                ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80"
                : "bg-gradient-to-br from-white/80 to-gray-50/80"
            } backdrop-blur-xl border ${
              isDark ? "border-gray-700/50" : "border-gray-200/50"
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
              Chưa có khiếu nại
            </h3>
            <p className={`${isDark ? "text-gray-500" : "text-gray-600"}`}>
              {eligibleOrders.length > 0
                ? "Nhấn nút để tạo khiếu nại đầu tiên"
                : "Bạn chưa có đơn hàng nào đủ điều kiện"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {disputes.map((dispute, index) => {
              const order = dispute.order || {};
              const detail = order.details?.[0] || {};
              const product = detail.products || {};
              const imgs = product.imgs || [];
              const brandcars = product.brandcars || {};

              return (
                <div
                  key={dispute.disputeid}
                  className={`relative overflow-hidden rounded-2xl border ${
                    isDark
                      ? "bg-gray-800/90 border-gray-700"
                      : "bg-white border-gray-200"
                  } shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Ảnh xe + Status tag dán góc */}
                      <div className="relative flex-shrink-0">
                        <div className="relative group/img">
                          {imgs[0]?.url ? (
                            <img
                              src={imgs[0].url}
                              alt={product.productname}
                              className="w-full lg:w-96 h-80 object-cover rounded-2xl shadow-2xl transition-transform duration-500 group-hover/img:scale-105"
                            />
                          ) : (
                            <div className="w-full lg:w-96 h-80 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-xl">
                              <Car className="w-32 h-32 text-gray-400" />
                            </div>
                          )}

                          {/* Status tag dán góc trên cùng bên phải */}
                          <div className="absolute top-4 right-4 z-10">
                            <DisputeStatusTag
                              status={dispute.status}
                              isDark={isDark}
                            />
                          </div>

                          {/* Overlay khi hover */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                        </div>
                      </div>

                      {/* Nội dung bên phải */}
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3
                              className={`text-3xl font-bold ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {product.productname || "Xe điện cân bằng"}
                            </h3>
                            {product.model && (
                              <p className="text-2xl font-bold text-blue-600 mt-1">
                                {product.model}
                              </p>
                            )}
                            {brandcars.licensePlate && (
                              <p className="text-lg text-gray-500 mt-2 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Biển số:{" "}
                                <span className="font-semibold text-orange-600">
                                  {brandcars.licensePlate}
                                </span>
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-4xl font-bold text-emerald-600">
                              {(
                                order.totalfinal ||
                                order.totalamount ||
                                0
                              ).toLocaleString("vi-VN")}
                              ₫
                            </p>
                            <p
                              className={`text-sm ${
                                isDark ? "text-gray-400" : "text-gray-600"
                              } mt-2`}
                            >
                              Đơn hàng #{order.orderid}
                            </p>
                          </div>
                        </div>

                        {/* Lý do khiếu nại - ĐƯA XUỐNG ĐÂY, thay vị trí cũ của status */}

                        {product.specs && (
                          <div
                            className={`inline-flex items-center gap-3 px-5 py-3 rounded-full ${
                              isDark ? "bg-gray-900/70" : "bg-gray-100"
                            } border ${
                              isDark ? "border-gray-700" : "border-gray-300"
                            }`}
                          >
                            <Zap className="w-6 h-6 text-yellow-500" />
                            <span
                              className={`font-medium ${
                                isDark ? "text-gray-200" : "text-gray-800"
                              }`}
                            >
                              {product.specs}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Lý do khiếu nại
                            </p>
                            <p
                              className={`font-semibold text-lg ${
                                isDark ? "text-orange-400" : "text-orange-600"
                              }`}
                            >
                              {reasonTypes.find(
                                (r) => r.value === dispute.reasonType
                              )?.label || dispute.reasonType}
                            </p>
                          </div>
                        </div>

                        {/* Ngày tạo khiếu nại */}

                        {/* Mô tả chi tiết */}
                        <div
                          className={`p-6 rounded-xl ${
                            isDark
                              ? "bg-gray-900/50 border border-gray-700"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <p
                            className={`text-base leading-relaxed ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {dispute.description || "Chưa có mô tả chi tiết."}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-500">Tạo ngày:</span>
                          <span
                            className={`font-medium ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {new Date(dispute.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                        {/* Kết quả giải quyết (nếu có) */}
                        {dispute.resolution && (
                          <div
                            className={`p-6 rounded-xl border-l-8 border-green-500 ${
                              isDark ? "bg-green-900/30" : "bg-green-50"
                            } shadow-lg`}
                          >
                            <div className="flex gap-4">
                              <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                              <div>
                                <p
                                  className={`text-xl font-bold ${
                                    isDark ? "text-green-400" : "text-green-700"
                                  }`}
                                >
                                  Đã được giải quyết
                                </p>
                                <p
                                  className={`mt-3 text-base leading-relaxed ${
                                    isDark ? "text-gray-300" : "text-gray-700"
                                  }`}
                                >
                                  {dispute.resolution}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal tạo khiếu nại - giữ nguyên */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 ${
              isDark
                ? "bg-gradient-to-br from-gray-800 to-gray-900"
                : "bg-gradient-to-br from-white to-gray-50"
            } border ${
              isDark ? "border-gray-700" : "border-gray-200"
            } shadow-2xl`}
          >
            <button
              onClick={() => setShowModal(false)}
              className={`absolute top-4 right-4 p-2 rounded-lg ${
                isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } transition-colors`}
            >
              <X className="w-6 h-6" />
            </button>

            <h2
              className={`text-3xl font-bold mb-8 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Tạo Khiếu Nại Mới
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-3 ${
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
                  className={`w-full px-5 py-4 rounded-xl text-lg font-medium border ${
                    isDark
                      ? "bg-gray-900/50 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                >
                  <option value="">-- Chọn đơn hàng để khiếu nại --</option>
                  {eligibleOrders.map((order) => {
                    const prod = order.details?.[0]?.products;
                    const productName = prod?.productname || "Xe điện";
                    const price = (
                      order.totalfinal ||
                      order.totalamount ||
                      0
                    ).toLocaleString("vi-VN");
                    return (
                      <option key={order.orderid} value={order.orderid}>
                        {productName} - {price}₫
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedOrder && selectedProduct && (
                <div
                  className={`p-6 rounded-xl border-2 ${
                    isDark
                      ? "bg-gray-900/70 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      {selectedProduct.imgs?.[0]?.url ? (
                        <img
                          src={selectedProduct.imgs[0].url}
                          alt={selectedProduct.productname}
                          className="w-40 h-40 object-cover rounded-xl shadow-xl"
                        />
                      ) : (
                        <div className="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                          <Car className="w-24 h-24 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-2xl font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedProduct.productname}
                      </h3>
                      {selectedProduct.model && (
                        <p className="text-xl text-blue-600 font-bold mt-1">
                          {selectedProduct.model}
                        </p>
                      )}
                      {selectedProduct.brandcars?.licensePlate && (
                        <p className="text-lg text-gray-500 mt-2">
                          Biển số: {selectedProduct.brandcars.licensePlate}
                        </p>
                      )}
                      {selectedProduct.specs && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          {selectedProduct.specs}
                        </p>
                      )}
                      <p className="text-3xl font-bold text-emerald-600 mt-6">
                        {(
                          selectedOrder.totalfinal ||
                          selectedOrder.totalamount ||
                          0
                        ).toLocaleString("vi-VN")}
                        ₫
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  className={`block text-sm font-medium mb-3 ${
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
                  className={`w-full px-5 py-4 rounded-xl text-lg border ${
                    isDark
                      ? "bg-gray-900/50 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                >
                  <option value="">-- Chọn lý do --</option>
                  {reasonTypes.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-3 ${
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
                  placeholder="Mô tả rõ vấn đề bạn gặp phải (càng chi tiết càng tốt)..."
                  className={`w-full px-5 py-4 rounded-xl resize-none border ${
                    isDark
                      ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                />
              </div>

              <div
                className={`flex items-start gap-4 p-5 rounded-xl ${
                  isDark
                    ? "bg-yellow-500/20 border-yellow-500/30"
                    : "bg-yellow-50 border-yellow-200"
                } border`}
              >
                <AlertTriangle
                  className={`w-6 h-6 mt-0.5 flex-shrink-0 ${
                    isDark ? "text-yellow-400" : "text-yellow-600"
                  }`}
                />
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Khi tạo khiếu nại, tiền sẽ được giữ trong ví trung gian
                  (escrow) cho đến khi được giải quyết.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className={`flex-1 px-8 py-4 rounded-xl text-lg font-bold ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  } disabled:opacity-50 transition-all`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-8 py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
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

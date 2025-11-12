import React, { useState, useEffect, useCallback } from "react";
import { getOrders, approveOrder, getOrdersByStatus } from "../../../services/orderService";
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'sonner';
import AuroraText from '../../../components/common/AuroraText';
import { ShoppingCart, User, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Loader2, Filter } from 'lucide-react';

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

export default function TransactionManagement() {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [note, setNote] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = useCallback(async (filterKey) => {
    setLoading(true);
    try {
      let response;
      if (filterKey === "ALL") {
        response = await getOrders();
      } else {
        response = await getOrdersByStatus(filterKey);
      }

      if (response && response.status === "success") {
        const fetchedOrders = response.orders || [];
        fetchedOrders.sort(
          (a, b) => new Date(b.createdat) - new Date(a.createdat)
        );
        setOrders(fetchedOrders);
      } else {
        toast.error(
          response.message || "Không thể tải danh sách giao dịch!"
        );
      }
    } catch (err) {
      toast.error("Lỗi khi tải danh sách giao dịch!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter, fetchOrders]);

  const handleProcess = async (isApproved) => {
    if (!selectedOrder) return;
    if (!isApproved && !note.trim()) {
      toast.error("Vui lòng nhập lý do từ chối!");
      return;
    }
    const payload = { approved: isApproved, note: note };

    try {
      const success = await approveOrder(selectedOrder.orderid, payload);
      if (success === "Order processed") {
        toast.success(`Đã ${isApproved ? "duyệt" : "từ chối"} giao dịch thành công!`);
        fetchOrders(statusFilter);
        setModalVisible(false);
        setNote("");
        setSelectedOrder(null);
      } else {
        throw new Error("Phản hồi từ server không hợp lệ.");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      CHO_DUYET: { color: "bg-orange-500/20 text-orange-400", label: "Chờ duyệt", icon: Clock },
      DA_DAT_COC: { color: "bg-blue-500/20 text-blue-400", label: "Đã đặt cọc", icon: DollarSign },
      DA_THANH_TOAN: { color: "bg-cyan-500/20 text-cyan-400", label: "Đã thanh toán", icon: CheckCircle },
      DA_HOAN_TAT: { color: "bg-green-500/20 text-green-400", label: "Đã hoàn tất", icon: CheckCircle },
      BI_TU_CHOI: { color: "bg-red-500/20 text-red-400", label: "Bị từ chối", icon: XCircle },
      TRANH_CHAP: { color: "bg-red-500/20 text-red-400", label: "Tranh chấp", icon: AlertTriangle },
      DA_HUY: { color: "bg-gray-500/20 text-gray-400", label: "Đã hủy", icon: XCircle },
    };
    return statusMap[status] || { color: "bg-gray-500/20 text-gray-400", label: status, icon: FileText };
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <Loader2 className={`w-12 h-12 animate-spin ${isDark ? "text-blue-400" : "text-blue-500"}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="mb-8">
        <AuroraText className="text-4xl font-bold mb-2">Quản Lý Giao Dịch</AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>Duyệt và theo dõi các đơn hàng</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className={isDark ? "text-gray-400" : "text-gray-500"} />
          <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Lọc theo trạng thái:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === option.value
                  ? isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500 text-white"
                  : isDark ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => {
          const statusBadge = getStatusBadge(order.status);
          const StatusIcon = statusBadge.icon;
          const canProcess = order.status === "CHO_DUYET" || order.status === "DA_DAT_COC";

          return (
            <div key={order.orderid} className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
                  <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>#{order.orderid}</span>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${statusBadge.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">{statusBadge.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <User className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{order.users?.username || "N/A"}</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <DollarSign className={`w-5 h-5 ${isDark ? "text-green-400" : "text-green-500"}`} />
                <span className={`text-xl font-bold ${isDark ? "text-green-400" : "text-green-500"}`}>{(order.totalfinal || 0).toLocaleString("vi-VN")} </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Clock className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{new Date(order.createdat).toLocaleString("vi-VN")}</span>
              </div>

              {canProcess && (
                <button onClick={() => { setSelectedOrder(order); setModalVisible(true); }} className={`w-full py-2 rounded-lg font-medium transition-all ${isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
                  Xử lý đơn hàng
                </button>
              )}
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>Không có đơn hàng nào</p>
        </div>
      )}

      {modalVisible && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} onClick={() => { setModalVisible(false); setNote(""); setSelectedOrder(null); }}>
          <div className={`rounded-2xl p-6 max-w-lg w-full ${isDark ? "bg-gray-800" : "bg-white"}`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Xử lý giao dịch #{selectedOrder.orderid}</h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <User className={isDark ? "text-gray-400" : "text-gray-500"} />
                <span className={isDark ? "text-gray-300" : "text-gray-700"}><strong>Người mua:</strong> {selectedOrder.users?.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className={isDark ? "text-green-400" : "text-green-500"} />
                <span className={isDark ? "text-gray-300" : "text-gray-700"}><strong>Tổng tiền:</strong> {selectedOrder.totalfinal?.toLocaleString("vi-VN")} </span>
              </div>
            </div>

            <p className={`mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Ghi chú (bắt buộc nếu từ chối):</p>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập lý do/ghi chú cho quyết định này..." className={`w-full p-3 rounded-lg border resize-none ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`} />

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModalVisible(false); setNote(""); setSelectedOrder(null); }} className={`flex-1 py-2 rounded-lg font-medium transition-all ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>Hủy</button>
              <button onClick={() => handleProcess(false)} className="flex-1 py-2 rounded-lg font-medium transition-all bg-red-500 text-white hover:bg-red-600">Từ chối</button>
              <button onClick={() => handleProcess(true)} className="flex-1 py-2 rounded-lg font-medium transition-all bg-blue-500 text-white hover:bg-blue-600">Duyệt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

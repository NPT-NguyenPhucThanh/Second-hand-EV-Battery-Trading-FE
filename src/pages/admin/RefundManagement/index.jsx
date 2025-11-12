import React, { useEffect, useState } from "react";
import { getAllRefund, getRefundPending, getRefund, processRefund } from "../../../services/refundService";
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'sonner';
import AuroraText from '../../../components/common/AuroraText';
import { DollarSign, CheckCircle, Clock, XCircle, AlertCircle, Loader2, FileText, User } from 'lucide-react';

export default function RefundManagement() {
  const { isDark } = useTheme();
  const [allRefunds, setAllRefunds] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchData = async () => {
    setLoading(true);
    try {
      const allRes = await getAllRefund();
      const pendingRes = await getRefundPending();
      setAllRefunds(allRes.refunds || []);
      setPendingRefunds(pendingRes.refunds || []);
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

  const handleViewDetails = async (refundId) => {
    try {
      const res = await getRefund(refundId);
      if (res.status === 'success') {
        setSelectedRefund(res.refund);
        setModalVisible(true);
      } else {
        toast.error(res.message || "Không tìm thấy chi tiết yêu cầu.");
      }
    } catch (error) {
      toast.error("Lỗi khi tải chi tiết yêu cầu hoàn tiền!");
    }
  };

  const handleProcess = async (approveAction) => {
    if (!selectedRefund) return;

    setProcessing(true);
    const payload = {
      approve: approveAction,
      refundMethod: "VNPay",
      note: approveAction ? "Chấp nhận hoàn tiền" : "Từ chối yêu cầu hoàn tiền",
    };

    try {
      const response = await processRefund(selectedRefund.refundid, payload);
      if (response.status === 'success') {
        toast.success(response.message);
      } else {
        throw new Error(response.message);
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Xử lý yêu cầu thất bại!");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { color: "bg-orange-500/20 text-orange-400", label: "Chờ xử lý", icon: Clock },
      COMPLETED: { color: "bg-green-500/20 text-green-400", label: "Đã hoàn thành", icon: CheckCircle },
      REJECTED: { color: "bg-red-500/20 text-red-400", label: "Đã từ chối", icon: XCircle },
    };
    return statusMap[status] || { color: "bg-gray-500/20 text-gray-400", label: status, icon: AlertCircle };
  };

  const currentRefunds = activeTab === 'pending' ? pendingRefunds : allRefunds;

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
        <AuroraText className="text-4xl font-bold mb-2">Quản Lý Hoàn Tiền</AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>Xử lý yêu cầu hoàn tiền từ khách hàng</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('pending')} className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'pending' ? (isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500 text-white") : (isDark ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100")}`}>
          Chờ xử lý ({pendingRefunds.length})
        </button>
        <button onClick={() => setActiveTab('all')} className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'all' ? (isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500 text-white") : (isDark ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100")}`}>
          Tất cả ({allRefunds.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentRefunds.map((refund) => {
          const statusBadge = getStatusBadge(refund.status);
          const StatusIcon = statusBadge.icon;

          return (
            <div key={refund.refundid} className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
                  <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>#{refund.refundid}</span>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${statusBadge.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">{statusBadge.label}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <User className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Đơn #{refund.orders?.orderid || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className={`w-5 h-5 ${isDark ? "text-green-400" : "text-green-500"}`} />
                  <span className={`text-xl font-bold ${isDark ? "text-green-400" : "text-green-500"}`}>{(refund.amount || 0).toLocaleString("vi-VN")} </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{new Date(refund.createdat).toLocaleString("vi-VN")}</span>
                </div>
              </div>

              <button onClick={() => handleViewDetails(refund.refundid)} className={`w-full py-2 rounded-lg font-medium transition-all ${isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
                Xem Chi Tiết
              </button>
            </div>
          );
        })}
      </div>

      {currentRefunds.length === 0 && (
        <div className="text-center py-12">
          <FileText className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>Không có yêu cầu hoàn tiền nào</p>
        </div>
      )}

      {modalVisible && selectedRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} onClick={() => setModalVisible(false)}>
          <div className={`rounded-2xl p-6 max-w-2xl w-full ${isDark ? "bg-gray-800" : "bg-white"}`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>Chi Tiết Yêu Cầu #{selectedRefund.refundid}</h3>

            <div className="space-y-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Mã Đơn Hàng</p>
                    <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>#{selectedRefund.orders?.orderid}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Số Tiền</p>
                    <p className={`font-bold ${isDark ? "text-green-400" : "text-green-500"}`}>{selectedRefund.amount?.toLocaleString("vi-VN")} </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Trạng Thái</p>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg ${getStatusBadge(selectedRefund.status).color}`}>
                      <span className="text-xs font-medium">{getStatusBadge(selectedRefund.status).label}</span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Ngày Yêu Cầu</p>
                    <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{new Date(selectedRefund.createdat).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mb-2`}>Lý do</p>
                <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>{selectedRefund.reason}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setModalVisible(false)} className={`flex-1 py-2 rounded-lg font-medium transition-all ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>Đóng</button>
              {selectedRefund.status === 'PENDING' && (
                <>
                  <button onClick={() => handleProcess(false)} disabled={processing} className="flex-1 py-2 rounded-lg font-medium transition-all bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">Từ chối</button>
                  <button onClick={() => handleProcess(true)} disabled={processing} className="flex-1 py-2 rounded-lg font-medium transition-all bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">Chấp nhận</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { getProductPendingApproval, getProductPendingInsspection, approveProduct, inputInspection } from "../../../services/productService";
import WarehouseDetailModal from "../WarehouseManagement/components/WarehouseDetailModal";
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'sonner';
import AuroraText from '../../../components/common/AuroraText';
import { Package, User, DollarSign, Calendar, CheckCircle, XCircle, Eye, Loader2, AlertCircle } from 'lucide-react';

export default function PostManagement() {
    const { isDark } = useTheme();
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [note, setNote] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeTab, setActiveTab] = useState("approval");
    const [approvalList, setApprovalList] = useState([]);
    const [inspectionList, setInspectionList] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const approvalRes = await getProductPendingApproval();
            const inspectionRes = await getProductPendingInsspection();
            setApprovalList(approvalRes.products || []);
            setInspectionList(inspectionRes.products || []);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách sản phẩm!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (productId, productName) => {
        const payload = { approved: true, note: "Approved" };
        try {
            let success = activeTab === 'approval' 
                ? await approveProduct(productId, payload) 
                : await inputInspection(productId, payload);
            if (success) {
                toast.success(`Đã duyệt "${productName}" thành công!`);
                fetchData();
            } else {
                throw new Error("Phản hồi từ server không hợp lệ.");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    const showRejectModal = (product) => {
        setSelectedProduct(product);
        setIsRejectModalVisible(true);
    };

    const handleRejectCancel = () => {
        setIsRejectModalVisible(false);
        setNote("");
        setSelectedProduct(null);
    };

    const handleRejectConfirm = async () => {
        if (!selectedProduct || !note.trim()) {
            toast.error("Vui lòng nhập lý do từ chối!");
            return;
        }
        const payload = { approved: false, note: note };
        try {
            let success = activeTab === 'approval' 
                ? await approveProduct(selectedProduct.productid, payload) 
                : await inputInspection(selectedProduct.productid, payload);
            if (success) {
                toast.success(`Đã từ chối sản phẩm thành công!`);
                fetchData();
                handleRejectCancel();
            } else {
                throw new Error("Phản hồi từ server không hợp lệ.");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    const showDetailModal = (product) => {
        setSelectedProduct(product);
        setIsDetailModalVisible(true);
    };

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
        setSelectedProduct(null);
    };

    const currentList = activeTab === 'approval' ? approvalList : inspectionList;

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
                <AuroraText className="text-4xl font-bold mb-2">Quản Lý Bài Đăng</AuroraText>
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>Duyệt sản phẩm từ người bán</p>
            </div>

            <div className="flex gap-2 mb-6">
                <button onClick={() => setActiveTab('approval')} className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'approval' ? (isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500 text-white") : (isDark ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100")}`}>
                    Chờ duyệt sơ bộ ({approvalList.length})
                </button>
                <button onClick={() => setActiveTab('inspection')} className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'inspection' ? (isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500 text-white") : (isDark ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100")}`}>
                    Chờ kiểm định ({inspectionList.length})
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentList.map((product) => (
                    <div key={product.productid} className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Package className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
                                <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>#{product.productid}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-lg ${activeTab === 'approval' ? 'bg-orange-500/20 text-orange-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                <span className="text-xs font-medium">{activeTab === 'approval' ? 'Sơ bộ' : 'Kiểm định'}</span>
                            </div>
                        </div>

                        <h3 className={`text-lg font-bold mb-3 line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>{product.productname}</h3>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                                <User className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{product.users?.username || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className={`w-5 h-5 ${isDark ? "text-green-400" : "text-green-500"}`} />
                                <span className={`text-xl font-bold ${isDark ? "text-green-400" : "text-green-500"}`}>{(product.cost || 0).toLocaleString("vi-VN")} </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                                <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{new Date(product.createdat).toLocaleDateString("vi-VN")}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => showDetailModal(product)} className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                <Eye className="w-4 h-4" />
                                Chi tiết
                            </button>
                            <button onClick={() => handleApprove(product.productid, product.productname)} className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
                                <CheckCircle className="w-4 h-4" />
                                Duyệt
                            </button>
                            <button onClick={() => showRejectModal(product)} className="flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600">
                                <XCircle className="w-4 h-4" />
                                Từ chối
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {currentList.length === 0 && (
                <div className="text-center py-12">
                    <Package className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                    <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>Không có sản phẩm nào</p>
                </div>
            )}

            {isRejectModalVisible && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} onClick={handleRejectCancel}>
                    <div className={`rounded-2xl p-6 max-w-lg w-full ${isDark ? "bg-gray-800" : "bg-white"}`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Từ chối sản phẩm</h3>
                        </div>

                        <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}><strong>Sản phẩm:</strong> {selectedProduct.productname}</p>
                        
                        <p className={`mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Vui lòng nhập lý do từ chối:</p>
                        <textarea rows={3} placeholder="Ví dụ: Thông tin không chính xác..." value={note} onChange={(e) => setNote(e.target.value)} className={`w-full p-3 rounded-lg border resize-none ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`} />

                        <div className="flex gap-3 mt-6">
                            <button onClick={handleRejectCancel} className={`flex-1 py-2 rounded-lg font-medium transition-all ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>Hủy</button>
                            <button onClick={handleRejectConfirm} className="flex-1 py-2 rounded-lg font-medium transition-all bg-red-500 text-white hover:bg-red-600">Xác nhận từ chối</button>
                        </div>
                    </div>
                </div>
            )}

            <WarehouseDetailModal open={isDetailModalVisible} onClose={handleDetailCancel} product={selectedProduct} />
        </div>
    );
}

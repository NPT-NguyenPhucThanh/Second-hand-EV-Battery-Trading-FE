import React, { useState, useEffect, useCallback } from "react";
import { getAllActiveUserPackages, getActiveUserPackagesByType } from "../../../services/userPackageService";
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'sonner';
import AuroraText from '../../../components/common/AuroraText';
import { User, Package2, Calendar, Battery, Car, Loader2, Clock } from 'lucide-react';

export default function UserPackageManagement() {
  const { isDark } = useTheme();
  const [userPackages, setUserPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");

  const fetchData = useCallback(async (tabKey) => {
    setLoading(true);
    try {
      let response;
      if (tabKey === "ALL") {
        response = await getAllActiveUserPackages();
      } else {
        response = await getActiveUserPackagesByType(tabKey);
      }

      if (response && response.status === "success") {
        setUserPackages(response.userPackages || []);
      } else {
        toast.error(response.message || "Không thể tải dữ liệu gói.");
      }
    } catch (error) {
      toast.error("Lỗi kết nối: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

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
        <AuroraText className="text-4xl font-bold mb-2">Quản Lý Gói Người Dùng</AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>Theo dõi gói dịch vụ đang sử dụng</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('ALL')} className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'ALL' ? (isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500 text-white") : (isDark ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100")}`}>
          Tất cả ({activeTab === 'ALL' ? userPackages.length : ''})
        </button>
        <button onClick={() => setActiveTab('CAR')} className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'CAR' ? (isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500 text-white") : (isDark ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100")}`}>
          <Car className="w-5 h-5" />
          Gói CAR ({activeTab === 'CAR' ? userPackages.length : ''})
        </button>
        <button onClick={() => setActiveTab('BATTERY')} className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'BATTERY' ? (isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500 text-white") : (isDark ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100")}`}>
          <Battery className="w-5 h-5" />
          Gói BATTERY ({activeTab === 'BATTERY' ? userPackages.length : ''})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {userPackages.map((up) => {
          const isExpired = new Date(up.expiryDate) < new Date();
          const daysRemaining = Math.ceil((new Date(up.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

          return (
            <div key={up.userPackageId} className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
                  <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>#{up.userId}</span>
                </div>
                <div className={`px-3 py-1 rounded-lg ${up.packageType === 'CAR' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                  <span className="text-xs font-medium flex items-center gap-1">
                    {up.packageType === 'CAR' ? <Car className="w-3 h-3" /> : <Battery className="w-3 h-3" />}
                    {up.packageType}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tên đăng nhập</p>
                  <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{up.username}</p>
                </div>
                {up.displayName && (
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tên hiển thị</p>
                    <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>{up.displayName}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Package2 className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{up.packageName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Mua: {new Date(up.purchaseDate).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isExpired ? 'text-red-400' : 'text-green-400'}`} />
                  <span className={`text-sm font-medium ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                    {isExpired ? 'Đã hết hạn' : `Còn ${daysRemaining} ngày`}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}>
                <div className="grid grid-cols-2 gap-3 text-center">
                  {up.packageType === 'CAR' && (
                    <>
                      <div>
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Xe còn lại</p>
                        <p className={`text-lg font-bold ${isDark ? "text-blue-400" : "text-blue-500"}`}>{up.remainingCars || 0}</p>
                      </div>
                    </>
                  )}
                  {up.packageType === 'BATTERY' && (
                    <>
                      <div>
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Pin còn lại</p>
                        <p className={`text-lg font-bold ${isDark ? "text-green-400" : "text-green-500"}`}>{up.remainingBatteries || 0}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Hết hạn</p>
                    <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{up.expiryDate ? new Date(up.expiryDate).toLocaleDateString("vi-VN") : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {userPackages.length === 0 && (
        <div className="text-center py-12">
          <Package2 className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>Không có gói nào đang hoạt động</p>
        </div>
      )}
    </div>
  );
}

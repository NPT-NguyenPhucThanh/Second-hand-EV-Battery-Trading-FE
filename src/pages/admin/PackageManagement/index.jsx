import React, { useState, useEffect, useMemo } from "react";
import PackageModal from "./components/PackageModal";
import { usePackages } from "../../../services/packageService";
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'sonner';
import AuroraText from '../../../components/common/AuroraText';
import { Package2, DollarSign, Car, Battery, Edit, Trash2, Plus, Loader2, Clock } from 'lucide-react';

export default function PackageManagement() {
  const { isDark } = useTheme();
  const { packages, loading, fetchPackages, addPackage, updatePackage, deletePackage } = usePackages();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [currentPkgTypeTab, setCurrentPkgTypeTab] = useState("BATTERY");

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const { batteryPackages, carPackages } = useMemo(() => {
    return {
      batteryPackages: packages.filter((p) => p.packageType?.toUpperCase() === "BATTERY"),
      carPackages: packages.filter((p) => p.packageType?.toUpperCase() === "CAR"),
    };
  }, [packages]);

  const handleShowCreateModal = () => {
    setEditingPackage(null);
    setIsModalVisible(true);
  };

  const handleShowEditModal = (pkg) => {
    setEditingPackage(pkg);
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingPackage(null);
  };

  const handleSavePackage = async (pkg) => {
    const action = pkg.packageid ? 'cập nhật' : 'tạo';
    try {
      if (pkg.packageid) {
        await updatePackage(pkg.packageid, pkg);
        toast.success(`Đã cập nhật gói ${pkg.name} thành công!`);
      } else {
        await addPackage({ ...pkg, packageType: currentPkgTypeTab });
        toast.success(`Đã tạo gói ${pkg.name} thành công!`);
      }
      await fetchPackages();

      handleCancelModal(); 
    } catch (error) {
      console.error(`Lỗi ${action} gói:`, error);
      toast.error(error.message || `Lỗi khi ${action} gói!`);
    }
  };

  const handleDelete = async (packageid, packagename) => {
    if (window.confirm(`Xác nhận xóa gói "${packagename}"?`)) {
      try {
        await deletePackage(packageid);
        toast.success("Đã xóa gói thành công!");
      } catch (error) {
        toast.error("Lỗi khi xóa gói!");
      }
    }
  };

  const currentPackages = currentPkgTypeTab === "BATTERY" ? batteryPackages : carPackages;

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
        <AuroraText className="text-4xl font-bold mb-2">Quản Lý Gói Dịch Vụ</AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>Cấu hình gói dịch vụ cho người dùng</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button onClick={() => setCurrentPkgTypeTab('BATTERY')} className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${currentPkgTypeTab === 'BATTERY' ? (isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500 text-white") : (isDark ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100")}`}>
            <Battery className="w-5 h-5" />
            Gói cho Pin ({batteryPackages.length})
          </button>
          <button onClick={() => setCurrentPkgTypeTab('CAR')} className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${currentPkgTypeTab === 'CAR' ? (isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500 text-white") : (isDark ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100")}`}>
            <Car className="w-5 h-5" />
            Gói cho Xe ({carPackages.length})
          </button>
        </div>
        <button onClick={handleShowCreateModal} className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
          <Plus className="w-5 h-5" />
          Tạo Gói Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentPackages.map((pkg) => (
          <div key={pkg.packageid} className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${isDark ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700" : "bg-white shadow-lg"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${currentPkgTypeTab === 'BATTERY' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                {currentPkgTypeTab === 'BATTERY' ? <Battery className={`w-6 h-6 ${isDark ? "text-green-400" : "text-green-500"}`} /> : <Car className={`w-6 h-6 ${isDark ? "text-blue-400" : "text-blue-500"}`} />}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleShowEditModal(pkg)} className={`p-2 rounded-lg transition-all ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(pkg.packageid, pkg.packagename)} className="p-2 rounded-lg transition-all bg-red-500/20 text-red-400 hover:bg-red-500/30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{pkg.name}</h3>
            
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className={`w-6 h-6 ${isDark ? "text-green-400" : "text-green-500"}`} />
              <span className={`text-2xl font-bold ${isDark ? "text-green-400" : "text-green-500"}`}>{(pkg.price || 0).toLocaleString("vi-VN")} </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Thời hạn: {pkg.durationMonths} tháng</span>
              </div>
              {currentPkgTypeTab === 'BATTERY' && (
                <div className="flex items-center gap-2">
                  <Battery className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Số pin: {pkg.maxBatteries || 0}</span>
                </div>
              )}
              {currentPkgTypeTab === 'CAR' && (
                <div className="flex items-center gap-2">
                  <Car className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Số xe: {pkg.maxCars || 0}</span>
                </div>
              )}
            </div>

            {pkg.description && (
              <p className={`text-sm line-clamp-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{pkg.description}</p>
            )}
          </div>
        ))}
      </div>

      {currentPackages.length === 0 && (
        <div className="text-center py-12">
          <Package2 className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>Chưa có gói dịch vụ nào</p>
        </div>
      )}

      <PackageModal open={isModalVisible} onSave={handleSavePackage} onCancel={handleCancelModal} editingPackage={editingPackage} packageType={currentPkgTypeTab} />
    </div>
  );
}

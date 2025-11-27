import React, { useState, useEffect } from "react";
import { Spin, Empty, Alert, Tag, Button } from "antd";
import { getCurrentPackages } from "../../services/sellerPackageService";
import { useTheme } from "../../contexts/ThemeContext";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const PackageCard = ({
  title,
  type,
  icon,
  remaining,
  purchaseDate,
  expiryDate,
  isExpired,
  isDark,
}) => {
  const status = isExpired
    ? { text: "Hết hạn", color: "error" }
    : remaining > 0
    ? { text: "Còn hiệu lực", color: "success" }
    : { text: "Hết lượt", color: "warning" };

  return (
    <div
      className={`border rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm ${isDark ? "text-gray-200" : "text-gray-500"}`}
          >
            Gói {type}
          </p>
        </div>
        <div className="text-3xl text-blue-600">
          <i className={icon}></i>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className={isDark ? "text-gray-200" : "text-gray-600"}>
            Số lượng còn lại
          </span>
          <span className="text-2xl font-bold text-blue-600">{remaining}</span>
        </div>

        <div className="flex justify-between">
          <span className={isDark ? "text-gray-200" : "text-gray-600"}>
            Ngày mua
          </span>
          <span
            className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {formatDate(purchaseDate)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className={isDark ? "text-gray-200" : "text-gray-600"}>
            Hết hạn
          </span>
          <span
            className={`font-medium ${
              isExpired
                ? "text-red-600"
                : isDark
                ? "text-white"
                : "text-gray-900"
            }`}
          >
            {formatDate(expiryDate)}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <Tag color={status.color} className="text-xs font-medium">
          {status.text}
        </Tag>
      </div>

      
    </div>
  );
};

export default function CurrentPackageContent() {
  const [packages, setPackages] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const res = await getCurrentPackages();
        if (res.status === "success") {
          setPackages({
            battery: res.batteryPackage || null,
            car: res.carPackage || null,
          });
        } else {
          throw new Error(res.message || "Không thể tải gói dịch vụ");
        }
      } catch (err) {
        console.error("Lỗi khi lấy gói dịch vụ:", err);
        setPackages(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <p className={`mt-3 ${isDark ? "text-gray-200" : "text-gray-500"}`}>
          Đang tải thông tin gói dịch vụ...
        </p>
      </div>
    );
  }

  const hasAnyPackage = packages && (packages.battery || packages.car);

  if (!hasAnyPackage) {
    return (
      <div className="py-8">
        <Alert
          message="Chưa có gói dịch vụ"
          description="Bạn chưa kích hoạt gói nào. Vui lòng mua gói để đăng bán sản phẩm."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <h2
        className={`text-2xl font-semibold mb-6 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        Dịch Vụ Hiện Tại
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gói Pin */}
        {packages.battery && (
          <PackageCard
            title={packages.battery.packageName}
            type="Pin"
            icon="fa-solid fa-battery-full"
            remaining={packages.battery.remainingBatteries}
            purchaseDate={packages.battery.purchaseDate}
            expiryDate={packages.battery.expiryDate}
            isExpired={packages.battery.isExpired}
            isDark={isDark}
          />
        )}

        {/* Gói Xe */}
        {packages.car && (
          <PackageCard
            title={packages.car.packageName}
            type="Xe"
            icon="fa-solid fa-car"
            remaining={packages.car.remainingCars}
            purchaseDate={packages.car.purchaseDate}
            expiryDate={packages.car.expiryDate}
            isExpired={packages.car.isExpired}
            isDark={isDark}
          />
        )}
      </div>

      {!packages.battery && !packages.car && (
        <Empty description="Không có gói nào đang hoạt động" />
      )}
    </div>
  );
}

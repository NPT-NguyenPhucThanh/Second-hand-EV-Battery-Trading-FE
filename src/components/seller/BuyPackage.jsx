// src/components/seller/BuyPackage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Spin, Alert, Empty } from "antd";
import { usePackages } from "../../services/packageService";

const PackageCard = ({ pkg }) => {
  const isCar = pkg.packageType === "CAR";
  const limit = isCar
    ? (pkg.maxCars >= 999 ? "Không giới hạn" : `${pkg.maxCars} xe`)
    : (pkg.maxBatteries >= 999 ? "Không giới hạn" : `${pkg.maxBatteries} pin`);

  return (
    <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-blue-500">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
      <p className="text-3xl font-bold text-blue-600">{Number(pkg.price).toLocaleString("vi-VN")}đ</p>
      <p className="text-sm text-gray-500 mb-4">/ {pkg.durationMonths} tháng</p>

      <div className="text-sm text-gray-700 space-y-1">
        <p className="font-semibold">{limit}</p>
      </div>

      <Link
        to={`/seller/packages/${pkg.packageid}`}
        className="mt-6 block text-center py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
      >
        Mua ngay
      </Link>
    </div>
  );
};

export default function BuyPackage() {
  const { getPublicPackages } = usePackages();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("CAR");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicPackages();
        setPackages(data);
      } catch (e) {
        setError("Không tải được gói. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getPublicPackages]);

  const cars = packages.filter(p => p.packageType === "CAR");
  const batteries = packages.filter(p => p.packageType === "BATTERY");

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Chọn Gói Đăng Bán</h1>

        <div className="flex justify-center gap-2 mb-12">
          <button
            onClick={() => setTab("CAR")}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${tab === "CAR" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Xe điện
          </button>
          <button
            onClick={() => setTab("BATTERY")}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${tab === "BATTERY" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Pin
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert message="Lỗi" description={error} type="error" showIcon className="max-w-2xl mx-auto" />
        ) : (tab === "CAR" ? cars : batteries).length === 0 ? (
          <Empty description="Chưa có gói nào" className="py-16" />
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {(tab === "CAR" ? cars : batteries).map(p => (
              <PackageCard key={p.packageid} pkg={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
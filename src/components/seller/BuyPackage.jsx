import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader,
  AlertCircle,
  CheckCircle,
  Zap,
  Car,
  Battery,
  Clock,
} from "lucide-react";
import { usePackages } from "../../services/packageService";
import { useTheme } from "../../contexts/ThemeContext";
import AuroraText from "../common/AuroraText";

const THEME_COLORS = {
  dark: {
    primary: ["#ef4444", "#f97316"],
    aurora: ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"],
    border: "rgba(239, 68, 68, 0.2)",
  },
  light: {
    primary: ["#3b82f6", "#8b5cf6"],
    aurora: ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#3b82f6"],
    border: "rgba(59, 130, 246, 0.3)",
  },
};

const PackageCard = ({ pkg, isDark, colors }) => {
  const isCar = pkg.packageType === "CAR";
  const limit = isCar
    ? pkg.maxCars >= 999
      ? "Không giới hạn"
      : `${pkg.maxCars} xe`
    : pkg.maxBatteries >= 999
    ? "Không giới hạn"
    : `${pkg.maxBatteries} pin`;

  return (
    <div
      className="group rounded-3xl p-8 transition-all duration-300 hover:scale-105"
      style={{
        background: isDark
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        border: `2px solid ${colors.border}`,
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Icon */}
      <div
        key={`icon-${pkg.packageid}-${isDark}`}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
        }}
      >
        {isCar ? (
          <Car className="w-8 h-8 text-white" />
        ) : (
          <Battery className="w-8 h-8 text-white" />
        )}
      </div>

      {/* Name */}
      <h3
        className={`text-2xl font-bold mb-2 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {pkg.name}
      </h3>

      {/* Price */}
      <div
        key={`price-${pkg.packageid}-${isDark}`}
        className="text-4xl font-black mb-2"
        style={{
          background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {Number(pkg.price).toLocaleString("vi-VN")}đ
      </div>

      {/* Duration */}
      <div
        className={`flex items-center gap-2 mb-6 ${
          isDark ? "text-gray-200" : "text-gray-600"
        }`}
      >
        <Clock className="w-4 h-4" />
        <span>{pkg.durationMonths} tháng</span>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-8">
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.03)",
          }}
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span className={isDark ? "text-gray-300" : "text-gray-700"}>
            {limit}
          </span>
        </div>
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.03)",
          }}
        >
          <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <span className={isDark ? "text-gray-300" : "text-gray-700"}>
            Hỗ trợ 24/7
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <Link
        key={`cta-${pkg.packageid}-${isDark}`}
        to={`/seller/packages/${pkg.packageid}`}
        className="block text-center py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
          boxShadow: isDark
            ? "0 10px 40px rgba(239, 68, 68, 0.3)"
            : "0 10px 40px rgba(59, 130, 246, 0.3)",
        }}
      >
        Mua ngay
      </Link>
    </div>
  );
};

export default function BuyPackage() {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

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
      } catch {
        setError("Không tải được gói. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getPublicPackages]);

  const cars = packages.filter((p) => p.packageType === "CAR");
  const batteries = packages.filter((p) => p.packageType === "BATTERY");
  const filteredPackages = tab === "CAR" ? cars : batteries;

  // 🎨 LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-6 relative overflow-hidden">
        {/* Floating Orbs Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${colors.primary[0]}, transparent)`,
            }}
          />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${colors.primary[1]}, transparent)`,
              animationDelay: "1s",
            }}
          />
        </div>

        {/* Loading Content */}
        <div className="max-w-4xl mx-auto relative z-10">
          <div
            className="rounded-3xl p-16 text-center"
            style={{
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              border: `2px solid ${colors.border}`,
            }}
          >
            <Loader
              className="w-12 h-12 mx-auto mb-4 animate-spin"
              style={{ color: colors.primary[0] }}
            />
            <p
              className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Đang tải gói đăng bán...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🎨 ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-6 relative overflow-hidden">
        {/* Floating Orbs Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{
              background: `radial-gradient(circle, ${colors.primary[0]}, transparent)`,
            }}
          />
        </div>

        {/* Error Content */}
        <div className="max-w-4xl mx-auto relative z-10">
          <div
            className="rounded-3xl p-16 text-center"
            style={{
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-red-500 mb-2">Có lỗi xảy ra</p>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🎨 MAIN CONTENT
  return (
    <div className="min-h-screen pt-20 pb-20 px-6 relative overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${colors.primary[0]}, transparent)`,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${colors.primary[1]}, transparent)`,
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${colors.primary[0]}, transparent)`,
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <AuroraText
            key={`header-${isDark}`}
            text="Chọn Gói Đăng Bán"
            colors={colors.aurora}
            className="text-5xl font-black mb-4"
          />
          <p
            className={`text-xl ${isDark ? "text-gray-200" : "text-gray-600"}`}
          >
            Chọn gói phù hợp để bắt đầu đăng bán sản phẩm của bạn
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            key={`tab-car-${isDark}`}
            onClick={() => setTab("CAR")}
            className="group px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105"
            style={{
              background:
                tab === "CAR"
                  ? `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`
                  : isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              border: `2px solid ${
                tab === "CAR" ? "transparent" : colors.border
              }`,
              color: tab === "CAR" ? "#fff" : isDark ? "#fff" : "#000",
              boxShadow:
                tab === "CAR"
                  ? isDark
                    ? "0 10px 40px rgba(239, 68, 68, 0.3)"
                    : "0 10px 40px rgba(59, 130, 246, 0.3)"
                  : "none",
            }}
          >
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              <span>Gói Xe</span>
            </div>
          </button>

          <button
            key={`tab-battery-${isDark}`}
            onClick={() => setTab("BATTERY")}
            className="group px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105"
            style={{
              background:
                tab === "BATTERY"
                  ? `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`
                  : isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              border: `2px solid ${
                tab === "BATTERY" ? "transparent" : colors.border
              }`,
              color: tab === "BATTERY" ? "#fff" : isDark ? "#fff" : "#000",
              boxShadow:
                tab === "BATTERY"
                  ? isDark
                    ? "0 10px 40px rgba(239, 68, 68, 0.3)"
                    : "0 10px 40px rgba(59, 130, 246, 0.3)"
                  : "none",
            }}
          >
            <div className="flex items-center gap-2">
              <Battery className="w-5 h-5" />
              <span>Gói Pin</span>
            </div>
          </button>
        </div>

        {/* Package Cards Grid */}
        {filteredPackages.length === 0 ? (
          <div
            className="rounded-3xl p-16 text-center"
            style={{
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              border: `2px solid ${colors.border}`,
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.05)",
              }}
            >
              {tab === "CAR" ? (
                <Car
                  className={`w-10 h-10 ${
                    isDark ? "text-gray-600" : "text-gray-400"
                  }`}
                />
              ) : (
                <Battery
                  className={`w-10 h-10 ${
                    isDark ? "text-gray-600" : "text-gray-400"
                  }`}
                />
              )}
            </div>
            <p
              className={`text-xl ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Không có gói nào
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.packageid}
                pkg={pkg}
                isDark={isDark}
                colors={colors}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

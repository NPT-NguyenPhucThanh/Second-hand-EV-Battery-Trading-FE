import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Loader,
  AlertCircle,
  CheckCircle,
  Car,
  Battery,
  Clock,
  DollarSign,
  Zap,
  ArrowLeft,
  Shield,
  TrendingUp,
  Star,
} from "lucide-react";
import { usePackages } from "../../services/packageService";
import { toast } from "sonner";
import api from "../../utils/api";
import { createPaymentUrl } from "../../utils/services/paymentService";
import { useTheme } from "../../contexts/ThemeContext";
import AuroraText from "../common/AuroraText";

// 🎨 COLOR SYSTEM
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

export default function PackageDetail() {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const { packageid } = useParams();
  const { getPackageById } = usePackages();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPackageById(packageid);
        setPkg(data);
      } catch {
        setError("Không thể tải thông tin gói");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [packageid, getPackageById]);

  const handlePurchase = async () => {
    if (!pkg) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Đang tạo đơn hàng, vui lòng chờ...");

    try {
      const orderResponse = await api.post("api/seller/packages/purchase", {
        packageId: pkg.packageid,
      });

      if (orderResponse.status !== "success") {
        throw new Error(orderResponse.message || "Không thể tạo đơn hàng");
      }

      const orderId = orderResponse.orderId;
      if (!orderId) {
        throw new Error("Không nhận được Order ID từ máy chủ.");
      }

      toast.loading("Đang tạo link thanh toán...", { id: loadingToast });

      const paymentResponse = await createPaymentUrl(
        orderId,
        "PACKAGE_PURCHASE"
      );

      if (paymentResponse.status !== "success") {
        throw new Error(
          paymentResponse.message || "Không thể tạo link thanh toán"
        );
      }

      const { paymentUrl, transactionCode } = paymentResponse;

      localStorage.setItem("pendingTransaction", transactionCode);
      localStorage.setItem("pendingOrderId", orderId);

      toast.success("Đang chuyển hướng đến cổng thanh toán...", {
        id: loadingToast,
      });

      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 1500);
    } catch (err) {
      console.error("Lỗi khi mua gói:", err);
      let errorMessage = "Mua gói thất bại. Vui lòng thử lại.";
      try {
        const errorJson = JSON.parse(err.message);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = err.message || errorMessage;
      }

      toast.error(errorMessage, { id: loadingToast, duration: 5000 });
      setIsSubmitting(false);
    }
  };

  // 🎨 LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${colors.primary[0]}, transparent)`,
            }}
          />
        </div>
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
              Đang tải thông tin gói...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🎨 ERROR STATE
  if (error || !pkg) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{
              background: `radial-gradient(circle, ${colors.primary[0]}, transparent)`,
            }}
          />
        </div>
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
              {error || "Không tìm thấy gói"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isCar = pkg.packageType === "CAR";
  const limit = isCar
    ? pkg.maxCars >= 999
      ? "Không giới hạn"
      : `${pkg.maxCars} xe`
    : pkg.maxBatteries >= 999
    ? "Không giới hạn"
    : `${pkg.maxBatteries} pin`;

  const features = [
    {
      icon: CheckCircle,
      text: `Đăng tối đa ${limit}`,
      color: colors.primary[0],
    },
    {
      icon: Star,
      text: "Hiển thị nổi bật trên trang chủ",
      color: colors.primary[1],
    },
    {
      icon: Shield,
      text: "Hỗ trợ ưu tiên từ đội ngũ",
      color: colors.primary[0],
    },
    {
      icon: TrendingUp,
      text: "Báo cáo doanh thu chi tiết",
      color: colors.primary[1],
    },
  ];

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
          className="absolute top-1/2 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${colors.primary[1]}, transparent)`,
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${colors.primary[0]}, transparent)`,
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back Button */}
        <Link
          to="/seller/packages"
          className="inline-flex items-center gap-2 mb-8 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
          style={{
            background: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            border: `2px solid ${colors.border}`,
            color: isDark ? "#fff" : "#000",
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </Link>

        {/* Main Card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            border: `2px solid ${colors.border}`,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Header Section */}
          <div
            key={`header-${isDark}`}
            className="p-8 md:p-12"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {isCar ? (
                  <Car className="w-8 h-8 text-white" />
                ) : (
                  <Battery className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  {pkg.name}
                </h1>
                <p className="text-xl text-white/90">
                  {isCar ? "Gói đăng bán xe điện" : "Gói đăng bán pin"}
                </p>
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left Column - Price & Purchase */}
              <div className="space-y-6">
                {/* Price Card */}
                <div
                  key={`price-card-${isDark}`}
                  className="rounded-3xl p-8 text-center transform hover:scale-105 transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                    boxShadow: isDark
                      ? "0 20px 60px rgba(239, 68, 68, 0.3)"
                      : "0 20px 60px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <DollarSign className="w-8 h-8 text-white" />
                    <p className="text-5xl font-black text-white">
                      {Number(pkg.price).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-white/90">
                    <Clock className="w-5 h-5" />
                    <span className="text-xl">
                      / {pkg.durationMonths} tháng
                    </span>
                  </div>
                </div>

                {/* Limit Info */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                    border: `2px dashed ${colors.border}`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {isCar ? (
                      <Car
                        style={{ color: colors.primary[0] }}
                        className="w-6 h-6"
                      />
                    ) : (
                      <Battery
                        style={{ color: colors.primary[0] }}
                        className="w-6 h-6"
                      />
                    )}
                    <span
                      className={`text-lg font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Số lượng đăng:
                    </span>
                  </div>
                  <p
                    key={`limit-text-${isDark}`}
                    className="text-3xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {limit}
                  </p>
                </div>

                {/* Purchase Button */}
                <button
                  key={`purchase-btn-${isDark}`}
                  onClick={handlePurchase}
                  disabled={pkg.isActive || isSubmitting}
                  className="w-full py-5 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background:
                      pkg.isActive || isSubmitting
                        ? isDark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.1)"
                        : `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                    boxShadow:
                      pkg.isActive || isSubmitting
                        ? "none"
                        : isDark
                        ? "0 10px 40px rgba(239, 68, 68, 0.3)"
                        : "0 10px 40px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader className="w-6 h-6 animate-spin" />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : pkg.isActive ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-6 h-6" />
                      <span>ĐÃ KÍCH HOẠT</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Zap className="w-6 h-6" />
                      <span>MUA NGAY</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Right Column - Description & Features */}
              <div className="space-y-8">
                {/* Description */}
                <div>
                  <h3
                    key={`desc-title-${isDark}`}
                    className="text-2xl font-black mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Mô tả gói
                  </h3>
                  <div
                    className={`p-6 rounded-2xl ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    } leading-relaxed`}
                    style={{
                      background: isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.03)",
                      border: `1px solid ${colors.border}`,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: pkg.description || "Chưa có mô tả chi tiết.",
                    }}
                  />
                </div>

                {/* Features */}
                <div>
                  <h3
                    key={`features-title-${isDark}`}
                    className="text-2xl font-black mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Tính năng nổi bật
                  </h3>
                  <div className="space-y-4">
                    {features.map((feature, i) => {
                      const IconComponent = feature.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-105"
                          style={{
                            background: isDark
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(0, 0, 0, 0.03)",
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          <IconComponent
                            className="w-6 h-6 flex-shrink-0"
                            style={{ color: feature.color }}
                          />
                          <p
                            className={`font-medium ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {feature.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

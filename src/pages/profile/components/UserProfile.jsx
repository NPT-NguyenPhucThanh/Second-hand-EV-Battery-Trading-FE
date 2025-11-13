import React, { useState, useEffect } from "react";
import { useUser } from "../../../contexts/UserContext";
import { Routes, Route } from "react-router-dom";
import {
  Loader,
  CheckCircle,
  Clock,
  XCircle,
  User,
  ShoppingBag,
  Package,
  AlertTriangle,
  Crown,
  TrendingUp,
  FileText,
  Upload as UploadIcon,
  X,
  Send,
  ChevronRight,
} from "lucide-react";
import {
  getSelfUpgradeStatus,
  requestSellerUpgrade,
  resubmitSellerUpgrade,
} from "../../../services/sellerUpgradeService";
import { toast } from "sonner";
import { useTheme } from "../../../contexts/ThemeContext";
import AuroraText from "../../../components/common/AuroraText";

import ProfileInfo from "../../profile/ProfileInfo";
import OrderHistoryContent from "../../profile/OrderHistoryContent";
import DisputesContent from "../DisputesContent";
import CurrentPackageContent from "../CurrentPackageContent";
import ViewMyProductContent from "../ViewMyProductContent";
import MySellingContent from "../MySellingContent";
import RevenueContent from "../RevenueContent";
import TransactionContent from "../TransactionContent";
import ContractsContent from "../ContractsContent";

const THEME_COLORS = {
  dark: {
    primary: ["#ef4444", "#f97316"],
    aurora: ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"],
    border: "rgba(239, 68, 68, 0.2)",
    text: {
      primary: "#ffffff",
      secondary: "#e5e7eb", // gray-200 - Much brighter for dark mode
    },
  },
  light: {
    primary: ["#3b82f6", "#8b5cf6"],
    aurora: ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#3b82f6"],
    border: "rgba(59, 130, 246, 0.3)",
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
    },
  },
};
const MENU = {
  PROFILE: "profile",
  ORDERS: "orders",
  DISPUTES: "disputes",
  PACKAGE: "package",
  MY_ORDERS: "my_orders",
  MY_PRODUCTS: "my_products",
  TRANSACTION: "transaction",
  REVENUE: "revenue",
  VOUCHERS: "vouchers",
  CONTRACTS: "contracts",
};

// 🎯 Menu Item Component - Bento Card Style
const MenuCard = ({
  icon,
  label,
  description,
  active,
  onClick,
  gradient,
  isDark,
  colors,
}) => (
  <button
    onClick={onClick}
    className="group relative w-full text-left p-6 rounded-3xl transition-all duration-300 hover:scale-105"
    style={{
      background: active
        ? `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`
        : isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(20px)",
      border: `2px solid ${active ? "transparent" : colors.border}`,
      boxShadow: active
        ? isDark
          ? "0 20px 60px rgba(239, 68, 68, 0.3)"
          : "0 20px 60px rgba(59, 130, 246, 0.3)"
        : "0 10px 30px rgba(0, 0, 0, 0.05)",
    }}
  >
    <div className="flex items-start justify-between mb-3">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{
          background: active
            ? "rgba(255, 255, 255, 0.2)"
            : gradient || `${colors.primary[0]}20`,
        }}
      >
        <div style={{ color: active ? "#fff" : colors.primary[0] }}>{icon}</div>
      </div>
      <ChevronRight
        className={`w-5 h-5 transition-transform duration-300 ${
          active
            ? "translate-x-1 text-white"
            : isDark
            ? "text-gray-200"
            : "text-gray-600"
        }`}
      />
    </div>
    <h3
      className={`text-lg font-bold mb-1 ${
        active ? "text-white" : isDark ? "text-white" : "text-gray-900"
      }`}
    >
      {label}
    </h3>
    {description && (
      <p
        className={`text-sm ${
          active ? "text-white/80" : isDark ? "text-gray-200" : "text-gray-600"
        }`}
      >
        {description}
      </p>
    )}
  </button>
);

export default function ProfilePage() {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  const { user } = useUser();

  const [activeMenu, setActiveMenu] = useState(MENU.PROFILE);
  const [upgradeStatus, setUpgradeStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cccdFront, setCccdFront] = useState(null);
  const [cccdBack, setCccdBack] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchUpgradeStatus = async () => {
      if (!user) return;
      setStatusLoading(true);
      try {
        const res = await getSelfUpgradeStatus();
        if (res.status === "success") {
          setUpgradeStatus(res.upgradeStatus);
          if (res.upgradeStatus === "REJECTED") {
            setRejectionReason(res.rejectionReason);
          }
        }
      } catch {
        toast.error("Không thể tải trạng thái nâng cấp.");
      } finally {
        setStatusLoading(false);
      }
    };
    fetchUpgradeStatus();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-6 relative overflow-hidden flex items-center justify-center">
        {/* Floating Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${colors.primary[0]}, transparent)`,
            }}
          />
        </div>

        {/* Not Logged In Card */}
        <div
          className="relative z-10 rounded-3xl p-12 text-center max-w-md"
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
              background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
            }}
          >
            <User className="w-10 h-10 text-white" />
          </div>
          <h2
            className={`text-2xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Bạn chưa đăng nhập
          </h2>
          <p className={`mb-6 ${isDark ? "text-gray-200" : "text-gray-600"}`}>
            Vui lòng đăng nhập để xem trang cá nhân
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
              boxShadow: isDark
                ? "0 10px 40px rgba(239, 68, 68, 0.3)"
                : "0 10px 40px rgba(59, 130, 246, 0.3)",
            }}
          >
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  const showUpgradeModal = () => setIsModalOpen(true);
  const handleModalCancel = () => {
    setIsModalOpen(false);
    setCccdFront(null);
    setCccdBack(null);
  };

  const handleFormSubmit = async () => {
    if (!cccdFront || !cccdBack) {
      toast.error("Vui lòng tải lên đủ 2 mặt CCCD");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("cccdFront", cccdFront);
    formData.append("cccdBack", cccdBack);

    try {
      let res;
      if (upgradeStatus === "REJECTED") {
        res = await resubmitSellerUpgrade(formData);
      } else {
        res = await requestSellerUpgrade(formData);
      }

      if (res.status === "success") {
        toast.success(res.message);
        setUpgradeStatus(res.upgradeStatus || "PENDING");
        setIsModalOpen(false);
        setCccdFront(null);
        setCccdBack(null);
      } else {
        throw new Error(res.message || "Gửi yêu cầu thất bại");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderUpgradeSection = () => {
    if (statusLoading) {
      return (
        <div
          className="p-8 rounded-2xl text-center"
          style={{
            background: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            border: `2px solid ${colors.border}`,
          }}
        >
          <Loader
            className="w-8 h-8 mx-auto mb-3 animate-spin"
            style={{ color: colors.primary[0] }}
          />
          <p className={isDark ? "text-gray-200" : "text-gray-600"}>
            Đang tải...
          </p>
        </div>
      );
    }

    if (user.roles?.includes("SELLER") || user.role === "SELLER") {
      return (
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "2px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-green-700 mb-1">
                Bạn đã là Người bán
              </h4>
              <p className={isDark ? "text-gray-200" : "text-gray-600"}>
                Tài khoản của bạn đã có đầy đủ quyền đăng bán sản phẩm.
              </p>
            </div>
          </div>
        </div>
      );
    }

    switch (upgradeStatus) {
      case "APPROVED":
        return (
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "2px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-green-700 mb-1">
                  Nâng cấp thành công
                </h4>
                <p className={isDark ? "text-gray-200" : "text-gray-600"}>
                  Yêu cầu của bạn đã được duyệt. Vui lòng đăng xuất và đăng nhập
                  lại để cập nhật quyền.
                </p>
              </div>
            </div>
          </div>
        );

      case "PENDING":
        return (
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "rgba(251, 191, 36, 0.1)",
              border: "2px solid rgba(251, 191, 36, 0.3)",
            }}
          >
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1 animate-pulse" />
              <div>
                <h4 className="font-bold text-yellow-700 mb-1">
                  Đang chờ duyệt
                </h4>
                <p className={isDark ? "text-gray-200" : "text-gray-600"}>
                  Yêu cầu nâng cấp của bạn đã được gửi và đang chờ quản trị viên
                  xét duyệt.
                </p>
              </div>
            </div>
          </div>
        );

      case "REJECTED":
        return (
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "2px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-red-700 mb-1">
                  Yêu cầu bị từ chối
                </h4>
                <p className={isDark ? "text-gray-200" : "text-gray-600"}>
                  Lý do: {rejectionReason || "Không có lý do cụ thể."}
                </p>
              </div>
            </div>
            <button
              onClick={showUpgradeModal}
              className="px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                boxShadow: isDark
                  ? "0 10px 30px rgba(239, 68, 68, 0.3)"
                  : "0 10px 30px rgba(59, 130, 246, 0.3)",
              }}
            >
              Gửi lại yêu cầu
            </button>
          </div>
        );

      default:
        return (
          <div
            className="p-8 rounded-2xl text-center"
            style={{
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              border: `2px solid ${colors.border}`,
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
              }}
            >
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3
              className={`text-xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Trở thành Người Bán
            </h3>
            <p className={`mb-6 ${isDark ? "text-gray-200" : "text-gray-600"}`}>
              Bạn muốn trở thành Người bán để đăng bán sản phẩm?
            </p>
            <button
              onClick={showUpgradeModal}
              className="px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                boxShadow: isDark
                  ? "0 10px 40px rgba(239, 68, 68, 0.3)"
                  : "0 10px 40px rgba(59, 130, 246, 0.3)",
              }}
            >
              Nâng cấp ngay
            </button>
          </div>
        );
    }
  };

  const renderContent = () => {
    if (activeMenu === MENU.PROFILE) {
      return (
        <>
          <ProfileInfo />
          <hr className="my-10" />
          <div>
            <h2
              className={`text-2xl font-semibold mb-6 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Trở thành Người bán
            </h2>
            {renderUpgradeSection()}
          </div>
        </>
      );
    }

    if (activeMenu === MENU.ORDERS) {
      return (
        <Routes>
          <Route path="/" element={<OrderHistoryContent />} />
          <Route
            path="orders/:orderId/transactions"
            element={<TransactionContent />}
          />
        </Routes>
      );
    }
    if (activeMenu === MENU.DISPUTES) {
      return <DisputesContent />;
    }
    if (activeMenu === MENU.PACKAGE) {
      return <CurrentPackageContent />;
    }
    if (activeMenu === MENU.MY_ORDERS) {
      return <ViewMyProductContent />;
    }
    if (activeMenu === MENU.MY_PRODUCTS) {
      return <MySellingContent />;
    }
    if (activeMenu === MENU.REVENUE) {
      return <RevenueContent />;
    }
    if (activeMenu === MENU.CONTRACTS) {
      return <ContractsContent />;
    }

    return (
      <div
        className="text-center py-16 rounded-2xl"
        style={{
          background: isDark
            ? "rgba(255, 255, 255, 0.03)"
            : "rgba(0, 0, 0, 0.03)",
        }}
      >
        <Package
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: colors.text.secondary }}
        />
        <p className={isDark ? "text-gray-200" : "text-gray-600"}>
          Chức năng này đang được phát triển...
        </p>
      </div>
    );
  };

  return (
    <div
      className="pt-14 min-h-screen flex relative overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%)",
      }}
    >
      {/* Floating Orbs */}
      <div
        className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{
          background: `radial-gradient(circle, ${colors.primary[0]}, transparent)`,
          animationDuration: "4s",
        }}
      />
      <div
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{
          background: `radial-gradient(circle, ${colors.primary[1]}, transparent)`,
          animationDelay: "2s",
          animationDuration: "4s",
        }}
      />

      {/* Sidebar - Bento Grid */}
      <aside
        className="w-80 p-6 border-r hidden md:block relative z-10"
        style={{
          background: isDark
            ? "rgba(255, 255, 255, 0.03)"
            : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          borderColor: colors.border,
        }}
      >
        {/* User Hero Card */}
        <div
          className="p-6 rounded-2xl mb-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
            boxShadow: isDark
              ? "0 10px 40px rgba(239, 68, 68, 0.3)"
              : "0 10px 40px rgba(59, 130, 246, 0.3)",
          }}
        >
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-white/20 backdrop-blur">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              {user.username}
            </h3>
            <p className="text-white/80 text-sm mb-3">
              {user.email || "email@example.com"}
            </p>
            <div className="inline-block px-3 py-1 rounded-lg text-xs font-bold text-white bg-white/20">
              {user.roles?.includes("SELLER") || user.role === "SELLER"
                ? "Người Bán"
                : "Người Mua"}
            </div>
          </div>
        </div>

        {/* Menu Bento Cards */}
        <nav className="space-y-3">
          <p
            className="text-xs font-bold uppercase mb-4"
            style={{ color: colors.text.secondary }}
          >
            Tài Khoản Của Tôi
          </p>

          <MenuCard
            icon={<User className="w-5 h-5" />}
            label="Hồ Sơ"
            active={activeMenu === MENU.PROFILE}
            onClick={() => setActiveMenu(MENU.PROFILE)}
            isDark={isDark}
            colors={colors}
          />

          <MenuCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Khiếu nại"
            active={activeMenu === MENU.DISPUTES}
            onClick={() => setActiveMenu(MENU.DISPUTES)}
            isDark={isDark}
            colors={colors}
          />

          <MenuCard
            icon={<Package className="w-5 h-5" />}
            label="Gói Dịch Vụ"
            active={activeMenu === MENU.PACKAGE}
            onClick={() => setActiveMenu(MENU.PACKAGE)}
            isDark={isDark}
            colors={colors}
          />

          <MenuCard
            icon={<ShoppingBag className="w-5 h-5" />}
            label="Sản phẩm được mua"
            active={activeMenu === MENU.MY_ORDERS}
            onClick={() => setActiveMenu(MENU.MY_ORDERS)}
            isDark={isDark}
            colors={colors}
          />

          {(user.roles?.includes("SELLER") || user.role === "SELLER") && (
            <>
              <MenuCard
                icon={<FileText className="w-5 h-5" />}
                label="Sản phẩm đang bán"
                active={activeMenu === MENU.MY_PRODUCTS}
                onClick={() => setActiveMenu(MENU.MY_PRODUCTS)}
                isDark={isDark}
                colors={colors}
              />

              <MenuCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Thống kê doanh thu"
                active={activeMenu === MENU.REVENUE}
                onClick={() => setActiveMenu(MENU.REVENUE)}
                isDark={isDark}
                colors={colors}
              />
              <MenuCard
                icon={<Clock className="w-5 h-5" />}
                label="Hợp đồng của tôi"
                active={activeMenu === MENU.CONTRACTS}
                onClick={() => setActiveMenu(MENU.CONTRACTS)}
                isDark={isDark}
                colors={colors}
              />
            </>
          )}

          <div className="h-px my-4" style={{ background: colors.border }} />

          <MenuCard
            icon={<Clock className="w-5 h-5" />}
            label="Lịch sử mua hàng"
            active={activeMenu === MENU.ORDERS}
            onClick={() => setActiveMenu(MENU.ORDERS)}
            isDark={isDark}
            colors={colors}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 p-8 mx-auto max-w-6xl relative z-10"
        style={{
          background: isDark
            ? "rgba(255, 255, 255, 0.02)"
            : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{
            background: isDark
              ? "rgba(17, 24, 39, 0.8)"
              : "rgba(255, 255, 255, 0.9)",
            border: `2px solid ${colors.border}`,
          }}
        >
          {renderContent()}
        </div>
      </main>

      {/* Modal nâng cấp - Glassmorphism */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(10px)",
            }}
            onClick={submitting ? undefined : handleModalCancel}
          />

          {/* Modal Content */}
          <div
            className="relative z-10 w-full max-w-2xl rounded-3xl p-8 shadow-2xl"
            style={{
              background: isDark
                ? "rgba(17, 24, 39, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: `2px solid ${colors.border}`,
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleModalCancel}
              disabled={submitting}
              className="absolute top-4 right-4 p-2 rounded-xl transition-all duration-300 hover:scale-110"
              style={{
                background: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              }}
            >
              <X
                className={`w-5 h-5 ${
                  isDark ? "text-gray-200" : "text-gray-600"
                }`}
              />
            </button>

            {/* Title */}
            <div className="mb-6">
              <AuroraText
                text={
                  upgradeStatus === "REJECTED"
                    ? "Gửi lại yêu cầu nâng cấp"
                    : "Nâng cấp tài khoản Seller"
                }
                className="text-2xl font-bold"
              />
            </div>

            {/* Info Alert */}
            <div
              className="p-4 rounded-xl mb-6"
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                border: "2px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-700 mb-1">
                    Yêu cầu thông tin
                  </h4>
                  <p className={isDark ? "text-gray-200" : "text-gray-600"}>
                    Vui lòng tải lên ảnh chụp 2 mặt Căn cước công dân (CCCD) của
                    bạn để xác thực. (File {"<"} 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* CCCD Front */}
            <div className="mb-6">
              <label
                className={`block font-bold mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                CCCD mặt trước *
              </label>
              <div
                className="p-6 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer hover:border-opacity-100"
                style={{
                  borderColor: cccdFront ? colors.primary[0] : colors.border,
                  background: isDark
                    ? "rgba(255, 255, 255, 0.02)"
                    : "rgba(0, 0, 0, 0.02)",
                }}
              >
                <input
                  type="file"
                  id="cccdFront"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("File phải nhỏ hơn 5MB");
                        e.target.value = "";
                        return;
                      }
                      setCccdFront(file);
                    }
                  }}
                  className="hidden"
                  disabled={submitting}
                />
                <label htmlFor="cccdFront" className="cursor-pointer">
                  {cccdFront ? (
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p
                        className={`font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {cccdFront.name}
                      </p>
                      <p className={isDark ? "text-gray-200" : "text-gray-600"}>
                        {(cccdFront.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadIcon
                        className="w-8 h-8 mx-auto mb-2"
                        style={{ color: colors.primary[0] }}
                      />
                      <p
                        className={`font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Nhấn để chọn file
                      </p>
                      <p className={isDark ? "text-gray-200" : "text-gray-600"}>
                        Hỗ trợ: JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* CCCD Back */}
            <div className="mb-8">
              <label
                className={`block font-bold mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                CCCD mặt sau *
              </label>
              <div
                className="p-6 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer hover:border-opacity-100"
                style={{
                  borderColor: cccdBack ? colors.primary[0] : colors.border,
                  background: isDark
                    ? "rgba(255, 255, 255, 0.02)"
                    : "rgba(0, 0, 0, 0.02)",
                }}
              >
                <input
                  type="file"
                  id="cccdBack"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("File phải nhỏ hơn 5MB");
                        e.target.value = "";
                        return;
                      }
                      setCccdBack(file);
                    }
                  }}
                  className="hidden"
                  disabled={submitting}
                />
                <label htmlFor="cccdBack" className="cursor-pointer">
                  {cccdBack ? (
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p
                        className={`font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {cccdBack.name}
                      </p>
                      <p className={isDark ? "text-gray-200" : "text-gray-600"}>
                        {(cccdBack.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadIcon
                        className="w-8 h-8 mx-auto mb-2"
                        style={{ color: colors.primary[0] }}
                      />
                      <p
                        className={`font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Nhấn để chọn file
                      </p>
                      <p className={isDark ? "text-gray-200" : "text-gray-600"}>
                        Hỗ trợ: JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleModalCancel}
                disabled={submitting}
                className="flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.05)",
                  color: isDark ? "#fff" : "#000",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={submitting || !cccdFront || !cccdBack}
                className="flex-1 px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                  boxShadow: isDark
                    ? "0 10px 40px rgba(239, 68, 68, 0.3)"
                    : "0 10px 40px rgba(59, 130, 246, 0.3)",
                }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Đang gửi...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Gửi yêu cầu
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

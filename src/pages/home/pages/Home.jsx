import React, { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext.jsx";
import { useUser } from "../../../contexts/UserContext.jsx";
import AuroraText from "../../../components/common/AuroraText";
import {
  Zap,
  Battery,
  Car,
  Shield,
  Award,
  Package,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Star,
  Heart,
} from "lucide-react";
import { getProducts } from "../../../utils/services/productService.js";
import { toast } from "sonner";
import { Spin } from "antd";

const THEME_COLORS = {
  dark: {
    primary: ["#ef4444", "#f97316"], // Red to orange
    aurora: ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"],
    border: "rgba(239, 68, 68, 0.2)",
    hoverOverlay:
      "linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(249, 115, 22, 0.3))",
  },
  light: {
    primary: ["#3b82f6", "#8b5cf6"], // Blue to purple
    aurora: ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#3b82f6"],
    border: "rgba(59, 130, 246, 0.3)",
    hoverOverlay:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))",
  },
};

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, isDark }) => {
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  return (
    <div
      className="p-6 rounded-2xl transition-all duration-300 hover:scale-105"
      style={{
        background: isDark
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        border: `2px solid ${colors.border}`,
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
        }}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div
        className={`text-3xl font-bold mb-1 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </div>
      <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        {label}
      </div>
    </div>
  );
};

// Product Card Component with Glassmorphism
const ProductCard = ({ product, isDark }) => {
  const navigate = useNavigate();
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const formatPrice = (price) => {
    return price?.toLocaleString("vi-VN") + " ₫" || "Liên hệ";
  };

  return (
    <div
      onClick={() => navigate(`/listings/${product.productid}`)}
      className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105"
      style={{
        background: isDark
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        border: `2px solid ${colors.border}`,
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.images?.[0] || "/placeholder.jpg"}
          alt={product.productname}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient Overlay on Hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: colors.hoverOverlay,
          }}
        />

        {/* Type Badge */}
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{
            background:
              product.type === "Car EV"
                ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                : "linear-gradient(135deg, #10b981, #059669)",
          }}
        >
          {product.type === "Car EV" ? "🚗 Xe điện" : "🔋 Pin"}
        </div>

        {/* In Warehouse Badge */}
        {product.inWarehouse && (
          <div
            className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
            }}
          >
            Trong kho
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.success("Đã thêm vào yêu thích!");
          }}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            background: isDark
              ? "rgba(255, 255, 255, 0.2)"
              : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Heart className="w-5 h-5" style={{ color: "#ef4444" }} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className={`text-base font-semibold mb-2 line-clamp-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {product.productname}
        </h3>

        {/* Price with Gradient - Force re-render on theme change */}
        <div
          key={`price-${product.productid}-${isDark}`}
          className="text-xl font-bold mb-2"
          style={{
            background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {formatPrice(product.cost)}
        </div>

        {/* Brand Info */}
        <div
          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {product.brandInfo
            ? `${product.brandInfo.brand} ${
                product.type === "Car EV"
                  ? product.brandInfo.year
                  : product.brandInfo.capacity + " kWh"
              }`
            : product.type}
        </div>
      </div>
    </div>
  );
};

function Home() {
  const { isDark } = useTheme();
  const { user: currentUser, isAuthenticated, loading: authLoading } = useUser();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get theme colors dynamically
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  useEffect(() => {
    const isStaffOrManager = isAuthenticated && currentUser?.roles &&
      (currentUser.roles.includes("STAFF") || currentUser.roles.includes("MANAGER"));

    if (!authLoading && !isStaffOrManager) {
      const fetchProducts = async () => {
        try {
          const data = await getProducts(0, 8, ""); // Get first 8 products
          setProducts(data.products || []);
        } catch (error) {
          console.error("Error fetching products:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
      setMounted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setLoading(false);
      setMounted(true); 
    }
  }, [authLoading, isAuthenticated, currentUser]); 

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen"
           style={{
             background: isDark
               ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
               : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
           }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated && currentUser?.roles) {
    if (currentUser.roles.includes("STAFF")) {
      return <Navigate to="/staff" replace />;
    }
    if (currentUser.roles.includes("MANAGER")) {
      return <Navigate to="/manager" replace />;
    }
  }

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen"
           style={{
             background: isDark
               ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
               : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
           }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      {/* Hero Section with Aurora Effect */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(239, 68, 68, 0.4), transparent)",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(249, 115, 22, 0.4), transparent)",
              animation: "float 8s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(251, 146, 60, 0.3), transparent)",
              animation: "float 10s ease-in-out infinite",
            }}
          />
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(30px, -30px); }
          }
        `}</style>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-8"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.2))"
                  : "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(251, 146, 60, 0.1))",
                backdropFilter: "blur(12px)",
                border: isDark
                  ? "1px solid rgba(239, 68, 68, 0.3)"
                  : "1px solid rgba(251, 146, 60, 0.3)",
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: "#ef4444" }} />
              <span
                key={`hero-badge-${isDark}`}
                className="font-bold text-lg whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Nền tảng giao dịch #2 Việt Nam
              </span>
            </div>

            {/* Main Heading with Aurora Effect */}
            <h1 className="mb-6" style={{ lineHeight: "1.3" }}>
              <AuroraText
                key={`hero-title-${isDark}`}
                text="Mua Bán Xe Điện & Pin"
                colors={colors.aurora}
                speed={3}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black"
              />
            </h1>

            <h2 className="mb-8" style={{ lineHeight: "1.3" }}>
              <AuroraText
                key={`hero-subtitle-${isDark}`}
                text="Chất Lượng Cao"
                colors={colors.aurora}
                speed={2.5}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black"
              />
            </h2>

            <p
              className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Kết nối người mua và người bán xe điện, pin cũ chính hãng. Giao
              dịch an toàn, nhanh chóng với hệ thống kho bãi hiện đại.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <StatCard
                icon={Car}
                value="1000+"
                label="Xe điện"
                isDark={isDark}
              />
              <StatCard
                icon={Battery}
                value="500+"
                label="Pin chính hãng"
                isDark={isDark}
              />
              <StatCard
                icon={Shield}
                value="24/7"
                label="Hỗ trợ"
                isDark={isDark}
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/listings"
                className="group relative px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 shadow-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                  boxShadow: `0 10px 40px ${
                    isDark
                      ? "rgba(239, 68, 68, 0.4)"
                      : "rgba(59, 130, 246, 0.4)"
                  }`,
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Khám phá ngay
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: isDark
                      ? "linear-gradient(135deg, #f97316, #fb923c)"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  }}
                />
              </Link>

              {!currentUser ? (
                <Link
                  to="/login?tab=signup"
                  className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                    backdropFilter: "blur(12px)",
                    border: `2px solid ${colors.border}`,
                  }}
                >
                  Đăng ký miễn phí
                </Link>
              ) : currentUser.roles && currentUser.roles.includes("SELLER") ? ( 
                <Link
                  to="/listings/new"
                  className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                    backdropFilter: "blur(12px)",
                    border: `2px solid ${colors.border}`,
                  }}
                >
                  Đăng sản phẩm
                </Link>
              ) : (
                <Link
                  to="/profile?tab=upgrade"
                  className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                    backdropFilter: "blur(12px)",
                    border: `2px solid ${colors.border}`,
                  }}
                >
                  Nâng cấp tài khoản
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-20">
        {/* Section Header with Glow */}
        <div className="text-center mb-12 relative">
          <div
            className="absolute inset-0 blur-3xl opacity-40"
            style={{
              background: isDark
                ? "radial-gradient(circle, #ef4444, #f97316, transparent)"
                : "radial-gradient(circle, #3b82f6, #8b5cf6, transparent)",
            }}
          />
          <h2 className="relative mb-4">
            <AuroraText
              key={`products-title-${isDark}`}
              text="Sản Phẩm Nổi Bật"
              colors={colors.aurora}
              speed={2.5}
              className="text-4xl md:text-5xl font-black drop-shadow-2xl"
            />
          </h2>
          <p
            className={`text-lg ${
              isDark ? "text-gray-400" : "text-gray-600"
            } drop-shadow-lg`}
          >
            Những sản phẩm được quan tâm nhất
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div
              className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: colors.primary[0],
                borderTopColor: "transparent",
              }}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.productid}
                  product={product}
                  isDark={isDark}
                />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105 shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #f97316)",
                  boxShadow: "0 10px 40px rgba(239, 68, 68, 0.4)",
                }}
              >
                Xem tất cả sản phẩm
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Home;
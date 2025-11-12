import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination, Empty } from "antd";
import { Heart, Car, Battery } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext.jsx";
import { getProducts } from "../../../utils/services/productService";
import AuroraText from "../../../components/common/AuroraText";
import { toast } from "sonner";

const THEME_COLORS = {
  dark: {
    primary: ["#ef4444", "#f97316"],
    aurora: ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"],
    border: "rgba(239, 68, 68, 0.2)",
    hoverOverlay:
      "linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(249, 115, 22, 0.3))",
  },
  light: {
    primary: ["#3b82f6", "#8b5cf6"],
    aurora: ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#3b82f6"],
    border: "rgba(59, 130, 246, 0.3)",
    hoverOverlay:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))",
  },
};

export default function Listings() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Get theme colors dynamically
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [typeFilter, setTypeFilter] = useState(""); // "", "Car EV", "Battery"
  const pageSize = 12;

  useEffect(() => {
    fetchProducts(currentPage - 1, typeFilter);
  }, [currentPage, typeFilter]);

  const fetchProducts = async (page, type) => {
    setLoading(true);
    try {
      const data = await getProducts(page, pageSize, type);
      setProducts(data.products || []);
      setTotalProducts(data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Lỗi khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price?.toLocaleString("vi-VN") + " ₫" || "Liên hệ";
  };

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  return (
    <div
      className={`min-h-screen py-20 transition-colors duration-500 ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div
              className="absolute inset-0 blur-3xl opacity-40"
              style={{
                background: isDark
                  ? "radial-gradient(circle, #ef4444, #f97316, transparent)"
                  : "radial-gradient(circle, #3b82f6, #8b5cf6, transparent)",
              }}
            />
            <h1 className="mb-4 relative">
              <AuroraText
                key={`listings-title-${isDark}`}
                text="Tất Cả Sản Phẩm"
                colors={colors.aurora}
                speed={3}
                className="text-4xl md:text-5xl lg:text-6xl font-black drop-shadow-2xl"
              />
            </h1>
          </div>
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Khám phá hàng ngàn sản phẩm xe điện và pin chất lượng cao
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <button
            onClick={() => handleTypeFilter("")}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              typeFilter === ""
                ? "text-white"
                : isDark
                ? "text-white"
                : "text-gray-900"
            }`}
            style={{
              background:
                typeFilter === ""
                  ? `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`
                  : isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(12px)",
              border: typeFilter === "" ? "none" : `2px solid ${colors.border}`,
              boxShadow:
                typeFilter === ""
                  ? isDark
                    ? "0 10px 40px rgba(239, 68, 68, 0.4)"
                    : "0 10px 40px rgba(59, 130, 246, 0.4)"
                  : "none",
            }}
          >
            Tất cả
          </button>

          <button
            onClick={() => handleTypeFilter("Car EV")}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              typeFilter === "Car EV"
                ? "text-white"
                : isDark
                ? "text-white"
                : "text-gray-900"
            }`}
            style={{
              background:
                typeFilter === "Car EV"
                  ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                  : isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(12px)",
              border:
                typeFilter === "Car EV"
                  ? "none"
                  : isDark
                  ? "2px solid rgba(59, 130, 246, 0.3)"
                  : "2px solid rgba(59, 130, 246, 0.3)",
              boxShadow:
                typeFilter === "Car EV"
                  ? "0 10px 40px rgba(59, 130, 246, 0.4)"
                  : "none",
            }}
          >
            <Car className="w-5 h-5" />
            Xe điện
          </button>

          <button
            onClick={() => handleTypeFilter("Battery")}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              typeFilter === "Battery"
                ? "text-white"
                : isDark
                ? "text-white"
                : "text-gray-900"
            }`}
            style={{
              background:
                typeFilter === "Battery"
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(12px)",
              border:
                typeFilter === "Battery"
                  ? "none"
                  : isDark
                  ? "2px solid rgba(16, 185, 129, 0.3)"
                  : "2px solid rgba(16, 185, 129, 0.3)",
              boxShadow:
                typeFilter === "Battery"
                  ? "0 10px 40px rgba(16, 185, 129, 0.4)"
                  : "none",
            }}
          >
            <Battery className="w-5 h-5" />
            Pin
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div
              className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: colors.primary[0],
                borderTopColor: "transparent",
              }}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <Empty
              description={
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Không có sản phẩm nào
                </span>
              }
            />
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {products.map((product) => (
                <div
                  key={product.productid}
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
                          background:
                            "linear-gradient(135deg, #10b981, #059669)",
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
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
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
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center">
              <Pagination
                current={currentPage}
                total={totalProducts}
                pageSize={pageSize}
                onChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                showSizeChanger={false}
                showTotal={(total) => `Tổng ${total} sản phẩm`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

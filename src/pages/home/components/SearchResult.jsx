import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Empty, Input, Select, Slider, Pagination } from "antd";
import { Search, X, Heart } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext.jsx";
import { getProducts } from "../../../utils/services/productService";
import AuroraText from "../../../components/common/AuroraText";
import { toast } from "sonner";

const { Option } = Select;

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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResult() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const query = useQuery();
  const initialKeyword = query.get("keyword") || "";

  // Get theme colors dynamically
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const [allProducts, setAllProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [filters, setFilters] = useState({
    keyword: initialKeyword,
    type: "",
    brand: "",
    yearRange: [2015, 2025],
    minPrice: null,
    maxPrice: null,
  });

  // Popular brands
  const carBrands = [
    "Tesla",
    "VinFast",
    "BYD",
    "Nissan",
    "Hyundai",
    "BMW",
    "Mercedes",
  ];
  const batteryBrands = [
    "LG",
    "Samsung",
    "CATL",
    "Panasonic",
    "BYD",
    "SK Innovation",
  ];
  const currentBrands =
    filters.type === "Car EV"
      ? carBrands
      : filters.type === "Battery"
      ? batteryBrands
      : [...carBrands, ...batteryBrands];

  // Fetch all products from API
  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Get large page to fetch all products (adjust size as needed)
      const res = await getProducts(0, 1000, "");
      setAllProducts(res?.products || []);
      return res?.products || [];
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Lỗi khi tải sản phẩm");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters to products
  const applyFilters = useCallback((products, searchFilters) => {
    let filtered = [...products];

    // Filter by keyword
    if (searchFilters.keyword) {
      const keyword = searchFilters.keyword.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.productname?.toLowerCase().includes(keyword) ||
          p.brandInfo?.brand?.toLowerCase().includes(keyword)
      );
    }

    // Filter by type
    if (searchFilters.type) {
      filtered = filtered.filter((p) => p.type === searchFilters.type);
    }

    // Filter by brand
    if (searchFilters.brand) {
      filtered = filtered.filter(
        (p) =>
          p.brandInfo?.brand?.toLowerCase() ===
          searchFilters.brand.toLowerCase()
      );
    }

    // Filter by year
    if (searchFilters.type === "Car EV") {
      filtered = filtered.filter((p) => {
        const year = p.brandInfo?.year;
        return (
          !year ||
          (year >= searchFilters.yearRange[0] &&
            year <= searchFilters.yearRange[1])
        );
      });
    }

    // Filter by price
    if (searchFilters.minPrice) {
      filtered = filtered.filter((p) => p.cost >= searchFilters.minPrice);
    }
    if (searchFilters.maxPrice) {
      filtered = filtered.filter((p) => p.cost <= searchFilters.maxPrice);
    }

    return filtered;
  }, []);

  // Initial load - fetch all products
  useEffect(() => {
    const init = async () => {
      const products = await fetchAllProducts();
      const filtered = applyFilters(products, filters);
      setResults(filtered);
      setCurrentPage(1);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to URL changes and update keyword + search
  useEffect(() => {
    const urlKeyword = query.get("keyword") || "";
    if (urlKeyword !== filters.keyword) {
      const newFilters = { ...filters, keyword: urlKeyword };
      setFilters(newFilters);

      // Apply search if we have products loaded
      if (allProducts.length > 0) {
        const filtered = applyFilters(allProducts, newFilters);
        setResults(filtered);
        setCurrentPage(1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.get("keyword"), allProducts]);

  const handleSearch = () => {
    const filtered = applyFilters(allProducts, filters);
    setResults(filtered);
    setCurrentPage(1);
  };

  const handleReset = () => {
    const resetFilters = {
      keyword: "",
      type: "",
      brand: "",
      yearRange: [2015, 2025],
      minPrice: null,
      maxPrice: null,
    };
    setFilters(resetFilters);
    // Show all products after reset instead of empty
    const filtered = applyFilters(allProducts, resetFilters);
    setResults(filtered);
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    return price?.toLocaleString("vi-VN") + " ₫" || "Liên hệ";
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
                key={`search-title-${isDark}`}
                text="Tìm Kiếm Sản Phẩm"
                colors={colors.aurora}
                speed={3}
                className="text-4xl md:text-5xl lg:text-6xl font-black drop-shadow-2xl"
              />
            </h1>
          </div>
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Tìm kiếm xe điện và pin theo nhu cầu của bạn
          </p>
        </div>

        {/* Toggle Filters Button */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            style={{
              background: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${colors.border}`,
            }}
          >
            {showFilters ? "🔽 Ẩn bộ lọc" : "🔼 Hiện bộ lọc"}
          </button>

          <div
            className={`text-lg font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Tìm thấy{" "}
            <span
              key={`search-count-${isDark}`}
              style={{
                background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {results.length}
            </span>{" "}
            sản phẩm
          </div>
        </div>

        {/* Search Filters - Glassmorphism */}
        {showFilters && (
          <div
            className="rounded-3xl p-6 md:p-8 mb-12 transition-all duration-300"
            style={{
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              border: `2px solid ${colors.border}`,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Keyword */}
              <div>
                <label
                  className={`block mb-2 font-bold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Từ khóa
                </label>
                <Input
                  size="large"
                  placeholder="Tìm kiếm..."
                  value={filters.keyword}
                  onChange={(e) =>
                    setFilters({ ...filters, keyword: e.target.value })
                  }
                  prefix={<Search className="w-4 h-4 text-gray-400" />}
                  className="rounded-xl"
                />
              </div>

              {/* Type */}
              <div>
                <label
                  className={`block mb-2 font-bold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Loại sản phẩm
                </label>
                <Select
                  size="large"
                  placeholder="Chọn loại"
                  value={filters.type || undefined}
                  onChange={(value) =>
                    setFilters({ ...filters, type: value, brand: "" })
                  }
                  className="w-full rounded-xl"
                >
                  <Option value="">Tất cả</Option>
                  <Option value="Car EV">🚗 Xe điện</Option>
                  <Option value="Battery">🔋 Pin</Option>
                </Select>
              </div>

              {/* Brand */}
              <div>
                <label
                  className={`block mb-2 font-bold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Thương hiệu
                </label>
                <Select
                  size="large"
                  placeholder="Chọn thương hiệu"
                  value={filters.brand || undefined}
                  onChange={(value) => setFilters({ ...filters, brand: value })}
                  disabled={!filters.type}
                  className="w-full rounded-xl"
                >
                  <Option value="">Tất cả</Option>
                  {currentBrands.map((brand) => (
                    <Option key={brand} value={brand}>
                      {brand}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Year Range */}
              <div className="md:col-span-2">
                <label
                  className={`block mb-2 font-bold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Năm sản xuất: {filters.yearRange[0]} - {filters.yearRange[1]}
                </label>
                <Slider
                  range
                  min={2015}
                  max={2025}
                  value={filters.yearRange}
                  onChange={(value) =>
                    setFilters({ ...filters, yearRange: value })
                  }
                />
              </div>

              {/* Price Range */}
              <div>
                <label
                  className={`block mb-2 font-bold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Giá từ (triệu VNĐ)
                </label>
                <Input
                  size="large"
                  type="number"
                  placeholder="VD: 100"
                  value={filters.minPrice ? filters.minPrice / 1000000 : ""}
                  onChange={(e) => {
                    const val = e.target.value
                      ? parseFloat(e.target.value) * 1000000
                      : null;
                    setFilters({ ...filters, minPrice: val });
                  }}
                  className="rounded-xl"
                  min={0}
                />
              </div>

              <div>
                <label
                  className={`block mb-2 font-bold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Giá đến (triệu VNĐ)
                </label>
                <Input
                  size="large"
                  type="number"
                  placeholder="VD: 1000"
                  value={filters.maxPrice ? filters.maxPrice / 1000000 : ""}
                  onChange={(e) => {
                    const val = e.target.value
                      ? parseFloat(e.target.value) * 1000000
                      : null;
                    setFilters({ ...filters, maxPrice: val });
                  }}
                  className="rounded-xl"
                  min={0}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSearch}
                className="flex-1 py-3 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105 shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                  boxShadow: isDark
                    ? "0 10px 40px rgba(239, 68, 68, 0.4)"
                    : "0 10px 40px rgba(59, 130, 246, 0.4)",
                }}
              >
                <Search className="w-5 h-5 inline-block mr-2" />
                Tìm kiếm
              </button>

              <button
                onClick={handleReset}
                className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
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
                <X className="w-5 h-5 inline-block mr-2" />
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div
              className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: colors.primary[0],
                borderTopColor: "transparent",
              }}
            />
            <p
              className={`mt-4 text-lg ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Đang tìm kiếm sản phẩm...
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length === 0 && (
          <div className="text-center py-20">
            <Empty
              description={
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Không tìm thấy sản phẩm nào phù hợp
                </span>
              }
            />
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((product) => (
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
                        <Heart
                          className="w-5 h-5"
                          style={{ color: "#ef4444" }}
                        />
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
            <div className="mt-12 flex justify-center">
              <Pagination
                current={currentPage}
                total={results.length}
                pageSize={pageSize}
                onChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                showSizeChanger={false}
                className={isDark ? "dark-pagination" : ""}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

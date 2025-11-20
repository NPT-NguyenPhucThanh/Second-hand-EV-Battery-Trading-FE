// src/features/home/components/Listings.jsx
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { getProducts } from "../../../utils/services/productService"; // Import the service

function currency(value) {
  return value.toLocaleString("vi-VN") + " ₫";
}

export default function FeaturedListings() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch products using the service
  const fetchProducts = async (page = 0, type = "") => {
    setLoading(true);
    try {
      const data = await getProducts(page, pageSize, type);
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on mount and when page or type changes
  useEffect(() => {
    fetchProducts(currentPage, typeFilter);
    // Cuộn về đầu trang khi đổi trang
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, typeFilter]);

  // Handle type filter change
  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  return (
    <section className="container mx-auto mt-8">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-lg font-semibold">Mới nhất</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleTypeFilterChange("")}
            className={`px-3 py-1 rounded ${
              !typeFilter ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => handleTypeFilterChange("Car EV")}
            className={`px-3 py-1 rounded ${
              typeFilter === "Car EV" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Car EV
          </button>
          <button
            onClick={() => handleTypeFilterChange("Battery")}
            className={`px-3 py-1 rounded ${
              typeFilter === "Battery"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Battery
          </button>
        </div>
      </div>

      {loading && <div className="text-center">Đang tải...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((item) => (
          <Link
            key={item.productid}
            to={`/listings/${item.productid}`}
            className="transition-shadow bg-white border rounded-xl hover:shadow-md cursor-pointer"
          >
            <div className="relative">
              <img
                src={item.images[0] || "/placeholder-image.jpg"}
                alt={item.productname}
                className="object-cover w-full h-40 rounded-t-xl"
                loading="lazy"
              />
              {item.inWarehouse && (
                <span className="absolute left-2 top-2 rounded bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
                  Trong kho
                </span>
              )}
            </div>

            <div className="p-3">
              <div className="text-sm font-medium text-gray-800 line-clamp-2">
                {item.productname}
              </div>
              <div className="mt-1 text-[#007BFF] font-semibold">
                {currency(item.cost)}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {item.brandInfo
                  ? `${item.brandInfo.brand} ${
                      item.type === "Car EV"
                        ? item.brandInfo.year
                        : item.brandInfo.capacity
                    }`
                  : item.type}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 items-center">
          {/* Previous button */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
            disabled={currentPage === 0 || loading}
            className="px-3 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            «
          </button>

          {/* Page numbers */}
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                currentPage === index
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              disabled={loading}
            >
              {index + 1}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
            }
            disabled={currentPage === totalPages - 1 || loading}
            className="px-3 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            »
          </button>
        </div>
      )}
    </section>
  );
}

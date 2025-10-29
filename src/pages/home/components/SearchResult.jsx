// src/features/home/pages/SearchResult.jsx
import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { searchProducts } from "../../../utils/services/productService";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResult() {
  const query = useQuery();
  const keyword = query.get("keyword") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await searchProducts({ keyword });
        setResults(res?.products || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (keyword) fetchResults();
  }, [keyword]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Đang tìm kiếm sản phẩm...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Kết quả tìm kiếm cho:{" "}
          <span className="text-blue-600">"{keyword}"</span>
        </h2>

        {results.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Không tìm thấy sản phẩm nào phù hợp.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((p) => (
              <Link
                key={p.productid}
                to={`/listings/${p.productid}`}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={p.thumbnail || p.images?.[0] || "/noimage.png"}
                  alt={p.productname}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {p.productname}
                  </h3>
                  <p className="text-green-600 font-bold mt-1">
                    {p.price?.toLocaleString("vi-VN")} ₫
                  </p>
                  <p className="text-gray-500 text-sm mt-1">{p.brand}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

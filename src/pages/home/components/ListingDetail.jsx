// src/features/home/components/ListingDetail.jsx
import { useParams, Link } from "react-router-dom";
import { DEMO } from "../../../data";
import { Heart, Star } from "lucide-react";

function currency(value) {
  return value.toLocaleString("vi-VN") + " ₫";
}

export default function ListingDetail() {
  const { id } = useParams();
  const item = DEMO.find((it) => it.id === id);

  if (!item) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-gray-600 text-lg">❌ Không tìm thấy sản phẩm.</p>
        <Link
          to="/"
          className="inline-block mt-4 bg-[#007BFF] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const handleBuyNow = () => {
    alert(`Bạn đã chọn mua: ${item.title} - ${currency(item.price)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/"
        className="text-[#007BFF] hover:underline text-sm mb-4 inline-block"
      >
        ← Quay lại
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow-sm">
        {/* Ảnh sản phẩm + reviews */}
        <div>
          <div className="relative">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-auto rounded-xl object-cover"
            />
            {item.badge && (
              <span className="absolute left-2 top-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                {item.badge}
              </span>
            )}
            <button
              aria-label="Yêu thích"
              className="absolute right-2 top-2 rounded-full bg-white/90 p-2 hover:bg-white shadow-sm"
            >
              <Heart className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Reviews */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Đánh giá từ người dùng</h2>
            {item.reviews.length > 0 ? (
              <ul className="space-y-4">
                {item.reviews.map((review, index) => (
                  <li key={index} className="border-b pb-2">
                    <div className="flex items-center mb-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                      {[...Array(5 - review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gray-300" />
                      ))}
                      <span className="ml-2 text-gray-700 font-medium">{review.name}</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Chưa có đánh giá nào.</p>
            )}
          </div>
        </div>

        {/* Thông tin chi tiết sản phẩm + người bán */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">{item.title}</h1>
          <div className="text-[#007BFF] text-xl font-bold mb-3">
            {currency(item.price)}
          </div>
          <p className="text-gray-600 mb-4 leading-relaxed">{item.meta}</p>

          {item.seller && (
            <div className="mb-6">
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Người bán:</span>{" "}
                <Link
                  to={`/sellers/${item.seller.id}`}
                  className="text-[#007BFF] hover:underline font-medium"
                >
                  {item.seller.displayName}
                </Link>
              </p>
              <p className="text-gray-500 text-sm">Email: {item.seller.email}</p>
              <p className="text-gray-500 text-sm">SĐT: {item.seller.phone}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button className="bg-[#007BFF] text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Liên hệ ngay
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

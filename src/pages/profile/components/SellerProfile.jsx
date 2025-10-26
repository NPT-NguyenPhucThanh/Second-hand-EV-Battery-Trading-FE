// src/pages/profile/components/SellerProfile.jsx
import { useParams, Link } from "react-router-dom";
import { DEMO } from "../../../data";

export default function SellerProfile() {
  const { id } = useParams();
  const seller = DEMO.find((item) => item.seller?.id === id)?.seller;

  if (!seller) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="text-gray-600 text-lg mb-4">❌ Không tìm thấy người bán.</p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const products = DEMO.filter((item) => item.seller?.id === seller.id);

  // Format ngày
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("vi-VN");

  return (
    <div className="container mx-auto px-4 py-10">
      <Link
        to="/"
        className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-6"
      >
        ← Quay lại
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{seller.displayName}</h1>
        <div className="text-gray-700 mb-6 space-y-2">
          <p><span className="font-medium">Email:</span> {seller.email}</p>
          <p><span className="font-medium">Số điện thoại:</span> {seller.phone}</p>
          <p><span className="font-medium">Ngày sinh:</span> {formatDate(seller.dob)}</p>
          <p><span className="font-medium">Tham gia từ:</span> {formatDate(seller.createdAt)}</p>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Sản phẩm của người bán</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">Người bán chưa có sản phẩm nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <Link
                key={item.id}
                to={`/listings/${item.id}`}
                className="group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.badge && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-gray-800 font-medium text-sm mb-1 truncate">{item.title}</h3>
                  <p className="text-blue-600 font-semibold text-sm">{item.price.toLocaleString()}₫</p>
                  <p className="text-gray-500 text-xs mt-1">{item.meta}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

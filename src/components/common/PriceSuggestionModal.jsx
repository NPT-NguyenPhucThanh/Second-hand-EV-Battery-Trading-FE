import { X, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

export default function PriceSuggestionModal({ isOpen, onClose, suggestion }) {
  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen || !suggestion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Gợi Ý Giá</h2>
                <p className="text-white/80 text-sm mt-1">
                  Được hỗ trợ bởi Gemini AI
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Price Range */}
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Khoảng giá gợi ý
                </h3>
              </div>

              {/* Price boxes */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Thấp nhất</p>
                  <p className="text-lg font-bold text-gray-700">
                    {formatPrice(suggestion.minPrice)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-md">
                  <p className="text-xs mb-1">Đề xuất</p>
                  <p className="text-xl font-bold">
                    {formatPrice(suggestion.suggestedPrice)}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Cao nhất</p>
                  <p className="text-lg font-bold text-gray-700">
                    {formatPrice(suggestion.maxPrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Market Insight */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-200 rounded-lg flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Phân tích thị trường
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {suggestion.marketInsight}
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Giá tham khảo từ Gemini AI. Giá thực tế
                có thể thay đổi tùy vào tình trạng cụ thể của sản phẩm và điều
                kiện thị trường.
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

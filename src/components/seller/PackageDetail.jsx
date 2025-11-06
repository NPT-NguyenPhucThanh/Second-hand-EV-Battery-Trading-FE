// src/components/seller/PackageDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Spin, Alert, Button, message } from "antd"; // Import 'message'
import { usePackages } from "../../services/packageService";
import { 
  CheckCircleFilled, 
  CarOutlined, 
  ClockCircleOutlined, 
  DollarOutlined 
} from "@ant-design/icons";

// === START: IMPORT THÊM ===
import { toast } from "sonner";
import api from "../../utils/api"; // Import wrapper API
import { createPaymentUrl } from "../../utils/services/paymentService"; // Import service thanh toán
// === END: IMPORT THÊM ===

const BatteryIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12h3m0 0h3m-3 0v6a2 2 0 002 2h8a2 2 0 002-2v-6m-3-4V6a2 2 0 00-2-2H8a2 2 0 00-2 2v2m7 8v2m-2-2v2m4-2v2"
    />
  </svg>
);

export default function PackageDetail() {
  const { packageid } = useParams();
  const navigate = useNavigate();
  const { getPackageById } = usePackages();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === START: THÊM STATE LOADING CHO NÚT MUA ===
  const [isSubmitting, setIsSubmitting] = useState(false);
  // === END: THÊM STATE ===

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPackageById(packageid);
        setPkg(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [packageid, getPackageById]);

  // === START: HÀM XỬ LÝ MUA GÓI (SỬA LẠI API ĐÚNG) ===
  const handlePurchase = async () => {
    if (!pkg) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Đang tạo đơn hàng, vui lòng chờ...");

    try {
      // BƯỚC 1: Gọi API tạo đơn hàng (SỬ DỤNG API "PURCHASE" MỚI ĐÚNG)
      const orderResponse = await api.post(
        "api/seller/packages/purchase", 
        { packageId: pkg.packageid } // Gửi packageId trong body
      );

      if (orderResponse.status !== "success") {
        // Lỗi này xảy ra khi backend từ chối (ví dụ: đã có gói)
        throw new Error(orderResponse.message || "Không thể tạo đơn hàng");
      }

      const orderId = orderResponse.orderId;
      if (!orderId) {
        throw new Error("Không nhận được Order ID từ máy chủ.");
      }

      toast.loading("Đang tạo link thanh toán...", { id: loadingToast });

      // BƯỚC 2: Gọi API tạo URL thanh toán (theo PaymentController.java)
      const paymentResponse = await createPaymentUrl(
        orderId, 
        "PACKAGE_PURCHASE" // Loại giao dịch
      );

      if (paymentResponse.status !== "success") {
        throw new Error(paymentResponse.message || "Không thể tạo link thanh toán");
      }

      const { paymentUrl, transactionCode } = paymentResponse;

      // BƯỚC 3: Lưu thông tin và chuyển hướng
      localStorage.setItem("pendingTransaction", transactionCode);
      localStorage.setItem("pendingOrderId", orderId);

      toast.success("Đang chuyển hướng đến cổng thanh toán...", { id: loadingToast });
      
      // Chuyển hướng người dùng sang trang VNPay
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 1500);

    } catch (err) {
      console.error("Lỗi khi mua gói:", err);
      let errorMessage = "Mua gói thất bại. Vui lòng thử lại.";
      try {
        // Cố gắng parse lỗi JSON từ server (nếu có)
        const errorJson = JSON.parse(err.message);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        // Nếu không phải JSON, dùng message gốc
        errorMessage = err.message || errorMessage;
      }
      
      toast.error(errorMessage, { id: loadingToast, duration: 5000 });
      setIsSubmitting(false); // Mở lại nút nếu lỗi
    }
  };
  // === END: HÀM XỬ LÝ MUA GÓI ===

  if (loading) return <div className="flex justify-center items-center min-h-screen pt-20"><Spin size="large" /></div>;
  if (error) return <Alert message="Lỗi" description={error} type="error" showIcon className="max-w-2xl mx-auto mt-20" />;
  if (!pkg) return <div className="text-center mt-20 pt-20">Không tìm thấy gói</div>;

  const isCar = pkg.packageType === "CAR";
  const limit = isCar
    ? (pkg.maxCars >= 999 ? "Không giới hạn" : `${pkg.maxCars} xe`)
    : (pkg.maxBatteries >= 999 ? "Không giới hạn" : `${pkg.maxBatteries} pin`);

  const features = [
    { icon: <CheckCircleFilled className="text-green-500" />, text: `Đăng tối đa ${limit}` },
    { icon: <CarOutlined className="text-blue-600" />, text: "Hiển thị nổi bật trên trang chủ" },
    { icon: <BatteryIcon className="text-green-600 w-6 h-6" />, text: "Hỗ trợ ưu tiên từ đội ngũ" },
    { icon: <ClockCircleOutlined className="text-purple-600" />, text: "Báo cáo doanh thu chi tiết" },
  ];

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold">{pkg.name}</h1>
                <p className="text-xl mt-2 opacity-90">
                  {isCar ? "Gói đăng bán xe điện" : "Gói đăng bán pin"}
                </p>
              </div>
              <Link to="/seller/packages">
                <Button type="primary" ghost size="large" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Quay lại
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarOutlined className="text-3xl" />
                    <p className="text-5xl font-bold">{Number(pkg.price).toLocaleString("vi-VN")}đ</p>
                  </div>
                  <p className="text-xl opacity-90">/ {pkg.durationMonths} tháng</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-blue-200">
                  <div className="flex items-center gap-3 text-lg">
                    {isCar ? <CarOutlined className="text-2xl text-blue-600" /> : <BatteryIcon className="text-green-600 w-6 h-6" />}
                    <span className="font-medium">Số lượng đăng:</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-2">{limit}</p>
                </div>

                {/* === START: CẬP NHẬT NÚT MUA GÓI === */}
                <Button
                  type="primary"
                  size="large"
                  onClick={handlePurchase} // SỬA: GỌI HÀM MỚI
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-600 shadow-lg"
                  disabled={pkg.isActive || isSubmitting} // SỬA: THÊM isSubmitting
                  loading={isSubmitting} // SỬA: THÊM loading state
                >
                  {pkg.isActive ? "ĐÃ KÍCH HOẠT" : (isSubmitting ? "Đang xử lý..." : "MUA NGAY")}
                </Button>
                {/* === END: CẬP NHẬT NÚT MUA GÓI === */}
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
                    Mô tả gói
                  </h3>
                  <div
                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-200"
                    dangerouslySetInnerHTML={{ __html: pkg.description || "Chưa có mô tả chi tiết." }}
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full"></span>
                    Tính năng nổi bật
                  </h3>
                  <div className="space-y-4">
                    {features.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="text-2xl">{f.icon}</div>
                        <p className="text-gray-700 font-medium">{f.text}</p>
                      </div>
                    ))}
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
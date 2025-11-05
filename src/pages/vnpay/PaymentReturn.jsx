// src/features/home/components/PaymentReturn.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { toast } from "sonner";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  // PaymentReturn.jsx – thêm hiển thị số tiền + mã giao dịch
  useEffect(() => {
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_Amount = searchParams.get("vnp_Amount");
    const txnRef = searchParams.get("vnp_TxnRef");

    if (vnp_ResponseCode === "00") {
      setStatus("success");
      toast.success(
        <div>
          <p className="font-bold">Thanh toán thành công!</p>
          <p>
            Mã GD: <span className="font-mono">{txnRef}</span>
          </p>
          <p>
            Số tiền:{" "}
            <span className="font-bold text-green-600">
              {(vnp_Amount / 100).toLocaleString("vi-VN")} ₫
            </span>
          </p>
        </div>,
        { duration: 10000 }
      );
    } else {
      setStatus("failed");
      toast.error(`Thanh toán thất bại (mã lỗi: ${vnp_ResponseCode})`);
    }
  }, [searchParams]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        {status === "checking" && (
          <>
            <div className="animate-spin h-16 w-16 border-8 border-blue-500 rounded-full border-t-transparent mx-auto mb-6"></div>
            <p className="text-xl text-gray-700">Đang kiểm tra kết quả...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-green-600 mb-4">
              Thành công!
            </h1>
            <p className="text-gray-700 mb-8">
              Đơn hàng của bạn đã được xác nhận.
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-3 mx-auto"
            >
              Xem đơn hàng của tôi
              <ArrowRight />
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-red-600 mb-4">Thất bại!</h1>
            <p className="text-gray-700 mb-8">Thanh toán không thành công.</p>
            <button
              onClick={() => navigate(-2)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Thử lại thanh toán
            </button>
          </>
        )}
      </div>
    </div>
  );
}

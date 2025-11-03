// src/services/packagePayment.js
import api from "../utils/api"; // ← Dùng api.js bạn cung cấp

/**
 * GỌI API: /api/payment/init-package-payment
 * → Khởi tạo thanh toán gói (trả về QR + mã GD)
 * @param {Object} payload
 * @param {number} payload.packageId - ID gói
 * @param {string} [payload.customerName] - Tên khách (mặc định: "Khách hàng")
 * @param {string} [payload.customerEmail] - Email (mặc định: "khach@example.com")
 * @param {string} [payload.customerPhone] - SĐT (mặc định: "0900000000")
 * @returns {Promise<Object>} { qrCode, transactionCode, amount }
 */
export const initPackagePayment = async (payload) => {
  const params = new URLSearchParams();
  params.append("packageId", payload.packageId);
  params.append("customerName", payload.customerName || "Khách hàng");
  params.append("customerEmail", payload.customerEmail || "khach@example.com");
  params.append("customerPhone", payload.customerPhone || "0900000000");

  const data = await api.post(`/api/payment/init-package-payment?${params.toString()}`);

  if (data.status !== "success") {
    throw new Error(data.message || "Khởi tạo thanh toán thất bại");
  }

  return {
    qrCode: data.qrCode,
    transactionCode: data.transactionCode,
    amount: data.amount,
  };
};

/**
 * GIẢ LẬP THANH TOÁN → GỌI BE LƯU DB
 * @param {string} transactionCode - Mã giao dịch
 * @param {number} amount - Số tiền
 * @param {number} packageId - ID gói
 * @returns {Promise<Object>} Kết quả từ BE
 */
export const mockPackagePayment = async (transactionCode, amount, packageId) => {
  const params = new URLSearchParams({ transactionCode, amount, packageId });
  const data = await api.get(`/api/payment/mock-payment?${params.toString()}`);

  if (data.status !== "success") {
    throw new Error(data.message || "Giả lập thanh toán thất bại");
  }

  return data;
};

/**
 * LẤY KẾT QUẢ GIAO DỊCH TỪ DB
 * @param {string} transactionCode - Mã giao dịch
 * @returns {Promise<Object>} Dữ liệu giao dịch từ DB
 */
export const getTransactionStatus = async (transactionCode) => {
  return await api.get(`/api/payment/transaction-status/${transactionCode}`);
};

/**
 * LẤY DANH SÁCH GÓI ĐÃ MUA CỦA USER
 * @returns {Promise<Array>} Danh sách gói đã mua
 */
export const getMyPackages = async () => {
  try {
    const data = await api.get("/api/payment/my-packages");
    return data.purchases || [];
  } catch (error) {
    console.error("Lỗi getMyPackages:", error);
    throw error;
  }
};
// src/services/packagePayment.js
import { post } from "../utils/api";

/**
 * GỌI API: /api/payment/init-package-payment
 * @param {Object} payload - { packageId, customerName, customerEmail, customerPhone }
 * @returns {Promise} { qrCode, transactionCode }
 */
export const initPackagePayment = async (payload) => {
  try {
    const response = await post("/api/payment/init-package-payment", null, {
      params: {
        packageId: payload.packageId,
        customerName: payload.customerName || "Khách hàng",
        customerEmail: payload.customerEmail || "khach@example.com",
        customerPhone: payload.customerPhone || "0900000000",
      },
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Không thể khởi tạo thanh toán");
  }
};
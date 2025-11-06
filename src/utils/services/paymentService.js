// src/utils/services/paymentService.js
import api from "../api";

/**
 * Tạo URL thanh toán VNPay
 * @param {number} orderId - ID đơn hàng
 * @param {"DEPOSIT" | "FINAL_PAYMENT" | "PACKAGE_PURCHASE"} transactionType - Loại giao dịch
 * @returns {Promise<{paymentUrl: string, transactionCode: string}>}
 */
export const createPaymentUrl = async (orderId, transactionType) => {
  try {
    const response = await api.post(
      "api/payment/create-payment-url",
      null,
      { orderId, transactionType }
    );
    return response;
  } catch (error) {
    console.error("Lỗi tạo payment URL:", error);
    throw error;
  }
};

/**
 * Kiểm tra trạng thái giao dịch
 * @param {string} transactionCode - Mã giao dịch
 * @returns {Promise<{status: string, transaction: object}>}
 */
export const getTransactionStatus = async (transactionCode) => {
  try {
    const response = await api.get(
      `api/payment/transaction-status/${transactionCode}`
    );
    return response;
  } catch (error) {
    console.error("Lỗi kiểm tra trạng thái:", error);
    throw error;
  }
};

/**
 * Mock thanh toán thành công (dùng cho testing)
 * @param {string} transactionCode - Mã giao dịch
 * @returns {Promise<object>}
 */
export const mockPaymentSuccess = async (transactionCode) => {
  try {
    const response = await api.get("api/payment/mock-payment", {
      transactionCode,
    });
    return response;
  } catch (error) {
    console.error("Lỗi mock payment:", error);
    throw error;
  }
};

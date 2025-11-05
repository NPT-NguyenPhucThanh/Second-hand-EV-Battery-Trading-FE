// src/features/checkout/paymentService.js
import api from "../../utils/api";
import { toast } from "sonner";

// Tạo URL thanh toán VNPay
export const createPaymentUrl = async (orderId, amount, type) => {
  const res = await api.post("api/payment/create-payment-url", null, {
    params: { orderId, amount, transactionType: type },
  });
  return res.data;
};

// Mock thanh toán thành công (sandbox)
export const mockPaymentSuccess = async (transactionCode, amount, orderId) => {
  const res = await api.post("api/payment/mock-success", {
    transactionCode,
    amount,
    orderId,
  });
  return res.data;
};

// Kiểm tra trạng thái giao dịch
export const getTransactionStatus = async (transactionCode) => {
  const res = await api.get("api/payment/status", {
    params: { transactionCode },
  });
  return res.data;
};
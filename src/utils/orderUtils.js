// src/utils/orderUtils.js

// Hàm đánh số: cũ nhất = 1
export const getOrderNumber = (orders, orderId) => {
  if (!orders || !orderId) return null;
  const sorted = [...orders].sort(
    (a, b) => new Date(a.createdat) - new Date(b.createdat) // cũ → mới
  );
  const index = sorted.findIndex(o => o.orderid === orderId);
  return index !== -1 ? index + 1 : null;
};
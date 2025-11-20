import { get, post } from "../utils/api";

// Thêm hàm mới này
export const getOrders = async () => {
  const response = await get("api/staff/orders");
  return response;
};

export const getOrdersByStatus = async (status) => {
  const response = await get(`api/staff/orders/status/${status}`);
  return response;
};

export const approveOrder = async (orderId, payload) => {
  const response = await post(`api/staff/orders/${orderId}/approve`, payload);
  return response;
};
export const getOrderDetails = async (orderId) => {
  // Giả sử backend có API này cho staff
  const response = await get(`api/staff/orders/${orderId}`);
  return response;
};

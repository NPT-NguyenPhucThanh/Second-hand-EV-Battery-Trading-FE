import { get, post } from "../utils/api";

export const getRefund = async (refundId) => {
  const data = await get(`api/staff/refunds/${refundId}`);
  return data;
};

export const getAllRefund = async () => {
  const data = await get(`api/staff/refunds`);
  return data;
};

export const getRefundPending = async () => {
  const data = await get("api/staff/refunds/pending");
  return data;
};

export const getRefundOrder = async (orderId) => {
  const data = await get(`api/staff/refunds/order/${orderId}`);
  return data;
};

export const processRefund = async (refundId, payload) => {
  const response = await post(`api/staff/refunds/${refundId}/process`, payload);
  return response;
};

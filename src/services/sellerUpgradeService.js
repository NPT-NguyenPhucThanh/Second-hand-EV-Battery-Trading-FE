// src/services/staffService.js
import { get, post } from "../utils/api";

export const getSellerUpgradeRequests = async () => {
  const data = await get("api/staff/seller-upgrade/requests");
  return data;
};

export const approveSellerRequest = async (userId, body = {}) => {
  const response = await post(`api/staff/seller-upgrade/${userId}/approve`, body);
  return response;
};

export const rejectSellerRequest = async (userId, reason = "Không đủ điều kiện") => {
  const response = await post(`api/staff/seller-upgrade/${userId}/reject`, { reason });
  return response;
};
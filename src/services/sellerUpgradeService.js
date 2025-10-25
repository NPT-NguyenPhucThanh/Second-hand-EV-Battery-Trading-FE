
import { get, post } from "../utils/api"; 

export const getSellerUpgradeRequests = async () => {
  const data = await get("api/manager/seller-upgrade/requests");
  return data;
};

export const approveSellerRequest = async (userId, payload) => {
    const response = await post(`api/manager/seller-upgrade/${userId}/approve`, payload);
    return response.data;
};

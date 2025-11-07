import { get, post } from "../utils/api"; 

export const getSellerUpgradeRequests = async () => {
  const data = await get("api/staff/seller-upgrade/requests");
  return data;
};

export const approveSellerRequest = async (userId, body) => {
    const response = await post(`api/staff/seller-upgrade/${userId}/approve`, body);
    return response;
};

export const requestSellerUpgrade = async (formData) => {
    const response = await post("api/client/request-seller-upgrade", formData);
    return response;
};

export const resubmitSellerUpgrade = async (formData) => {
    const response = await post("api/client/seller-upgrade/resubmit", formData);
    return response;
};

export const getSelfUpgradeStatus = async () => {
    const data = await get("api/client/seller-upgrade/status");
    return data;
};

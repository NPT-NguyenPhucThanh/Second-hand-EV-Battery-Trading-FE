import { post, get } from "../utils/api"; 

export const getAllDisputes = async () => {
    const response = await get(`api/manager/disputes`);
    return response;
};

export const resolveDispute = async (disputeId, payload) => {
    const response = await post(`api/manager/disputes/${disputeId}/resolve`, payload);
    return response;
};
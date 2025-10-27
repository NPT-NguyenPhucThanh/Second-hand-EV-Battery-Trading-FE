import { post } from "../utils/api"; 


export const resolveDispute = async (disputeId, payload) => {
    const response = await post(`api/staff/disputes/${disputeId}/resolve`, payload);
    return response.data;
};


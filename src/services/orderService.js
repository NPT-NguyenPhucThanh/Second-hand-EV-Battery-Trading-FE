import { post } from "../utils/api"; 


export const approveOrder = async (orderId, payload) => {
    const response = await post(`api/staff/orders/${orderId}/approve`, payload);
    return response.data;
};


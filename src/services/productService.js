import { post } from "../utils/api"; 


export const inputInspection = async (productId, payload) => {
    const response = await post(`api/staff/products/${productId}/input-inspection`, payload);
    return response.data;
};

export const approveProduct = async (productId, payload) => {
    const response = await post(`api/staff/products/${productId}/approve-preliminary`, payload);
    return response.data;
};
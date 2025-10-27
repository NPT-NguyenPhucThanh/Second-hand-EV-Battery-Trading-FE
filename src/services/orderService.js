import { get, post } from "../utils/api";

// Thêm hàm mới này
export const getPendingApprovalOrders = async () => {
    const response = await get('api/staff/orders/pending-approval');
    return response;
};

export const approveOrder = async (orderId, payload) => {
    // Sửa lại để trả về boolean cho dễ xử lý
    const response = await post(`api/staff/orders/${orderId}/approve`, payload);
    return response === "Order processed";
};
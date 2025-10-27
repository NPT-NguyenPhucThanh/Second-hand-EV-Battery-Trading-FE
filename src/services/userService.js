import { get, post } from "../utils/api"; 

// Lấy tất cả user cho Manager
export const getAllUser = async () => {
  const data = await get(`api/manager/users`);
  return data;
};

// Lấy chi tiết user
export const getUser = async (id) => {
  const data = await get(`api/manager/users/${id}`);
  return data;
};

// Khóa hoặc mở khóa user
export const lockUserById = async (userId, isLock) => {
    // API backend cần một object { lock: boolean }
    const payload = { lock: isLock };
    const response = await post(`api/manager/users/${userId}/lock`, payload);
    return response;
};

// API cho Staff (giữ nguyên)
export const getCustomer = async (id) => {
  const data = await get(`api/staff/users/${id}`);
  return data;
};

export const getAllCustomer = async () => {
  const data = await get(`api/staff/users`);
  return data;
};
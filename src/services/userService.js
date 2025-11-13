import { get, post, put } from "../utils/api"; 

export const getProfile = async () => {
  const data = await get("api/client/profile");
  return data; 
};

export const updateProfile = async (profileData) => {
  const response = await put("api/client/profile", profileData);
  return response; 
};

export const changePassword = async (oldPassword, newPassword) => {
  const params = new URLSearchParams();
  params.append("oldPassword", oldPassword);
  params.append("newPassword", newPassword);
  
  const response = await post(`api/client/change-password?${params.toString()}`);
  return response; 
};

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
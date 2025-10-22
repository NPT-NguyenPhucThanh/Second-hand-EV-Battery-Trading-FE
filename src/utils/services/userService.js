import api from "../api";

export const registerUser = async (userData) => {
  return api.post("api/auth/register", userData);
};

export const loginUser = async (credentials) => {
  const res = await api.post("api/auth/login", credentials);
  return res; // chỉ lấy phần data từ response
};

export const logoutUser = async () => {
  return api.post("api/auth/logout");
};

// src/utils/api.js
const API_DOMAIN = "http://localhost:8080/";

const getToken = () => localStorage.getItem("token");

// === HÀM CŨ – GIỮ NGUYÊN 100% CHO CÁC FILE KHÁC ===
export const get = async (path) => {
  const token = getToken();
  const response = await fetch(`${API_DOMAIN}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.json();
};

export const post = async (path, data) => {
  const token = getToken();
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isFormData && { "Content-Type": "application/json" }),
    },
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// === CÁC HÀM KHÁC – KHÔNG ĐỘNG GÌ ===
export const put = async (path, data) => { /* giữ nguyên */ };
export const del = async (path) => { /* giữ nguyên */ };
export const patch = async (path, data) => { /* giữ nguyên */ };

// === HÀM MỚI: CHỈ DÙNG CHO UPLOAD CCCD – KHÔNG ẢNH HƯỞNG FILE KHÁC ===
export const postUpload = async (path, formData) => {
  const token = getToken();
  const res = await fetch(`${API_DOMAIN}${path}`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // KHÔNG ĐẶT Content-Type → trình duyệt tự thêm boundary
    },
    body: formData,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Lỗi ${res.status}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export default { get, post, put, del, patch, postUpload };
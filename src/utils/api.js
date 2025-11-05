// src/utils/api.js
const API_DOMAIN = "http://localhost:8080/";

const getToken = () => localStorage.getItem("token");

// === THÊM: Wrapper để tự động xử lý token & lỗi toàn cục ===
const withAuth = (fetchFn) => async (...args) => {
  const token = getToken();

  // Gọi hàm fetch gốc
  const response = await fetchFn(...args);

  // === THÊM: Xử lý 401/403 → xóa token + redirect login ===
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    // Dùng toast nếu có (sonner đã import ở nhiều nơi)
    if (typeof window !== "undefined" && window.toast) {
      window.toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    // Redirect về login (tránh circular import)
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  }

  return response;
};

// === Giữ nguyên toàn bộ hàm cũ, chỉ bọc lại bằng withAuth ===
export const get = withAuth(async (path) => {
  const token = getToken();
  const response = await fetch(`${API_DOMAIN}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.json();
});

export const post = withAuth(async (path, data) => {
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
});

export const put = withAuth(async (path, data) => {
  const token = getToken();
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "PUT",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(data && { "Content-Type": "application/json" }),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  const text = await response.text();

  if (!response.ok) throw new Error(text);

  return text;
});

export const del = withAuth(async (path) => {
  const token = getToken();
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
});

export const patch = withAuth(async (path, data) => {
  const token = getToken();
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });
  return response.json();
});

export default { get, post, put, del, patch };
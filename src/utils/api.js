const API_DOMAIN = "http://localhost:8080/";

const getToken = () => localStorage.getItem("token");

// === Build URL with query params ===
const buildUrl = (path, params) => {
  if (!params) return `${API_DOMAIN}${path}`;

  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null)
  ).toString();

  return `${API_DOMAIN}${path}${queryString ? `?${queryString}` : ""}`;
};

// === Wrapper để tự động xử lý token & lỗi toàn cục ===
const withAuth =
  (fetchFn) =>
  async (...args) => {
    const response = await fetchFn(...args);

    // Xử lý 401/403 → xóa token + redirect login
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined" && window.toast) {
        window.toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      }
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }

    return response;
  };

// === GET with query params ===
export const get = withAuth(async (path, params = null) => {
  const token = getToken();
  const url = buildUrl(path, params);

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || "Request failed" };
    }
    const error = new Error(errorData.message || "Request failed");
    error.response = { status: response.status, data: errorData };
    throw error;
  }

  return response.json();
});

// === POST with body AND query params ===
export const post = withAuth(async (path, data = null, params = null) => {
  const token = getToken();
  const url = buildUrl(path, params);
  const isFormData = data instanceof FormData;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isFormData && data && { "Content-Type": "application/json" }),
    },
    ...(data && { body: isFormData ? data : JSON.stringify(data) }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log("=== API ERROR DEBUG ===");
    console.log("Status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));
    console.log("Error text:", errorText);
    console.log("======================");

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || "Request failed" };
    }
    const error = new Error(errorData.message || "Request failed");
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    };
    throw error;
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
});

// === PUT with query params ===
export const put = withAuth(async (path, data = null, params = null) => {
  const token = getToken();
  const url = buildUrl(path, params);

  const response = await fetch(url, {
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

// === DELETE with query params ===
export const del = withAuth(async (path, params = null) => {
  const token = getToken();
  const url = buildUrl(path, params);

  const response = await fetch(url, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || "Request failed" };
    }
    const error = new Error(errorData.message || "Request failed");
    error.response = { status: response.status, data: errorData };
    throw error;
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
});

// === PATCH with query params ===
export const patch = withAuth(async (path, data = null, params = null) => {
  const token = getToken();
  const url = buildUrl(path, params);

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  return response.json();
});

// === POST without auth (for login/register) ===
export const postNoAuth = async (path, data) => {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "POST",
    headers: {
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

export default { get, post, put, del, patch };

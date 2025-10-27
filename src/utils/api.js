const API_DOMAIN = "http://localhost:8080/";

//const getToken = () => localStorage.getItem("token"); // giả sử bạn lưu JWT ở localStorage
const getToken = () => "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX01BTkFHRVIiXSwiZGlzcGxheW5hbWUiOiJRdT9uIFRyPyBWacOqbiIsImlzTWFuYWdlciI6dHJ1ZSwiZW1haWwiOiJtYW5hZ2VyQHRyYWRpbmdldi5jb20iLCJzdWIiOiJtYW5hZ2VyIiwiaWF0IjoxNzYxNTI4NjEyLCJleHAiOjE3NjE1NjQ2MTJ9.W3f0hpxgZorlPD1B-Fn03K3bt_Vl808hmjSPHa1_ooI";

export const get = async (path) => {
  const token = getToken();
  const response = await fetch(`${API_DOMAIN}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.json();
};

export const post = async (path, data) => {
  const token = getToken();
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(data && { body: JSON.stringify(data) }),
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

export const put = async (path, data) => {
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
};


export const del = async (path) => {
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
};

export const patch = async (path, data) => {
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
};

export default { get, post, put, del, patch };

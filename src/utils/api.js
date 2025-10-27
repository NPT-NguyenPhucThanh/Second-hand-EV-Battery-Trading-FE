const API_DOMAIN = "http://localhost:8080/";

const getToken = () => localStorage.getItem("token"); // giả sử bạn lưu JWT ở localStorage
//const getToken = () => "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX1NUQUZGIl0sImRpc3BsYXluYW1lIjoiTmjDom4gVmnDqm4gSD8gVGg_bmciLCJpc01hbmFnZXIiOmZhbHNlLCJlbWFpbCI6InN0YWZmQHRyYWRpbmdldi5jb20iLCJzdWIiOiJzdGFmZiIsImlhdCI6MTc2MTU3NTg4OCwiZXhwIjoxNzYxNjExODg4fQ.l1agQ7F9GrACvE559cCIzMtJrzUP8YF-pivH3E4J0mw";

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

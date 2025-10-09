const API_DOMAIN = "http://localhost:3000/";

export const get = async (path) => {
  const response = await fetch(`${API_DOMAIN}${path}`);
  return response.json();
};
export const post = async (path, data) => {
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "POST",
    headers: {
        Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
};
export const put = async (path, data) => {
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
};
export const del = async (path) => {
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "DELETE"
  });
  return response.json();
};
export const patch = async (path, data) => {
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
};
export default { get, post, put, del, patch };
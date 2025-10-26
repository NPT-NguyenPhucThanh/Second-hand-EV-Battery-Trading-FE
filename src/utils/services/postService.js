import api from "../api";

export const createPost = async (postData) => {
  return await api.post("/api/products", postData);
  
};

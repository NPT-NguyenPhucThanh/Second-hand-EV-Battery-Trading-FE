// src/utils/services/productService.js

import { get } from "../utils/api"; // Hàm get chung đã có sẵn

export const searchProducts = async (filters) => {
  try {
    const params = new URLSearchParams();

    // Duyệt qua toàn bộ các bộ lọc (filters) mà component gửi lên
    for (const key in filters) {
      if (filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    }
 
    // Gọi API
    const response = await get(`/api/public/products/search?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

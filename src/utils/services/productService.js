// src/services/productService.js
import axios from "axios";

// Thay process.env bằng giá trị hardcode từ .env để tránh lỗi khi chạy riêng lẻ
const API_BASE_URL = "http://localhost:8080/api/public"; // Hoặc lấy từ .env nếu cần, nhưng tránh process.env khi test

export const getProducts = async (page = 0, size = 10, type = "") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      params: {
        page,
        size,
        type: type || undefined,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.status === 404
        ? "Không tìm thấy sản phẩm."
        : "Lỗi server. Vui lòng thử lại."
    );
  }
};

export const checkAuth = async (action) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/check-auth`,
      {
        params: { action },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorized: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error("Không thể kiểm tra yêu cầu đăng nhập.");
  }
};
export const searchProducts = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/search`, {
      params: {
        keyword: filters.keyword || "",
        brand: filters.brand || "",
        minYear: filters.minYear || undefined,
        maxYear: filters.maxYear || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        condition: filters.condition || "",
        type: filters.type || "",
      },
    });

    return response.data; // trả về danh sách kết quả
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    throw new Error("Không thể tìm kiếm sản phẩm. Vui lòng thử lại.");
  }
};

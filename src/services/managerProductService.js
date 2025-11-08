import { get, del } from "../utils/api"; 

/**
 * [Đề xuất] Lấy TẤT CẢ sản phẩm cho Manager.
 * API này nên được tạo mới và bảo mật phía backend (chỉ cho MANAGER).
 * Tạm thời, chúng ta sẽ giả định nó gọi API "/api/products"
 * (vốn đang trả về tất cả sản phẩm).
 */
export const getAllProductsForManager = async () => {
  try {
    // LƯU Ý BẢO MẬT: API 'GET /api/products' hiện đang public.
    // Bạn NÊN tạo một endpoint mới (ví dụ: /api/manager/products/all) 
    // và bảo mật nó chỉ cho ROLE_MANAGER.
    const products = await get("api/products"); 
    
    // API 'GET /api/products' trả về một List<Product>
    return { status: "success", products: products || [] };
  } catch (error) {
    console.error("Lỗi khi tải tất cả sản phẩm:", error);
    return { status: "error", message: error.message };
  }
};

/**
 * Gọi API xóa sản phẩm của Manager
 * API: DELETE /api/products/{id}
 *
 */
export const deleteProductByManager = async (productId) => {
  try {
    // API này CẦN được bảo mật ở backend (SecurityConfig) 
    // để chỉ cho phép ROLE_MANAGER thực thi.
    const response = await del(`api/products/${productId}`);
    return response; // Backend trả về { status: "success", message: "..." }
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
};
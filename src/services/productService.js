import { get, post } from "../utils/api"; 

export const getProductPendingInsspection = async () => {
  const data = await get("api/staff/products/pending-inspection");
  return data;
};

export const getProductPendingApproval = async () => {
  const data = await get("api/staff/products/pending-approval");
  return data;
};

// Hàm checkAuth để kiểm tra xác thực (thêm vào file để hỗ trợ logic auth, dựa trên vấn đề trước đó)
export const checkAuth = async (action) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      requiresAuth: true,
      message: "Bạn cần đăng nhập để thực hiện hành động này.",
      loginUrl: "/login", // Có thể thay đổi URL login thực tế
    };
  }

  // Optional: Xác thực token với server nếu cần (giả định có API verify)
  {
    console.error("Error verifying auth:", error);
    localStorage.removeItem("token"); // Xóa token nếu invalid
    return {
      requiresAuth: true,
      message: "Phiên đăng nhập hết hạn hoặc lỗi xác thực. Vui lòng đăng nhập lại.",
      loginUrl: "/login",
    };
  }
};

// Sửa hàm inputInspection: Thêm try-catch để xử lý lỗi, tránh crash nếu API fail
export const inputInspection = async (productId, isApprovedAndNote) => {
  try {
    const response = await post(`api/staff/products/${productId}/input-inspection`, isApprovedAndNote);
    // Giả định backend trả về chuỗi "Processed", nhưng nếu là object { message: "Processed" }, thay bằng response.message === "Processed"
    return response === "Processed"; 
  } catch (error) {
    console.error("Error in inputInspection:", error);
    // Optional: toast.error("Lỗi khi nhập kiểm tra sản phẩm."); // Nếu dùng sonner, import và dùng
    return false;
  }
};

// Sửa hàm approveProduct: Thêm try-catch để xử lý lỗi, tránh crash nếu API fail
export const approveProduct = async (productId, isApprovedAndNote) => {
  try {
    const response = await post(`api/staff/products/${productId}/approve-preliminary`, isApprovedAndNote);
    // Giả định backend trả về chuỗi "Processed", nhưng nếu là object { message: "Processed" }, thay bằng response.message === "Processed"
    return response === "Processed";
  } catch (error) {
    console.error("Error in approveProduct:", error);
    // Optional: toast.error("Lỗi khi phê duyệt sản phẩm."); // Nếu dùng sonner, import và dùng
    return false;
  }
};

/// Thêm hàm getProductById (dựa trên import ở ListingDetail.jsx)
export const getProductById = async (id) => {
  try {
    const data = await get(`api/products/${id}`); // Giả định endpoint, thay nếu khác
    return data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error; // Để component catch và hiển thị error
  }
};

// Thêm hàm addToCart để gắn API POST /api/buyer/cart/add vào service layer
export const addToCart = async (productId, quantity) => {
  try {
    const response = await post("/api/buyer/cart/add", { productId, quantity });
    // Giả định response là object { success: true } hoặc tương tự; trả về true nếu thành công
    return response.success || response === "Processed"; // Điều chỉnh dựa trên backend response thực tế
  } catch (error) {
    console.error("Error adding to cart:", error);
    // Optional: toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng."); // Nếu dùng sonner ở đây
    throw error; // Để caller (như ListingDetail.jsx) catch và hiển thị toast
  }
};
import { get, post, put } from "../api"; // Dùng chung cả client, manager, staff

// === Helper ===
const normalizeUserData = (userData) => {
  if (!userData) return null;

  return {
    ...userData,
    displayname: userData.displayname || userData.displayName || userData.username || "",
    phone: userData.phone || "",
    dateofbirth: userData.dateofbirth || userData.dateOfBirth || "",
    sellerUpgradeStatus: (userData.sellerUpgradeStatus || 
                          userData.sellerStatus || 
                          userData.seller?.upgradeStatus || 
                          "")?.toUpperCase(),
    role: userData.role || "USER"
  };
};

// === Auth / Client ===
export const registerUser = async (userData) => {
  const response = await post("api/auth/register", userData);
  return normalizeUserData(response);
};

export const loginUser = async (credentials) => {
  const response = await post("api/auth/login", credentials);
  const normalizedUser = normalizeUserData(response);
  if (normalizedUser) {
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  }
  return normalizedUser;
};

export const logoutUser = async () => {
  await post("api/auth/logout");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

export const getUserProfile = async () => {
  const response = await get("api/client/profile");
  const normalizedUser = normalizeUserData(response);
  if (normalizedUser) {
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  }
  return normalizedUser;
};

export const updateUserProfile = async (data) => {
  const response = await put("api/client/profile", data);
  return normalizeUserData(response);
};

export const changePassword = async (oldPass, newPass) => {
  return post(
    `api/client/change-password?oldPassword=${encodeURIComponent(oldPass)}&newPassword=${encodeURIComponent(newPass)}`,
    {}
  );
};

export const getSellerUpgradeStatus = async () => {
  try {
    const response = await get("api/client/seller-upgrade/status");
    if (response?.status === "success") {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...currentUser,
        sellerUpgradeStatus: response.upgradeStatus,
        rejectionReason: response.rejectionReason
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return response;
    }
    throw new Error(response?.message || "Không thể lấy trạng thái");
  } catch (error) {
    console.error("Error getting seller status:", error);
    throw error;
  }
};

export const requestSellerUpgrade = async (files) => {
  try {
    const formData = new FormData();
    formData.append("cccdFront", files.cccdFront);
    formData.append("cccdBack", files.cccdBack);

    const response = await post("api/client/request-seller-upgrade", formData);

    if (response?.status === "success") {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, sellerUpgradeStatus: "PENDING" };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return response;
    }
    throw new Error(response?.message || "Không thể gửi yêu cầu");
  } catch (error) {
    console.error("Error requesting seller upgrade:", error);
    throw error;
  }
};

// === Manager ===
export const getAllUser = async () => {
  return await get("api/manager/users");
};

export const getUser = async (id) => {
  return await get(`api/manager/users/${id}`);
};

export const lockUserById = async (userId, isLock) => {
  const payload = { lock: isLock };
  return await post(`api/manager/users/${userId}/lock`, payload);
};

// === Staff ===
export const getCustomer = async (id) => {
  return await get(`api/staff/users/${id}`);
};

export const getAllCustomer = async () => {
  return await get(`api/staff/users`);
};

// === Export default (tùy chọn) ===
export default {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getSellerUpgradeStatus,
  requestSellerUpgrade,
  getAllUser,
  getUser,
  lockUserById,
  getCustomer,
  getAllCustomer
};

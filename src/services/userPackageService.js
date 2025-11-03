import { get } from "../utils/api";

/**
 * Lấy tất cả user packages đang hoạt động (cả CAR và BATTERY)
 * API: GET /api/staff/user-packages/active
 */
export const getAllActiveUserPackages = async () => {
  try {
    const response = await get("api/staff/user-packages/active");
    return response;
  } catch (error) {
    console.error("Error fetching all active user packages:", error);
    throw error;
  }
};

/**
 * Lấy user packages đang hoạt động theo loại (CAR hoặc BATTERY)
 * API: GET /api/staff/user-packages/active/type/{packageType}
 */
export const getActiveUserPackagesByType = async (packageType) => {
  try {
    const response = await get(`api/staff/user-packages/active/type/${packageType}`);
    return response;
  } catch (error) {
    console.error(`Error fetching active ${packageType} packages:`, error);
    throw error;
  }
};
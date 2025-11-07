import { get, del } from "../utils/api"; // Thêm 'del' vào import

export const getNotification = async () => {
  const data = await get("api/notifications");
  return data;
};

export const getStaffNotification = async (staffId) => {
  const data = await get(`api/staff/notifications/${staffId}`);
  return data;
};

export const deleteNotification = async (notificationId) => {
  const response = await del(`api/notifications/${notificationId}`);
  return response;
};
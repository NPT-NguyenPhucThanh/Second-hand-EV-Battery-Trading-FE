import { get } from "../utils/api"; 

export const getNotification = async () => {
  const data = await get("api/notifications");
  return data;
};

export const getStaffNotification = async () => {
  const data = await get("api/notifications");
  return data;
};


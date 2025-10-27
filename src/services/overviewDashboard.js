import { get } from "../utils/api"; 

export const getReportSystem = async () => {
  const data = await get("api/manager/dashboard/overview");
  return data;
};
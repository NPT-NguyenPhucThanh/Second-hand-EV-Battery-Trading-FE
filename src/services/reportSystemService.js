import { get } from "../utils/api"; 

export const getReportSystem = async () => {
  const data = await get("api/manager/reports/system");
  return data;
};
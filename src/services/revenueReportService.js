import { get } from "../utils/api"; 

export const getRevenueReport = async () => {
  const data = await get("api/manager/reports/revenue");
  return data;
};
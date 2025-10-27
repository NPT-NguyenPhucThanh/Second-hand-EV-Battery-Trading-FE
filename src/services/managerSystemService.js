import { get } from "../utils/api"; 

// Sửa lại tên hàm từ getgetDashboardOverview thành getDashboardOverview
export const getDashboardOverview = async () => {
  const data = await get("api/manager/dashboard/overview");
  return data;
};

export const getReportSystem = async () => {
  const data = await get("api/manager/reports/system");
  return data;
};

export const getRevenue = async () => {
  const data = await get("api/manager/reports/revenue");
  return data;
};
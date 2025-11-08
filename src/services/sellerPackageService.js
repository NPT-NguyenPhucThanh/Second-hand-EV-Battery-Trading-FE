// src/services/sellerPackageService.js
import { get } from "../utils/api";

export const getCurrentPackages = async () => {
  const data = await get("api/seller/packages/current");
  return data;
};
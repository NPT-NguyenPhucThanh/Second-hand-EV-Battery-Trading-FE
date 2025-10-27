// import { get, post } from "../utils/api"; 

// export const getProductPendingInsspection = async () => {
//   const data = await get("api/staff/products/pending-inspection");
//   return data;
// };

// export const getProductApproval = async () => {
//   const data = await get("api/staff/products/pending-approval");
//   return data;
// };

// export const inputInspection = async (productId, isApprovedAndNote) => {
//     const response = await post(`api/staff/products/${productId}/input-inspection`, isApprovedAndNote);
//     return response.data;
// };

// export const approveProduct = async (productId, isApprovedAndNote) => {
//     const response = await post(`api/staff/products/${productId}/approve-preliminary`, isApprovedAndNote);
//     return response.data;
// };

import { get, post } from "../utils/api"; 

export const getProductPendingInsspection = async () => {
  const data = await get("api/staff/products/pending-inspection");
  return data;
};

export const getProductApproval = async () => {
  const data = await get("api/staff/products/pending-approval");
  return data;
};

// SỬA LẠI HÀM NÀY
export const inputInspection = async (productId, isApprovedAndNote) => {
    const response = await post(`api/staff/products/${productId}/input-inspection`, isApprovedAndNote);
    // Backend trả về chuỗi "Processed" khi thành công
    return response === "Processed"; 
};

// VÀ HÀM NÀY
export const approveProduct = async (productId, isApprovedAndNote) => {
    const response = await post(`api/staff/products/${productId}/approve-preliminary`, isApprovedAndNote);
    // Backend trả về chuỗi "Processed" khi thành công
    return response === "Processed";
};
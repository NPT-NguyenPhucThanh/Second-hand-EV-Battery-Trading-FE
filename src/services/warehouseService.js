
import { get, post, put } from "../utils/api"; 

export const getWarehouse = async () => {
  const data = await get("api/staff/warehouse");
  return data;
};

export const getWarehousePending = async () => {
  const data = await get("api/staff/warehouse/pending");
  return data;
};


export const removeProduct = async (productId, payload) => {
  return await post(`api/staff/warehouse/remove/${productId}`, payload);
};


export const addProduct = async (productId) => {
    const response = await post(`api/staff/warehouse/add/${productId}`);
    return response;
};

export const updateProductStatus = async (productId, newStatus) => {
  const response = await put(`api/staff/warehouse/${productId}/status?newStatus=${newStatus}`);
  return response;
};

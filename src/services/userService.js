import { get, post } from "../utils/api"; 

export const getUser = async (id) => {
  const data = await get(`api/manager/users/${id}`);
  return data;
};

export const lockUserById = async (userId, payload) => {
    const response = await post(`api/manager/users/${userId}/lock`, payload);
    return response.data;
};

export const getCustomer = async (id) => {
  const data = await get(`api/staff/users/${id}`);
  return data;
};

export const getAllCustomer = async () => {
  const data = await get(`api/staff/users`);
  return data;
};

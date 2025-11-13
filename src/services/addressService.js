import api from "../utils/api"; 

export const getSavedAddresses = async () => {
  try {
    const response = await api.get("api/client/addresses");
    return response.addresses || [];
  } catch (error) {
    console.error("Lỗi khi lấy địa chỉ:", error);
    throw error;
  }
};

export const addSavedAddress = async (addressData) => {
  try {
    const response = await api.post("api/client/addresses", addressData);
    return response;
  } catch (error) {
    console.error("Lỗi khi thêm địa chỉ:", error);
    throw error;
  }
};

export const deleteSavedAddress = async (addressId) => {
  try {
    const response = await api.del(`api/client/addresses/${addressId}`);
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa địa chỉ:", error);
    throw error;
  }
};
import { get, post } from "../utils/api"; 

export const getOrCreateChatroom = async (payload) => {
  try {
    const response = await post("api/chat/chatrooms", payload);
    if (response.status === 'success') {
      return response.chatroom;
    } else {
      throw new Error(response.message || "Không thể lấy phòng chat");
    }
  } catch (error) {
    console.error("Error getting or creating chatroom:", error);
    throw error;
  }
};

export const getMessages = async (chatroomId) => {
  try {
    const response = await get(`api/chat/chatrooms/${chatroomId}/messages`);
    if (response.status === 'success') {
      return response.messages; 
    } else {
      throw new Error(response.message || "Không thể tải lịch sử tin nhắn");
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const getUserChatrooms = async () => {
  try {
    const response = await get("api/chat/chatrooms");
    if (response.status === 'success') {
      return response.chatrooms; 
    } else {
      throw new Error(response.message || "Không thể tải danh sách chat");
    }
  } catch (error) {
    console.error("Error fetching user chatrooms:", error);
    throw error;
  }
};

export const getPaginatedMessages = async (chatroomId, page = 0, size = 20) => {
  try {
    const response = await get(`api/chat/chatrooms/${chatroomId}/messages/paginated?page=${page}&size=${size}`);
    if (response.status === 'success') {
      // SỬA LẠI: Trả về cả messages và pagination
      return {
        messages: response.messages,
        pagination: response.pagination
      }; 
    } else {
      throw new Error(response.message || "Không thể tải lịch sử tin nhắn");
    }
  } catch (error) {
    console.error("Error fetching paginated messages:", error);
    throw error;
  }
};

export const uploadChatFile = async (chatroomId, file, senderId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("senderId", senderId); 

  try {
    const response = await post(`api/chat/chatrooms/${chatroomId}/upload`, formData);
    if (response.status === 'success') {
      return response.fileUrl;
    } else {
      throw new Error(response.message || "Upload file thất bại");
    }
  } catch (error) {
    console.error("Error uploading chat file:", error);
    throw error;
  }
};
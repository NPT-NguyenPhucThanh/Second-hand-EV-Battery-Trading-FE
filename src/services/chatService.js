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

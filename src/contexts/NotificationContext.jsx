import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';
import { getUserChatrooms } from '../services/chatService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const { isAuthenticated } = useUser();

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setTotalUnreadMessages(0);
      return;
    }
    
    try {
      const chatrooms = await getUserChatrooms();
      if (chatrooms && Array.isArray(chatrooms)) {
        // Tính tổng unreadCount từ tất cả các phòng chat
        const total = chatrooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
        setTotalUnreadMessages(total);
      }
    } catch (error) {
      console.error("Failed to fetch unread message count:", error);
      setTotalUnreadMessages(0); // Đặt về 0 nếu có lỗi
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Chỉ chạy khi isAuthenticated là true
    if (isAuthenticated) {
      // Tải lần đầu khi xác thực
      fetchUnreadCount();
      
      // Tự động kiểm tra tin nhắn mới mỗi 30 giây
      const interval = setInterval(fetchUnreadCount, 30000); 

      // Dọn dẹp khi unmount HOẶC khi isAuthenticated thay đổi
      return () => clearInterval(interval);
    } else {
      // Nếu không đăng nhập (vừa logout), đảm bảo count là 0
      setTotalUnreadMessages(0);
    }
  }, [fetchUnreadCount, isAuthenticated]); // <-- THÊM isAuthenticated VÀO ĐÂY

  const value = {
    totalUnreadMessages,
    refreshUnreadCount: fetchUnreadCount, // Hàm để tải lại thủ công (ví dụ: sau khi xem tin)
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
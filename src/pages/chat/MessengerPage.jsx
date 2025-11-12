import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../../contexts/UserContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { 
  getUserChatrooms, 
  getPaginatedMessages, 
} from "../../services/chatService";
import { MessageCircle, Send, User, Package as PackageIcon, Loader, Search, LogIn } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";
import AuroraText from "../../components/common/AuroraText";
import { toast } from "sonner";

const SOCKET_URL = "http://localhost:8080/ws-chat";

// 🎨 COLOR SYSTEM
const THEME_COLORS = {
  dark: {
    primary: ['#ef4444', '#f97316'],
    aurora: ['#ef4444', '#f97316', '#fb923c', '#fbbf24', '#ef4444'],
    border: 'rgba(239, 68, 68, 0.2)',
    messageBg: 'rgba(239, 68, 68, 0.15)',
  },
  light: {
    primary: ['#3b82f6', '#8b5cf6'],
    aurora: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#3b82f6'],
    border: 'rgba(59, 130, 246, 0.3)',
    messageBg: 'rgba(59, 130, 246, 0.1)',
  }
};

export default function MessengerPage() {
  const { user: currentUser, loading: authLoading } = useUser();
  const { isDark } = useTheme();
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  const { refreshUnreadCount } = useNotifications();
  const [stompClient, setStompClient] = useState(null);
  const [chatrooms, setChatrooms] = useState([]);
  const [activeChatroom, setActiveChatroom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null); 

  useEffect(() => {
    if (authLoading || !currentUser) return;
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const rooms = await getUserChatrooms();
        setChatrooms(rooms);
      } catch (error) {
        console.error("Không thể tải inbox:", error);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, [currentUser, authLoading]);

  useEffect(() => {
    if (!activeChatroom) return;

    let client = null;
    const connectAndLoad = async () => {
      setLoadingMessages(true);
      setMessages([]);
      try {
        const response = await getPaginatedMessages(activeChatroom.chatroomId, 0, 20);
        setMessages(response.messages.reverse()); 
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);

        refreshUnreadCount();

        const socket = new SockJS(SOCKET_URL);
        client = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          onConnect: () => {
            setStompClient(client);
            client.subscribe(
              `/topic/chatroom/${activeChatroom.chatroomId}`,
              (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages((prevMessages) => [
                  ...prevMessages,
                  receivedMessage,
                ]);
              }
            );
          },
        });
        client.activate();
      } catch (error) {
        console.error("Không thể kết nối chat:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    connectAndLoad();

    return () => {
      if (client && client.active) {
        client.deactivate();
        setStompClient(null);
      }
    };
  }, [activeChatroom, refreshUnreadCount]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !stompClient?.active || !activeChatroom) return;
    const chatMessage = {
      chatroomId: activeChatroom.chatroomId,
      senderId: currentUser.userId,
      senderName: currentUser.username,
      content: newMessage,
      messageType: "TEXT", 
    };
    stompClient.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(chatMessage),
    });
    setNewMessage("");
  };

  useEffect(() => {
    if (!loadingMore && messagesEndRef.current) {
      const scrollableContainer = messagesEndRef.current.parentNode;
      scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
    }
  }, [messages, loadingMore]);

  const selectChatroom = (room) => {
    setActiveChatroom(room);
    setChatrooms((prev) =>
      prev.map((r) =>
        r.chatroomId === room.chatroomId ? { ...r, unreadCount: 0 } : r
      )
    );
  };

  const handleScroll = async (e) => {
    const { scrollTop, scrollHeight } = e.target;
    if (scrollTop === 0 && !loadingMore && currentPage < totalPages - 1) {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const oldScrollHeight = scrollHeight;

      try {
        const response = await getPaginatedMessages(activeChatroom.chatroomId, nextPage, 20);
        setMessages((prevMessages) => [...response.messages.reverse(), ...prevMessages]);
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);

        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight - oldScrollHeight;
        }
      } catch {
        toast.error("Lỗi khi tải tin nhắn cũ hơn!");
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // Filter chatrooms
  const filteredChatrooms = chatrooms.filter(room =>
    room.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (authLoading || loadingRooms) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
          isDark ? 'bg-gray-950' : 'bg-gray-50'
        }`}
      >
        <div className="text-center">
          <Loader 
            className="w-12 h-12 animate-spin mx-auto mb-4"
            style={{ color: colors.primary[0] }}
          />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Đang tải tin nhắn...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center transition-colors duration-500 pt-20 ${
          isDark ? 'bg-gray-950' : 'bg-gray-50'
        }`}
      >
        <div 
          className="text-center p-12 rounded-3xl max-w-md"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${colors.border}`,
          }}
        >
          <LogIn 
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: colors.primary[0] }}
          />
          <p className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Vui lòng đăng nhập để xem tin nhắn
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
            }}
          >
            Đi đến trang đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`pt-20 min-h-screen transition-colors duration-500 ${
        isDark ? 'bg-gray-950' : 'bg-gray-50'
      }`}
    >
      <div className="h-[calc(100vh-5rem)] flex container mx-auto px-4 py-6 gap-6">
        {/* === SIDEBAR - DANH SÁCH CHAT === */}
        <div 
          className="w-80 flex-shrink-0 rounded-3xl overflow-hidden flex flex-col"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${colors.border}`,
          }}
        >
          {/* Header */}
          <div 
            className="p-6"
            style={{
              borderBottom: `2px solid ${colors.border}`,
            }}
          >
            <AuroraText
              key={`messenger-title-${isDark}`}
              text="Tin nhắn"
              colors={colors.aurora}
              speed={2}
              className="text-2xl font-bold"
            />
            
            {/* Search */}
            <div className="mt-4 relative">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
              />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl outline-none transition-all duration-200"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${colors.border}`,
                  color: isDark ? 'white' : '#1f2937',
                }}
              />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {filteredChatrooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <MessageCircle 
                  className="w-16 h-16 mb-4"
                  style={{ color: isDark ? '#374151' : '#d1d5db' }}
                />
                <p className={isDark ? 'text-gray-400 text-center' : 'text-gray-500 text-center'}>
                  {chatrooms.length === 0 ? 'Chưa có tin nhắn nào' : 'Không tìm thấy kết quả'}
                </p>
              </div>
            ) : (
              filteredChatrooms.map((room) => (
                <button
                  key={room.chatroomId}
                  onClick={() => selectChatroom(room)}
                  className="w-full p-4 flex items-center gap-3 transition-all duration-200 hover:scale-[0.98]"
                  style={{
                    background: activeChatroom?.chatroomId === room.chatroomId
                      ? (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                      : 'transparent',
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  {/* Avatar */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                    }}
                  >
                    <User className="w-6 h-6" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {room.otherUserName}
                      </p>
                      {room.unreadCount > 0 && (
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                          }}
                        >
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    {room.orderId && (
                      <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <PackageIcon className="w-3 h-3" />
                        Đơn hàng #{room.orderId}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* === KHUNG CHAT === */}
        <div 
          className="flex-1 rounded-3xl overflow-hidden flex flex-col"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${colors.border}`,
          }}
        >
          {!activeChatroom ? (
            // Empty state
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle 
                  className="w-20 h-20 mx-auto mb-4"
                  style={{ color: isDark ? '#374151' : '#d1d5db' }}
                />
                <p className={`text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Chọn một đoạn chat để bắt đầu
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div 
                className="p-6 flex items-center gap-3"
                style={{
                  borderBottom: `2px solid ${colors.border}`,
                }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                  }}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {activeChatroom.otherUserName}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stompClient?.active ? '🟢 Đang hoạt động' : '⚫ Ngoại tuyến'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6"
                style={{
                  background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
                }}
              >
                {loadingMore && (
                  <div className="text-center py-2">
                    <Loader className="w-5 h-5 animate-spin inline-block" style={{ color: colors.primary[0] }} />
                  </div>
                )}

                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="w-8 h-8 animate-spin" style={{ color: colors.primary[0] }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      Chưa có tin nhắn. Hãy bắt đầu trò chuyện!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, index) => {
                      const isMyMessage = msg.senderId === currentUser.userId;
                      return (
                        <div
                          key={index}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className="max-w-[70%] px-4 py-3 rounded-2xl break-words"
                            style={{
                              background: isMyMessage
                                ? `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`
                                : isDark 
                                  ? 'rgba(255, 255, 255, 0.1)' 
                                  : 'rgba(0, 0, 0, 0.05)',
                              color: isMyMessage ? 'white' : (isDark ? '#e5e7eb' : '#1f2937'),
                              border: isMyMessage ? 'none' : `1px solid ${colors.border}`,
                            }}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div 
                className="p-6"
                style={{
                  borderTop: `2px solid ${colors.border}`,
                }}
              >
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    disabled={!stompClient?.active}
                    className="flex-1 px-6 py-3 rounded-xl outline-none transition-all duration-200"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                      border: `2px solid ${colors.border}`,
                      color: isDark ? 'white' : '#1f2937',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!stompClient?.active || !newMessage.trim()}
                    className="px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      background: (!stompClient?.active || !newMessage.trim())
                        ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
                        : `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                    }}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
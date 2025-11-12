import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../../../contexts/UserContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  getOrCreateChatroom,
  getMessages,
} from "../../../services/chatService";
import {
  X,
  Send,
  Loader,
  AlertCircle,
  LogIn,
  MessageCircle,
} from "lucide-react";
import AuroraText from "../../../components/common/AuroraText";

const SOCKET_URL = "http://localhost:8080/ws-chat";

// COLOR SYSTEM
const THEME_COLORS = {
  dark: {
    primary: ["#ef4444", "#f97316"],
    aurora: ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"],
    border: "rgba(239, 68, 68, 0.2)",
    messageBg: "rgba(239, 68, 68, 0.15)",
    messageHover: "rgba(239, 68, 68, 0.25)",
  },
  light: {
    primary: ["#3b82f6", "#8b5cf6"],
    aurora: ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#3b82f6"],
    border: "rgba(59, 130, 246, 0.3)",
    messageBg: "rgba(59, 130, 246, 0.1)",
    messageHover: "rgba(59, 130, 246, 0.2)",
  },
};

export default function ChatModal({ open, onClose, sellerId, sellerName }) {
  const { user: currentUser, loading: authLoading } = useUser();
  const { isDark } = useTheme();
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const [stompClient, setStompClient] = useState(null);
  const [chatroom, setChatroom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!open || !currentUser || !sellerId) {
      if (stompClient && stompClient.active) {
        stompClient.deactivate();
        setStompClient(null);
      }
      return;
    }

    let client = null;
    const connect = async () => {
      setLoading(true);
      setError(null);
      try {
        const roomData = await getOrCreateChatroom({
          sellerId: sellerId,
          orderId: null,
        });
        setChatroom(roomData);

        const history = await getMessages(roomData.chatroomId);
        setMessages(history);

        const socket = new SockJS(SOCKET_URL);
        client = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          onConnect: () => {
            console.log("Connected to WebSocket!");
            setStompClient(client);

            client.subscribe(
              `/topic/chatroom/${roomData.chatroomId}`,
              (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages((prevMessages) => [
                  ...prevMessages,
                  receivedMessage,
                ]);
              }
            );
          },
          onDisconnect: () => console.log("Disconnected!"),
          onStompError: (frame) =>
            console.error("Broker reported error: " + frame.headers["message"]),
        });

        client.activate();
      } catch (err) {
        console.error("Không thể kết nối chat:", err);
        setError("Không thể kết nối. Phiên đăng nhập có thể đã hết hạn.");
      } finally {
        setLoading(false);
      }
    };

    connect();

    return () => {
      if (client && client.active) {
        client.deactivate();
      }
    };
  }, [open, currentUser, sellerId, authLoading]);

  const handleSendMessage = () => {
    if (newMessage.trim() && stompClient && stompClient.active && chatroom) {
      const chatMessage = {
        chatroomId: chatroom.chatroomId,
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
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClose = () => {
    onClose();
    setMessages([]);
    setChatroom(null);
    setError(null);
    setNewMessage("");
  };

  // Render chat UI with SeraUI design
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
      }}
      onClick={handleClose}
    >
      {/* Chat Container */}
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: isDark
            ? "rgba(17, 24, 39, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: `2px solid ${colors.border}`,
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Aurora Effect */}
        <div
          className="relative p-6"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))"
              : "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
            borderBottom: `2px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                }}
              >
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <AuroraText
                  key={`chat-title-${isDark}`}
                  text={sellerName || "Người bán"}
                  colors={colors.aurora}
                  speed={2}
                  className="text-xl font-bold"
                />
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {stompClient?.active ? "🟢 Đang hoạt động" : "⚫ Ngoại tuyến"}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              }}
            >
              <X
                className={`w-5 h-5 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col" style={{ height: "calc(90vh - 200px)" }}>
          {authLoading ? (
            // Loading State
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader
                  className="w-12 h-12 animate-spin mx-auto mb-4"
                  style={{ color: colors.primary[0] }}
                />
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Đang tải...
                </p>
              </div>
            </div>
          ) : !currentUser ? (
            // Not Logged In
            <div className="flex-1 flex items-center justify-center p-8">
              <div
                className="text-center p-8 rounded-2xl"
                style={{
                  background: isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.03)",
                  border: `1px solid ${colors.border}`,
                }}
              >
                <LogIn
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: colors.primary[0] }}
                />
                <p
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Vui lòng đăng nhập để chat
                </p>
                <a
                  href="/login"
                  className="inline-block px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                    boxShadow: isDark
                      ? "0 10px 40px rgba(239, 68, 68, 0.3)"
                      : "0 10px 40px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  Đi đến trang đăng nhập
                </a>
              </div>
            </div>
          ) : loading ? (
            // Connecting
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader
                  className="w-12 h-12 animate-spin mx-auto mb-4"
                  style={{ color: colors.primary[0] }}
                />
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Đang kết nối...
                </p>
              </div>
            </div>
          ) : error ? (
            // Error State
            <div className="flex-1 flex items-center justify-center p-8">
              <div
                className="text-center p-8 rounded-2xl"
                style={{
                  background: isDark
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(239, 68, 68, 0.05)",
                  border: "2px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <p
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {error}
                </p>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/login";
                  }}
                  className="px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  }}
                >
                  Đăng nhập lại
                </button>
              </div>
            </div>
          ) : (
            // Messages Area
            <>
              <div
                className="flex-1 overflow-y-auto p-6 space-y-3"
                style={{
                  background: isDark
                    ? "rgba(0, 0, 0, 0.2)"
                    : "rgba(0, 0, 0, 0.02)",
                }}
              >
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle
                      className="w-16 h-16 mx-auto mb-4"
                      style={{ color: isDark ? "#374151" : "#d1d5db" }}
                    />
                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                      Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMyMessage = msg.senderId === currentUser.userId;
                    return (
                      <div
                        key={index}
                        className={`flex ${
                          isMyMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className="max-w-[70%] px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-105"
                          style={{
                            background: isMyMessage
                              ? `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`
                              : isDark
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.05)",
                            color: isMyMessage
                              ? "white"
                              : isDark
                              ? "#e5e7eb"
                              : "#1f2937",
                            backdropFilter: "blur(10px)",
                            border: isMyMessage
                              ? "none"
                              : `1px solid ${colors.border}`,
                            boxShadow: isMyMessage
                              ? isDark
                                ? "0 4px 20px rgba(239, 68, 68, 0.3)"
                                : "0 4px 20px rgba(59, 130, 246, 0.3)"
                              : "none",
                          }}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p
                            className="text-xs mt-1"
                            style={{
                              color: isMyMessage
                                ? "rgba(255, 255, 255, 0.7)"
                                : isDark
                                ? "rgba(255, 255, 255, 0.5)"
                                : "rgba(0, 0, 0, 0.4)",
                            }}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                className="p-6"
                style={{
                  background: isDark
                    ? "rgba(0, 0, 0, 0.3)"
                    : "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                  borderTop: `2px solid ${colors.border}`,
                }}
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Nhập tin nhắn..."
                    disabled={!stompClient || !stompClient.active}
                    className="flex-1 px-6 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2"
                    style={{
                      background: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.9)",
                      border: `2px solid ${colors.border}`,
                      color: isDark ? "white" : "#1f2937",
                      focusRing: colors.primary[0],
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      !stompClient || !stompClient.active || !newMessage.trim()
                    }
                    className="px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      background:
                        !stompClient ||
                        !stompClient.active ||
                        !newMessage.trim()
                          ? isDark
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)"
                          : `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                      boxShadow:
                        stompClient?.active && newMessage.trim()
                          ? isDark
                            ? "0 10px 40px rgba(239, 68, 68, 0.3)"
                            : "0 10px 40px rgba(59, 130, 246, 0.3)"
                          : "none",
                    }}
                  >
                    <Send className="w-5 h-5" />
                    Gửi
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

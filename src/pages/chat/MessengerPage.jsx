import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../../contexts/UserContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { 
  getUserChatrooms, 
  getPaginatedMessages, 
} from "../../services/chatService";
import {
  Spin,
  Input,
  Button,
  List,
  Typography,
  Avatar,
  Badge,
  Layout,
  message,
  Space,
} from "antd";
import { UserOutlined, SendOutlined } from "@ant-design/icons"; 
import { useNotifications } from "../../contexts/NotificationContext";

const { Text, Title, Link } = Typography;
const { Sider, Content } = Layout;
const SOCKET_URL = "http://localhost:8080/ws-chat";

export default function MessengerPage() {
  const { user: currentUser, loading: authLoading } = useUser();
  const { refreshUnreadCount } = useNotifications();
  const [stompClient, setStompClient] = useState(null);
  const [chatrooms, setChatrooms] = useState([]);
  const [activeChatroom, setActiveChatroom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
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
    const { scrollTop, scrollHeight, clientHeight } = e.target;
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

      } catch (error) {
        message.error("Lỗi khi tải tin nhắn cũ hơn!");
      } finally {
        setLoadingMore(false);
      }
    }
  };

  const renderMessageContent = (msg) => {
    const isMyMessage = msg.senderId === currentUser.userId;
    const style = { color: isMyMessage ? 'white' : 'black' };

    return <Text style={style}>{msg.content}</Text>;
  };
  if (authLoading || loadingRooms) {
    return (
      <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
    );
  }

  if (!currentUser) {
    return (
      <div style={{ padding: "40px", textAlign: "center", paddingTop: "100px" }}>
        Vui lòng đăng nhập để xem tin nhắn.
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "80px", height: "100vh" }}>
      <Layout style={{ height: "calc(100vh - 80px)", background: "#fff" }}>
        {/* === CỘT BÊN TRÁI (DANH SÁCH CHAT) === */}
        <Sider
          width={300}
          style={{ background: "#fff", borderRight: "1px solid #f0f0f0", overflowY: 'auto' }}
        >
          <Title level={4} style={{ padding: "16px", margin: 0 }}>
            Tin nhắn
          </Title>
          <List
            itemLayout="horizontal"
            dataSource={chatrooms}
            renderItem={(room) => (
              <List.Item
                onClick={() => selectChatroom(room)}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  background:
                    activeChatroom?.chatroomId === room.chatroomId
                      ? "#e6f7ff"
                      : "#fff",
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Text strong>{room.otherUserName}</Text>
                      {room.unreadCount > 0 && <Badge count={room.unreadCount} />}
                    </div>
                  }
                  description={room.orderId ? `Đơn hàng #${room.orderId}` : "Chat chung"}
                />
              </List.Item>
            )}
          />
        </Sider>

        {/* === CỘT BÊN PHẢI (KHUNG CHAT) === */}
        <Layout style={{ background: "#fff" }}>
          <Content style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {!activeChatroom ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Text type="secondary">Chọn một đoạn chat để bắt đầu</Text>
              </div>
            ) : (
              <>
                <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}>
                  <Title level={5} style={{ margin: 0 }}>
                    {activeChatroom.otherUserName}
                  </Title>
                </div>
                <div
                  ref={scrollContainerRef} 
                  onScroll={handleScroll}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    background: "#f5f5f5",
                    padding: "16px",
                    position: "relative" 
                  }}
                >
                  {loadingMore && <Spin style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)' }} />}

                  {loadingMessages ? (
                     <Spin style={{ position: "absolute", top: "50%", left: "50%" }} />
                  ) : (
                    <List
                      bordered={false}
                      dataSource={messages}
                      renderItem={(msg) => {
                        const isMyMessage = msg.senderId === currentUser.userId;
                        return (
                          <List.Item style={{ justifyContent: isMyMessage ? "flex-end" : "flex-start", border: "none", padding: "4px 0" }}>
                            <div style={{ background: isMyMessage ? "#1890ff" : "#e4e6eb", color: isMyMessage ? "white" : "black", padding: "8px 12px", borderRadius: "18px", maxWidth: "70%" }}>
                              {renderMessageContent(msg)}
                            </div>
                          </List.Item>
                        );
                      }}
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div style={{ padding: "16px", borderTop: "1px solid #f0f0f0" }}>
                  {/* Bỏ input file */}
                  <form onSubmit={handleSendMessage}>
                    <Space.Compact style={{ display: "flex" }}>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        disabled={!stompClient || !stompClient.active} // Bỏ check isUploading
                      />
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SendOutlined />}
                        disabled={!stompClient || !stompClient.active || !newMessage.trim()} // Bỏ check isUploading
                      />
                    </Space.Compact>
                  </form>
                </div>
              </>
            )}
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
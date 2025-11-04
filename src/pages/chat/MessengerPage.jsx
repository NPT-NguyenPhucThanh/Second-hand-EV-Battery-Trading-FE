import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../../contexts/UserContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getUserChatrooms, getMessages } from "../../services/chatService";
import {
  Spin,
  Input,
  Button,
  List,
  Typography,
  Avatar,
  Badge,
  Layout,
} from "antd";
import { UserOutlined } from "@ant-design/icons";

// 1. Import hook
import { useNotifications } from "../../contexts/NotificationContext";

const { Text, Title } = Typography;
const { Sider, Content } = Layout;
const SOCKET_URL = "http://localhost:8080/ws-chat";

export default function MessengerPage() {
  const { user: currentUser, loading: authLoading } = useUser();

  // 2. Lấy hàm refresh
  const { refreshUnreadCount } = useNotifications();

  const [stompClient, setStompClient] = useState(null);
  const [chatrooms, setChatrooms] = useState([]);
  const [activeChatroom, setActiveChatroom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  // 1. Tải danh sách phòng chat (Inbox) - (Không thay đổi)
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

  // 2. Kết nối WebSocket và tải tin nhắn khi chọn 1 phòng chat
  useEffect(() => {
    if (!activeChatroom) return;

    let client = null;

    const connectAndLoad = async () => {
      setLoadingMessages(true);
      setMessages([]); // Xóa tin nhắn cũ
      try {
        // Tải lịch sử chat
        const history = await getMessages(activeChatroom.chatroomId);
        setMessages(history);

        // === SỬA LỖI (1/2): GỌI REFRESH NGAY SAU KHI ĐỌC TIN NHẮN ===
        refreshUnreadCount();

        // Kết nối STOMP
        const socket = new SockJS(SOCKET_URL);
        client = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          onConnect: () => {
            console.log("Connected to WebSocket!");
            setStompClient(client);

            // Đăng ký kênh của phòng chat
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

    // Ngắt kết nối khi đổi phòng chat hoặc unmount
    return () => {
      if (client && client.active) {
        client.deactivate();
        setStompClient(null);
      }
    };
    // === SỬA LỖI (2/2): THÊM refreshUnreadCount VÀO DEPENDENCY ARRAY ===
  }, [activeChatroom, refreshUnreadCount]);

  // 3. Gửi tin nhắn
  const handleSendMessage = (e) => {
    // <-- 1. Thêm (e) vào đây
    if (e) {
      // <-- 2. Thêm 2 dòng này
      e.preventDefault();
    }
    if (
      newMessage.trim() &&
      stompClient &&
      stompClient.active &&
      activeChatroom
    ) {
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
    }
  };

  // 4. Tự động cuộn
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);
// Đoạn mã MỚI
// 4. Tự động cuộn
useEffect(() => {
  if (messagesEndRef.current) {
    // Lấy container cha (là div chúng ta vừa tạo ở bước 1)
    const scrollableContainer = messagesEndRef.current.parentNode;
    
    // Đặt vị trí cuộn = tổng chiều cao của nó (tức là cuộn xuống dưới cùng)
    scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
  }
}, [messages]); // Vẫn giữ [messages] làm dependency

  // 5. Hàm chọn phòng chat
  const selectChatroom = (room) => {
    setActiveChatroom(room);
    // Cập nhật lại list (set unreadCount = 0)
    setChatrooms((prev) =>
      prev.map((r) =>
        r.chatroomId === room.chatroomId ? { ...r, unreadCount: 0 } : r
      )
    );
  };

  // 6. Render
  if (authLoading || loadingRooms) {
    return (
      <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
    );
  }

  if (!currentUser) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Vui lòng đăng nhập để xem tin nhắn.
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "80px", height: "100vh" }}>
      {" "}
      {/* Thêm padding top */}
      <Layout style={{ height: "calc(100vh - 80px)", background: "#fff" }}>
        {/* === CỘT BÊN TRÁI (DANH SÁCH CHAT) === */}
        <Sider
          width={300}
          style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}
        >
          <Title level={4} style={{ padding: "16px" }}>
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text strong>{room.otherUserName}</Text>
                      {room.unreadCount > 0 && (
                        <Badge count={room.unreadCount} />
                      )}
                    </div>
                  }
                  description={
                    room.orderId ? `Đơn hàng #${room.orderId}` : "Chat chung"
                  }
                />
              </List.Item>
            )}
          />
        </Sider>

        {/* === CỘT BÊN PHẢI (KHUNG CHAT) === */}
        <Layout style={{ background: "#fff" }}>
          <Content
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {!activeChatroom ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text type="secondary">Chọn một đoạn chat để bắt đầu</Text>
              </div>
            ) : (
              <>
                {/* Header của khung chat */}
                <div
                  style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}
                >
                  <Title level={5}>{activeChatroom.otherUserName}</Title>
                </div>
                {/* Lịch sử tin nhắn */}
          
                {/* Bọc List trong một div để kiểm soát cuộn */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    background: "#f5f5f5",
                    padding: "16px",
                  }}
                >
                  <List
                    bordered={false}
                    // Xóa style cuộn khỏi List (vì div cha đã cuộn rồi)
                    dataSource={messages}
                    renderItem={(msg) => {
                      const isMyMessage = msg.senderId === currentUser.userId;
                      return (
                        <List.Item
                          style={{
                            justifyContent: isMyMessage
                              ? "flex-end"
                              : "flex-start",
                            border: "none",
                            padding: "4px 0",
                          }}
                        >
                          <div
                            style={{
                              background: isMyMessage ? "#1890ff" : "#e4e6eb",
                              color: isMyMessage ? "white" : "black",
                              padding: "8px 12px",
                              borderRadius: "18px",
                              maxWidth: "70%",
                            }}
                          >
                            <Text
                              style={{ color: isMyMessage ? "white" : "black" }}
                            >
                              {msg.content}
                            </Text>
                          </div>
                        </List.Item>
                      );
                    }}
                  >
                    {loadingMessages && (
                      <Spin
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                        }}
                      />
                    )}
                    {/* Bỏ ref ở đây */}
                  </List>

                  {/* Đặt ref ở cuối div cuộn, BÊN NGOÀI List component */}
                  <div ref={messagesEndRef} />
                </div>
                {/* Khung nhập tin nhắn */}
                <div
                  style={{ padding: "16px", borderTop: "1px solid #f0f0f0" }}
                >
                  <form onSubmit={handleSendMessage}>
                    <Input.Group compact style={{ display: "flex" }}>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        // Xóa onPressEnter ở đây vì <form> đã xử lý
                        placeholder="Nhập tin nhắn..."
                        disabled={
                          loadingMessages || !stompClient || !stompClient.active
                        }
                      />
                      <Button
                        type="primary"
                        htmlType="submit" // Đổi thành 'submit' cho form này
                        disabled={
                          loadingMessages || !stompClient || !stompClient.active
                        }
                      >
                        Gửi
                      </Button>
                    </Input.Group>
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

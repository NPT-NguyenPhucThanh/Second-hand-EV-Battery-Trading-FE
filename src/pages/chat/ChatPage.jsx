import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { useUser } from '../../contexts/UserContext'; 
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getOrCreateChatroom, getMessages } from '../../services/chatService';
import { Spin, Input, Button, List, Typography, Avatar } from 'antd'; 

const { Text, Title } = Typography; 
const SOCKET_URL = 'http://localhost:8080/ws-chat';

export default function ChatPage() {
  const { sellerId } = useParams();

  const { user: currentUser, loading: authLoading } = useUser(); 
  
  const [stompClient, setStompClient] = useState(null);
  const [chatroom, setChatroom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [pageLoading, setPageLoading] = useState(true); 
  
  const messagesEndRef = useRef(null); 

  useEffect(() => {
    if (authLoading) {
      return; 
    }

    if (!currentUser) {
      setPageLoading(false); 
      return; 
    }

    if (!sellerId) {
        setPageLoading(false);
        return;
    }

    let client = null;
    const connect = async () => {
      // pageLoading đã là true, không cần set lại
      try {
        const roomData = await getOrCreateChatroom({ 
          sellerId: sellerId, 
          orderId: null 
        });
        setChatroom(roomData);
        
        const history = await getMessages(roomData.chatroomId);
        setMessages(history);

        const socket = new SockJS(SOCKET_URL); 
        client = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          onConnect: () => {
            console.log('Connected to WebSocket!');
            setStompClient(client);

            client.subscribe(`/topic/chatroom/${roomData.chatroomId}`, (message) => {
              const receivedMessage = JSON.parse(message.body);
              setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            });
          },
          onDisconnect: () => console.log('Disconnected!'),
          onStompError: (frame) => console.error('Broker reported error: ' + frame.headers['message']),
        });

        client.activate();
        
      } catch (error) {
        console.error("Không thể kết nối chat:", error);
      } finally {
        setPageLoading(false); 
      }
    };

    connect();

    return () => {
      if (client && client.active) {
        client.deactivate();
      }
    };
  }, [currentUser, sellerId, authLoading]); 

  const handleSendMessage = () => {
    if (newMessage.trim() && stompClient && stompClient.active && chatroom) {
      
      const chatMessage = {
        chatroomId: chatroom.chatroomId,
        senderId: currentUser.userId, 
        senderName: currentUser.username,
        content: newMessage,
        messageType: 'TEXT'
      };

      stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(chatMessage),
      });

      setNewMessage("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  if (authLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (pageLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (!currentUser) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '100px auto' }}>
        <Title level={3}>Bạn cần đăng nhập</Title>
        <Text>Vui lòng đăng nhập để có thể bắt đầu chat với người bán.</Text>
        <br />
        <Button type="primary" size="large" style={{ marginTop: '20px' }}>
          <Link to="/login">Đi đến trang đăng nhập</Link>
        </Button>
      </div>
    );
  }

  if (!chatroom) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '100px auto' }}>
        <Title level={3} style={{ color: 'red' }}>Lỗi kết nối</Title>
        <Text>Không thể tải phòng chat. Lỗi này (403) thường xảy ra khi phiên đăng nhập của bạn hết hạn.</Text>
        <br />
        <Button type="primary" size="large" style={{ marginTop: '20px' }} onClick={() => {
            localStorage.clear(); 
            window.location.href = '/login'; 
        }}>
          Đăng nhập lại
        </Button>
      </div>
    );
  }

  const otherUserName = currentUser.userId === chatroom.buyerId 
      ? chatroom.sellerName 
      : chatroom.buyerName;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '100px auto' }}>
      <Title level={3}>Chat với {otherUserName}</Title>

      <List
        bordered
        style={{ height: '400px', overflowY: 'auto', background: '#f5f5f5' }}
        dataSource={messages}
        renderItem={(msg) => {
          const isMyMessage = msg.senderId === currentUser.userId;
          return (
            <List.Item style={{ 
              justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
              border: 'none' 
            }}>
              <div style={{
                background: isMyMessage ? '#1890ff' : '#e4e6eb',
                color: isMyMessage ? 'white' : 'black',
                padding: '8px 12px',
                borderRadius: '18px',
                maxWidth: '70%'
              }}>
                <Text style={{ color: isMyMessage ? 'white' : 'black' }}>
                  {msg.content}
                </Text>
              </div>
            </List.Item>
          );
        }}
      >
        <div ref={messagesEndRef} />
      </List>

      <Input.Group compact style={{ display: 'flex', marginTop: '10px' }}>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="Nhập tin nhắn..."
        />
        <Button type="primary" onClick={handleSendMessage}>
          Gửi
        </Button>
      </Input.Group>
    </div>
  );
}
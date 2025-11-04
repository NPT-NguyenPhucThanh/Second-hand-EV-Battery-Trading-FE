import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../../contexts/UserContext'; 
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getOrCreateChatroom, getMessages } from '../../../services/chatService'; 
import { Modal, Spin, Input, Button, List, Typography } from 'antd';

const { Text } = Typography;
const SOCKET_URL = 'http://localhost:8080/ws-chat';

export default function ChatModal({ open, onClose, sellerId, sellerName }) {

  const { user: currentUser, loading: authLoading } = useUser(); 
  
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

  const handleClose = () => {
    onClose(); 
    setMessages([]);
    setChatroom(null);
    setError(null);
    setNewMessage("");
  };

  const renderContent = () => {
    if (authLoading) {
      return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
    }

    if (!currentUser) {
         return (
             <div style={{ padding: '20px', textAlign: 'center' }}>
                <Text>Vui lòng đăng nhập để chat.</Text>
                <br />
                <Button type="primary" style={{ marginTop: '20px' }} href="/login">
                  Đi đến trang đăng nhập
                </Button>
             </div>
         );
     }

    if (loading) {
      return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
    }

    if (error) {
       return (
         <div style={{ padding: '20px', textAlign: 'center' }}>
            <Text type="danger">{error}</Text>
            <br />
            <Button type="primary" style={{ marginTop: '20px' }} onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
            }}>
              Đăng nhập lại
            </Button>
         </div>
       );
    }

    return (
      <>
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
            disabled={!stompClient || !stompClient.active}
          />
          <Button type="primary" onClick={handleSendMessage} disabled={!stompClient || !stompClient.active}>
            Gửi
          </Button>
        </Input.Group>
      </>
    );
  };

  return (
    <Modal
      title={`Chat với ${sellerName || 'người bán'}`}
      open={open}
      onCancel={handleClose}
      footer={null} 
      width={600}
      destroyOnClose={true} 
    >
      {renderContent()}
    </Modal>
  );
}
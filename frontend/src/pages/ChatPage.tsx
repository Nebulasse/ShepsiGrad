import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import './ChatPage.css';

const ChatPage: React.FC = () => {
  // Предполагаем, что данные пользователя хранятся в localStorage или context
  const currentUserId = localStorage.getItem('userId') || 'demo-user-id';
  const { chatId } = useParams<{ chatId: string }>();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(chatId);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatId) {
      setSelectedChatId(chatId);
    }
  }, [chatId]);

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    navigate(`/chats/${id}`);
  };

  return (
    <div className="chat-page">
      <h1>Сообщения</h1>
      
      <div className="chat-container">
        <div className="chat-sidebar">
          <ChatList 
            userId={currentUserId} 
            onSelectChat={handleSelectChat}
          />
        </div>
        
        <div className="chat-main">
          {selectedChatId ? (
            <ChatWindow 
              chatId={selectedChatId} 
              currentUserId={currentUserId}
            />
          ) : (
            <div className="no-chat-selected">
              <p>Выберите чат из списка или начните новый</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 
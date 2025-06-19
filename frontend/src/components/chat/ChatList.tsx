import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chat } from '../../services/chatService';
import chatService from '../../services/chatService';
import './ChatList.css';

interface ChatListProps {
  userId: string;
  onSelectChat?: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ userId, onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const userChats = await chatService.getUserChats(userId);
        setChats(userChats);
        setError(null);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Не удалось загрузить список чатов');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [userId]);

  const handleChatClick = (chatId: string) => {
    if (onSelectChat) {
      onSelectChat(chatId);
    }
  };

  if (isLoading) {
    return <div className="chat-list-loading">Загрузка чатов...</div>;
  }

  if (error) {
    return <div className="chat-list-error">{error}</div>;
  }

  if (chats.length === 0) {
    return <div className="chat-list-empty">У вас пока нет активных чатов</div>;
  }

  return (
    <div className="chat-list">
      <h2>Ваши сообщения</h2>
      <ul>
        {chats.map((chat) => {
          // Получаем ID другого участника (не текущего пользователя)
          const otherParticipantId = chat.participants.find(id => id !== userId) || '';
          
          return (
            <li 
              key={chat.id} 
              className={`chat-item ${chat.unreadCount ? 'unread' : ''}`}
              onClick={() => handleChatClick(chat.id)}
            >
              {onSelectChat ? (
                <div className="chat-link">
                  <div className="chat-avatar">
                    {/* Здесь может быть аватар */}
                    <div className="avatar-placeholder">{otherParticipantId.substring(0, 2).toUpperCase()}</div>
                  </div>
                  <div className="chat-info">
                    <div className="chat-header">
                      <span className="participant-name">Пользователь {otherParticipantId.substring(0, 8)}</span>
                      {chat.lastMessage && (
                        <span className="last-message-time">
                          {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <div className="last-message">
                        {chat.lastMessage.content.substring(0, 50)}
                        {chat.lastMessage.content.length > 50 ? '...' : ''}
                      </div>
                    )}
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <div className="unread-badge">{chat.unreadCount}</div>
                    )}
                  </div>
                </div>
              ) : (
                <Link to={`/chats/${chat.id}`} className="chat-link">
                  <div className="chat-avatar">
                    {/* Здесь может быть аватар */}
                    <div className="avatar-placeholder">{otherParticipantId.substring(0, 2).toUpperCase()}</div>
                  </div>
                  <div className="chat-info">
                    <div className="chat-header">
                      <span className="participant-name">Пользователь {otherParticipantId.substring(0, 8)}</span>
                      {chat.lastMessage && (
                        <span className="last-message-time">
                          {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <div className="last-message">
                        {chat.lastMessage.content.substring(0, 50)}
                        {chat.lastMessage.content.length > 50 ? '...' : ''}
                      </div>
                    )}
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <div className="unread-badge">{chat.unreadCount}</div>
                    )}
                  </div>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatList; 
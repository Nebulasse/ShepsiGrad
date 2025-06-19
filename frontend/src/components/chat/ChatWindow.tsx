import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../contexts/AuthContext';
import './ChatWindow.css';

interface Message {
  from: string;
  message: string;
  timestamp: Date;
}

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ recipientId, recipientName }) => {
  const { user } = useAuth();
  const { sendPrivateMessage, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    const message: Message = {
      from: user?.id || '',
      message: newMessage,
      timestamp: new Date()
    };

    sendPrivateMessage(recipientId, newMessage);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Заголовок чата */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{recipientName}</h2>
        <div className="text-sm text-gray-500">
          {isConnected ? 'Онлайн' : 'Оффлайн'}
        </div>
      </div>

      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.from === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.from === user?.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-sm">{msg.message}</div>
              <div className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Форма отправки сообщения */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Отправить
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 
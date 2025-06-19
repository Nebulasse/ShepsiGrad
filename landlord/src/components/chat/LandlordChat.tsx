import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: Date;
  propertyId?: string;
  bookingId?: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
}

const LandlordChat: React.FC = () => {
  const { user } = useAuth();
  const { sendPrivateMessage, isConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Загрузка списка объектов недвижимости
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/landlord/properties');
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error('Ошибка при загрузке объектов:', error);
      }
    };

    fetchProperties();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected || !selectedProperty) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      from: user?.id || '',
      to: selectedProperty,
      message: newMessage,
      timestamp: new Date(),
      propertyId: selectedProperty
    };

    sendPrivateMessage(selectedProperty, newMessage);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Список объектов */}
      <div className="w-1/4 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Объекты недвижимости</h2>
        </div>
        <div className="overflow-y-auto h-full">
          {properties.map(property => (
            <div
              key={property.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedProperty === property.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedProperty(property.id)}
            >
              <h3 className="font-medium">{property.title}</h3>
              <p className="text-sm text-gray-600">{property.address}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Чат */}
      <div className="flex-1 flex flex-col">
        {selectedProperty ? (
          <>
            <div className="p-4 border-b bg-white">
              <h2 className="text-lg font-semibold">
                {properties.find(p => p.id === selectedProperty)?.title}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter(msg => msg.propertyId === selectedProperty)
                .map(msg => (
                  <div
                    key={msg.id}
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
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Выберите объект недвижимости для просмотра сообщений
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordChat; 
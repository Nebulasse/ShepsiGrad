import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';

interface Notification {
  id: string;
  type: string;
  content: any;
  timestamp: Date;
  read: boolean;
}

const NotificationCenter: React.FC = () => {
  const { isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Здесь можно добавить загрузку существующих уведомлений с сервера
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  return (
    <div className="relative">
      {/* Кнопка уведомлений */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {getUnreadCount() > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {getUnreadCount()}
          </span>
        )}
      </button>

      {/* Панель уведомлений */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Уведомления</h3>
              {getUnreadCount() > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Отметить все как прочитанные
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Нет уведомлений
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">
                        {notification.content.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {notification.content.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'review' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  propertyId?: string;
  bookingId?: string;
}

const LandlordNotifications: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Загрузка уведомлений
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/landlord/notifications');
        const data = await response.json();
        setNotifications(data);
        updateUnreadCount(data);
      } catch (error) {
        console.error('Ошибка при загрузке уведомлений:', error);
      }
    };

    fetchNotifications();
  }, []);

  const updateUnreadCount = (notifs: Notification[]) => {
    setUnreadCount(notifs.filter(n => !n.read).length);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/landlord/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      updateUnreadCount(notifications);
    } catch (error) {
      console.error('Ошибка при отметке уведомления:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'message':
        return '💬';
      case 'review':
        return '⭐';
      case 'system':
        return '🔔';
      default:
        return '📌';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Уведомления</h2>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
              {unreadCount} новых
            </span>
          )}
        </div>
        
        <div className="divide-y">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {notification.message}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                      {!notification.read && (
                        <span className="text-xs text-blue-500">
                          Нажмите, чтобы отметить как прочитанное
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              Нет уведомлений
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordNotifications; 
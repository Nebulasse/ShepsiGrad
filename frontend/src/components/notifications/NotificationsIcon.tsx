import React, { useState, useEffect, useRef } from 'react';
import { notificationService } from '../../services/notificationService';
import './NotificationsIcon.css';

interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsIcon: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const notificationPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("NotificationsIcon component mounted");
    fetchNotifications();
    
    // Добавляем проверку наличия новых уведомлений каждую минуту
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Обработчик клика вне панели уведомлений для её закрытия
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationPanelRef]);

  // Функция для загрузки уведомлений
  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    console.log("Fetching notifications...");
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications({ limit: 10, page: 1 });
      console.log("Notifications fetched:", response);
      setNotifications(response.notifications || []);
      
      // Считаем количество непрочитанных уведомлений
      const unread = (response.notifications || []).filter(notification => !notification.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Ошибка при загрузке уведомлений:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для отметки уведомления как прочитанного
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Обновляем локальное состояние
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Уменьшаем счетчик непрочитанных
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Ошибка при отметке уведомления как прочитанного:', error);
    }
  };

  // Функция для отметки всех уведомлений как прочитанных
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Обновляем локальное состояние
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Сбрасываем счетчик непрочитанных
      setUnreadCount(0);
    } catch (error) {
      console.error('Ошибка при отметке всех уведомлений как прочитанных:', error);
    }
  };

  // Переключатель открытия/закрытия панели уведомлений
  const toggleNotifications = () => {
    setIsOpen(prev => !prev);
  };

  // Форматирование даты уведомления
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notifications-container" ref={notificationPanelRef}>
      <button 
        className="notifications-icon" 
        onClick={toggleNotifications}
        aria-label="Уведомления"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Уведомления</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read" 
                onClick={markAllAsRead}
              >
                Отметить все как прочитанные
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="notifications-loading">Загрузка...</div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              У вас пока нет уведомлений
            </div>
          ) : (
            <ul className="notifications-list">
              {notifications.map(notification => (
                <li 
                  key={notification._id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-date">{formatDate(notification.createdAt)}</div>
                  </div>
                  {!notification.isRead && (
                    <div className="unread-indicator"></div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsIcon; 
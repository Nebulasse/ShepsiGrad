import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import config from '../config';
import { useSocket } from '../hooks/useSocket';

// Тип уведомления
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

const Notifications = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { socket } = useSocket();
  
  // Загрузка уведомлений
  useEffect(() => {
    if (user && token) {
      fetchNotifications();
    }
  }, [user, token]);
  
  // Подписка на новые уведомления через сокеты
  useEffect(() => {
    if (socket) {
      // Подписка на новые уведомления
      socket.on('notification', handleNewNotification);
      
      return () => {
        socket.off('notification', handleNewNotification);
      };
    }
  }, [socket]);
  
  // Обработка нового уведомления
  const handleNewNotification = (notification: Notification) => {
    if (!notification) return;
    setNotifications(prev => [notification, ...prev]);
  };
  
  // Загрузка уведомлений с сервера
  const fetchNotifications = async () => {
    if (!user || !token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке уведомлений:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Обновление списка уведомлений
  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };
  
  // Отметка уведомления как прочитанное
  const markAsRead = async (notificationId: string) => {
    if (!user || !token || !notificationId) return;
    
    try {
      await axios.put(`${config.apiUrl}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Обновляем состояние уведомления локально
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Ошибка при отметке уведомления как прочитанное:', error);
    }
  };
  
  // Отметка всех уведомлений как прочитанные
  const markAllAsRead = async () => {
    if (!user || !token) return;
    
    try {
      await axios.put(`${config.apiUrl}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Обновляем состояние всех уведомлений локально
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Ошибка при отметке всех уведомлений как прочитанные:', error);
    }
  };
  
  // Обработка нажатия на уведомление
  const handleNotificationPress = (notification: Notification) => {
    if (!notification) return;
    
    // Отмечаем уведомление как прочитанное
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Навигация в зависимости от типа уведомления
    switch (notification.type) {
      case 'NEW_BOOKING':
      case 'BOOKING_CANCELLED':
      case 'BOOKING_REMINDER':
        if (notification.data?.bookingId) {
          router.push(`/booking/${notification.data.bookingId}`);
        }
        break;
      case 'NEW_MESSAGE':
        if (notification.data?.conversationId) {
          router.push(`/conversation/${notification.data.conversationId}`);
        }
        break;
      case 'NEW_REVIEW':
        if (notification.data?.propertyId) {
          router.push(`/property/${notification.data.propertyId}/reviews`);
        }
        break;
      case 'PROPERTY_UPDATES':
        if (notification.data?.propertyId) {
          router.push(`/property/${notification.data.propertyId}`);
        }
        break;
      default:
        // Для других типов уведомлений просто показываем детали
        break;
    }
  };
  
  // Получение иконки в зависимости от типа уведомления
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_BOOKING':
        return 'calendar';
      case 'BOOKING_CANCELLED':
        return 'close-circle';
      case 'BOOKING_REMINDER':
        return 'alarm';
      case 'NEW_MESSAGE':
        return 'chatbubble';
      case 'NEW_REVIEW':
        return 'star';
      case 'PROPERTY_UPDATES':
        return 'home';
      default:
        return 'notifications';
    }
  };
  
  // Форматирование даты с проверкой на корректность
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } catch (error) {
      console.error('Ошибка при форматировании даты:', error);
      return '';
    }
  };
  
  // Рендер элемента уведомления
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    if (!item) return null;
    
    const formattedDate = formatDate(item.createdAt);
    
    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={getNotificationIcon(item.type)} size={24} color="#4D8EFF" />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title || 'Уведомление'}</Text>
          <Text style={styles.notificationMessage}>{item.message || ''}</Text>
          <Text style={styles.notificationDate}>{formattedDate}</Text>
        </View>
        {!item.read && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Уведомления</Text>
      
      {!notifications || notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>У вас нет уведомлений</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item?.id || Math.random().toString()}
          renderItem={renderNotificationItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#888'
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'flex-start'
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff'
  },
  iconContainer: {
    marginRight: 12
  },
  notificationContent: {
    flex: 1
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  notificationMessage: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4
  },
  notificationDate: {
    fontSize: 12,
    color: '#888'
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066cc',
    marginTop: 4
  }
});

export default Notifications; 
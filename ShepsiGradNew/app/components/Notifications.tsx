import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';

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

const Notifications = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    // Загрузка уведомлений
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications?userId=${user.id}`);
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Ошибка при загрузке уведомлений:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Подписка на новые уведомления
    if (socket) {
      socket.on('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [user, socket]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Уведомления</Text>
      
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>У вас нет уведомлений</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationItem, !item.read && styles.unreadItem]}
              onPress={() => markAsRead(item.id)}
            >
              <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
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
  unreadItem: {
    backgroundColor: '#f0f8ff'
  },
  notificationIcon: {
    fontSize: 24,
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
  notificationTime: {
    fontSize: 12,
    color: '#888'
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066cc',
    marginTop: 4
  }
});

export default Notifications; 
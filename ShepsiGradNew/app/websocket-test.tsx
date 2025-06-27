import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WebSocketTest from './components/WebSocketTest';
import { useAuth } from './contexts/AuthContext';

export default function WebSocketTestScreen() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Требуется авторизация</Text>
        <Text style={styles.message}>
          Для тестирования WebSocket соединения необходимо войти в систему.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тестирование WebSocket</Text>
      <Text style={styles.subtitle}>
        ID текущего пользователя: <Text style={styles.userId}>{user?.id}</Text>
      </Text>
      <Text style={styles.description}>
        Используйте этот ID для тестирования соединения между двумя устройствами.
        Введите ID другого пользователя в поле получателя и отправьте сообщение.
      </Text>
      
      <WebSocketTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  userId: {
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Импортируем модули для инициализации полифилов
import './moduleConfig';

export default function TestScreen() {
  const [status, setStatus] = useState('Не подключено');
  const [error, setError] = useState<string | null>(null);

  const connectWebSocket = () => {
    try {
      setStatus('Подключение...');
      setError(null);

      const ws = new WebSocket('ws://echo.websocket.org');
      
      ws.onopen = () => {
        setStatus('Подключено');
        ws.send('Тестовое сообщение');
      };
      
      ws.onmessage = (event) => {
        setStatus(`Получено: ${event.data}`);
      };
      
      ws.onerror = (event) => {
        console.error('WebSocket ошибка:', event);
        setStatus('Ошибка');
        setError('Произошла ошибка при подключении');
      };
      
      ws.onclose = () => {
        setStatus('Отключено');
      };
    } catch (err) {
      console.error('Ошибка при создании WebSocket:', err);
      setStatus('Ошибка');
      setError(`${err}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест WebSocket</Text>
      <Text style={styles.status}>Статус: {status}</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      
      <TouchableOpacity 
        style={styles.button}
        onPress={connectWebSocket}
      >
        <Text style={styles.buttonText}>Подключиться</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    fontSize: 14,
    color: 'red',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0075FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 
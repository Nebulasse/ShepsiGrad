import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import useSocket from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import chatService from '../services/chatService';

interface Message {
  id?: string;
  from: string;
  message: string;
  timestamp: Date;
}

const WebSocketTest = () => {
  const { user } = useAuth();
  const { socket, isConnected, sendPrivateMessage } = useSocket();
  const [recipientId, setRecipientId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Отключено');

  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('Подключено');
    } else {
      setConnectionStatus('Отключено');
    }
  }, [isConnected]);

  useEffect(() => {
    if (!socket) return;

    // Обработчик для получения личных сообщений
    const handlePrivateMessage = (data: Message) => {
      setMessages(prev => [...prev, {
        from: data.from,
        message: data.message,
        timestamp: new Date(data.timestamp)
      }]);
    };

    // Подписываемся на события
    socket.on('private_message', handlePrivateMessage);

    // Отписываемся при размонтировании
    return () => {
      socket.off('private_message', handlePrivateMessage);
    };
  }, [socket]);

  const handleSendMessage = async () => {
    if (!recipientId || !message) {
      alert('Пожалуйста, введите ID получателя и сообщение');
      return;
    }

    try {
      // Отправляем сообщение через WebSocket
      if (isConnected && sendPrivateMessage) {
        sendPrivateMessage(recipientId, message);
        
        // Добавляем отправленное сообщение в список
        setMessages(prev => [...prev, {
          from: user?.id || 'me',
          message,
          timestamp: new Date()
        }]);
        
        setMessage('');
      } else {
        // Если WebSocket не подключен, используем HTTP
        const result = await chatService.testSendMessage(recipientId, message);
        
        // Добавляем отправленное сообщение в список
        setMessages(prev => [...prev, {
          from: user?.id || 'me',
          message,
          timestamp: new Date()
        }]);
        
        setMessage('');
      }
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      alert('Не удалось отправить сообщение');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Статус соединения:</Text>
        <Text style={[
          styles.statusValue, 
          { color: isConnected ? 'green' : 'red' }
        ]}>
          {connectionStatus}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ID получателя:</Text>
        <TextInput
          style={styles.input}
          value={recipientId}
          onChangeText={setRecipientId}
          placeholder="Введите ID получателя"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Сообщение:</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Введите сообщение"
          multiline
        />
      </View>

      <Button
        title="Отправить сообщение"
        onPress={handleSendMessage}
        disabled={!recipientId || !message}
      />

      <Text style={styles.messagesTitle}>История сообщений:</Text>
      
      {messages.length === 0 ? (
        <Text style={styles.noMessages}>Нет сообщений</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => `${item.from}-${index}`}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.from === user?.id ? styles.sentMessage : styles.receivedMessage
            ]}>
              <Text style={styles.messageHeader}>
                {item.from === user?.id ? 'Вы' : `От: ${item.from}`} • {formatTime(item.timestamp)}
              </Text>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          )}
          style={styles.messagesList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  messagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  noMessages: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
  },
  messageHeader: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
});

export default WebSocketTest; 
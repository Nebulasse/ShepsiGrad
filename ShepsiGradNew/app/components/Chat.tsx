import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: Date;
  propertyId?: string;
}

interface ChatProps {
  landlordId: string;
  propertyId: string;
  propertyTitle: string;
}

const Chat = ({ landlordId, propertyId, propertyTitle }: ChatProps) => {
  const { user } = useAuth();
  const { sendPrivateMessage, isConnected, socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Получение предыдущих сообщений
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?propertyId=${propertyId}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Ошибка при загрузке сообщений:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Подписка на новые сообщения
    socket.on('private_message', (message: ChatMessage) => {
      if (message.propertyId === propertyId) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket.off('private_message');
    };
  }, [socket, isConnected, propertyId]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      from: user?.id || '',
      to: landlordId,
      message: newMessage,
      timestamp: new Date(),
      propertyId
    };

    sendPrivateMessage(landlordId, newMessage, propertyId);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{propertyTitle}</Text>
        <View style={[styles.statusIndicator, isConnected ? styles.connected : styles.disconnected]} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        style={styles.messageList}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.from === user?.id ? styles.sentMessage : styles.receivedMessage
          ]}>
            <Text style={styles.messageText}>{item.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Введите сообщение..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!isConnected || !newMessage.trim()) && styles.disabledButton]}
          onPress={handleSendMessage}
          disabled={!isConnected || !newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Отправить</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  connected: {
    backgroundColor: '#4CAF50'
  },
  disconnected: {
    backgroundColor: '#F44336'
  },
  messageList: {
    flex: 1,
    padding: 16
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0066cc',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    color: '#fff',
    fontSize: 16
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#0066cc',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center'
  },
  disabledButton: {
    backgroundColor: '#cccccc'
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default Chat; 
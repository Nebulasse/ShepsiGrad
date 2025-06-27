import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  RefreshControl
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { syncService } from './services/syncService';
import { bookingService } from './services/bookingService';
import { useSocket } from './hooks/useSocket';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chat, useChatService } from './services/chatService';
import { CHAT_MODULE } from './moduleConfig';
import { CHAT_CONFIG } from './config';

// Типы данных
interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  timestamp: string;
  isRead: boolean;
  isLandlord: boolean;
}

interface Conversation {
  id: string;
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  tenantAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function ChatScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  
  const chatService = useChatService();
  const socket = useSocket();

  // Загрузка списка чатов
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const chatsList = await chatService.getLandlordChats();
      setChats(chatsList);
      
      // Получаем количество непрочитанных сообщений для каждого чата
      const counts: Record<string, number> = {};
      for (const chat of chatsList) {
        try {
          const response = await chatService.getChatMessages(chat.id, { page: 1, limit: 1 });
          counts[chat.id] = response.messages.filter(msg => !msg.is_read && msg.sender_id !== chat.host_id).length;
        } catch (error) {
          console.error(`Ошибка при получении непрочитанных сообщений для чата ${chat.id}:`, error);
        }
      }
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Ошибка при загрузке чатов:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chatService]);

  // Обновление списка чатов при pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadChats();
  }, [loadChats]);

  // Подписка на обновления чатов
  useEffect(() => {
    loadChats();
    
    // Подписываемся на обновления чатов через сокет
    if (socket) {
      socket.on('new_message', (data: Message) => {
        // Обновляем список чатов при получении нового сообщения
        loadChats();
        
        // Увеличиваем счетчик непрочитанных сообщений
        if (data.chat_id && data.sender_id) {
          setUnreadCounts(prev => ({
            ...prev,
            [data.chat_id]: (prev[data.chat_id] || 0) + 1
          }));
        }
      });
    }
    
    // Подписываемся на обновления через сервис синхронизации
    const unsubscribe = syncService.subscribe(SyncChannel.CHAT_MESSAGE, (event) => {
      if (event.type === 'new_message') {
        loadChats();
      }
    });
    
    return () => {
      if (socket) {
        socket.off('new_message');
      }
      unsubscribe();
    };
  }, [socket, loadChats]);

  // Переход к конкретному чату
  const handleChatPress = (chat: Chat) => {
    router.push(`/conversation/${chat.id}`);
  };

  // Форматирование времени последнего сообщения
  const formatLastMessageTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Сегодня - показываем только время
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Вчера
      return 'Вчера';
    } else if (diffDays < 7) {
      // В течение недели - показываем день недели
      const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      return days[date.getDay()];
    } else {
      // Более недели назад - показываем дату
      return date.toLocaleDateString();
    }
  };

  // Рендер элемента чата
  const renderChatItem = ({ item }: { item: Chat }) => {
    const unreadCount = unreadCounts[item.id] || 0;
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.guest?.name ? item.guest.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.guest?.name || 'Гость'}
            </Text>
            <Text style={styles.chatTime}>
              {formatLastMessageTime(item.last_message_time)}
            </Text>
          </View>
          
          <View style={styles.chatPreview}>
            <Text style={styles.chatMessage} numberOfLines={1}>
              {item.property?.title ? `${item.property.title}: ` : ''}
              {item.last_message || 'Нет сообщений'}
            </Text>
            
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Чаты</Text>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : (
        <>
          {chats.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>У вас пока нет чатов</Text>
              <Text style={styles.emptySubtext}>
                Когда гости будут интересоваться вашими объектами или бронировать их,
                здесь появятся чаты с ними
              </Text>
            </View>
          ) : (
            <FlatList
              data={chats}
              keyExtractor={(item) => item.id}
              renderItem={renderChatItem}
              contentContainerStyle={styles.chatList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#0066CC']}
                />
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatList: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
}); 
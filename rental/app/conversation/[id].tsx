import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Message, Chat, chatService, useChatService } from '../services/chatService';
import { useSocket } from '../hooks/useSocket';
import { SyncChannel, syncService } from '../services/syncService';
import { CHAT_CONFIG } from '../config';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const { subscribeToChat, sendMessageRealtime } = useChatService();
  const messagesListRef = useRef<FlatList>(null);
  
  // Загрузка данных чата
  useEffect(() => {
    if (!id) return;
    
    const loadChat = async () => {
      try {
        setLoading(true);
        const chatData = await chatService.getChatById(id);
        setChat(chatData);
      } catch (error) {
        console.error(`Ошибка при загрузке чата ${id}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChat();
  }, [id]);
  
  // Загрузка сообщений
  useEffect(() => {
    if (!id) return;
    
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await chatService.getChatMessages(id, { page: 1, limit: CHAT_CONFIG.messagesPerPage });
        setMessages(response.messages.reverse());
        setTotalPages(response.pages);
        setPage(1);
      } catch (error) {
        console.error(`Ошибка при загрузке сообщений для чата ${id}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
  }, [id]);
  
  // Подписка на новые сообщения
  useEffect(() => {
    if (!id) return;
    
    // Подписываемся на обновления через WebSocket
    const unsubscribe = subscribeToChat(id, (newMessage) => {
      setMessages(prevMessages => {
        // Проверяем, есть ли уже это сообщение в списке
        const exists = prevMessages.some(msg => msg.id === newMessage.id);
        if (exists) return prevMessages;
        
        // Добавляем новое сообщение и сортируем по времени
        const updatedMessages = [...prevMessages, newMessage].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        // Прокручиваем к последнему сообщению
        setTimeout(() => {
          messagesListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        
        return updatedMessages;
      });
    });
    
    // Подписываемся на обновления через сервис синхронизации
    const syncUnsubscribe = syncService.subscribe(SyncChannel.CHAT_MESSAGE, (event) => {
      if (event.type === 'new_message' && event.payload.chat_id === id) {
        // Обновляем список сообщений
        setMessages(prevMessages => {
          const newMessage = event.payload;
          
          // Проверяем, есть ли уже это сообщение в списке
          const exists = prevMessages.some(msg => msg.id === newMessage.id);
          if (exists) return prevMessages;
          
          // Добавляем новое сообщение и сортируем по времени
          const updatedMessages = [...prevMessages, newMessage].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          // Прокручиваем к последнему сообщению
          setTimeout(() => {
            messagesListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          
          return updatedMessages;
        });
      }
    });
    
    // Отмечаем сообщения как прочитанные
    const markAsRead = async () => {
      try {
        await chatService.markMessagesAsRead(id);
      } catch (error) {
        console.error(`Ошибка при отметке сообщений как прочитанных в чате ${id}:`, error);
      }
    };
    
    markAsRead();
    
    return () => {
      unsubscribe();
      syncUnsubscribe();
    };
  }, [id, subscribeToChat]);
  
  // Загрузка дополнительных сообщений при прокрутке вверх
  const handleLoadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await chatService.getChatMessages(id, { 
        page: nextPage, 
        limit: CHAT_CONFIG.messagesPerPage 
      });
      
      // Добавляем сообщения в начало списка
      setMessages(prevMessages => [
        ...response.messages.reverse(),
        ...prevMessages
      ]);
      
      setPage(nextPage);
    } catch (error) {
      console.error(`Ошибка при загрузке дополнительных сообщений для чата ${id}:`, error);
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Отправка сообщения
  const handleSendMessage = async () => {
    if (!messageText.trim() || !id) return;
    
    try {
      setSending(true);
      
      // Отправляем через WebSocket или HTTP, если WebSocket недоступен
      await sendMessageRealtime(id, messageText.trim());
      
      // Очищаем поле ввода
      setMessageText('');
      
      // Прокручиваем к последнему сообщению
      setTimeout(() => {
        messagesListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error(`Ошибка при отправке сообщения в чат ${id}:`, error);
      alert('Не удалось отправить сообщение. Пожалуйста, попробуйте еще раз.');
    } finally {
      setSending(false);
    }
  };
  
  // Форматирование времени сообщения
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Форматирование даты для разделителя
  const formatDateDivider = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };
  
  // Проверка, нужно ли показывать разделитель даты
  const shouldShowDateDivider = (currentMsg: Message, prevMsg: Message | null) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    
    return currentDate !== prevDate;
  };
  
  // Рендер элемента сообщения
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const isLandlord = chat?.host_id === item.sender_id;
    
    return (
      <View>
        {shouldShowDateDivider(item, prevMsg) && (
          <View style={styles.dateDivider}>
            <Text style={styles.dateDividerText}>
              {formatDateDivider(item.created_at)}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isLandlord ? styles.outgoingMessage : styles.incomingMessage
        ]}>
          <View style={[
            styles.messageBubble,
            isLandlord ? styles.outgoingBubble : styles.incomingBubble
          ]}>
            <Text style={[
              styles.messageText,
              isLandlord ? styles.outgoingText : styles.incomingText
            ]}>
              {item.content}
            </Text>
            <Text style={[
              styles.messageTime,
              isLandlord ? styles.outgoingTime : styles.incomingTime
            ]}>
              {formatMessageTime(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  if (loading && !chat) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {chat?.guest?.name || 'Гость'}
          </Text>
          {chat?.property?.title && (
            <Text style={styles.headerSubtitle}>
              {chat.property.title}
            </Text>
          )}
        </View>
        
        {chat?.property_id && (
          <TouchableOpacity 
            style={styles.propertyButton}
            onPress={() => router.push(`/properties/${chat.property_id}`)}
          >
            <Ionicons name="home-outline" size={24} color="#0066CC" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Список сообщений */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={messagesListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={loadingMore ? (
            <ActivityIndicator size="small" color="#999" style={styles.loadingMore} />
          ) : null}
        />
        
        {/* Поле ввода сообщения */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Введите сообщение..."
            multiline
            maxLength={CHAT_CONFIG.maxMessageLength}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!messageText.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  propertyButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  outgoingMessage: {
    justifyContent: 'flex-end',
  },
  incomingMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  outgoingBubble: {
    backgroundColor: '#0066CC',
    borderBottomRightRadius: 4,
  },
  incomingBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  outgoingText: {
    color: '#fff',
  },
  incomingText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  outgoingTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  incomingTime: {
    color: '#999',
  },
  dateDivider: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateDividerText: {
    fontSize: 14,
    color: '#999',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingMore: {
    marginVertical: 16,
  },
}); 
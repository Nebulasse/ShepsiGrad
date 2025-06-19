import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import chatService from '../services/chatService';
import { Message, Conversation, Attachment } from '../types/Chat';
import MessageItem from '../components/chat/MessageItem';

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const conversationId = params.id as string;
  const propertyTitle = params.propertyTitle as string | undefined;
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
  
  const flatListRef = useRef<FlatList>(null);
  
  // Загружаем диалог и сообщения при монтировании компонента
  useEffect(() => {
    const loadChatData = async () => {
      try {
        setError(null);
        
        // Загружаем информацию о диалоге
        const conversationData = await chatService.getConversationById(conversationId);
        if (conversationData) {
          setConversation(conversationData);
        } else {
          setError('Диалог не найден');
          return;
        }
        
        // Загружаем сообщения диалога
        const messagesData = await chatService.getConversationMessages({ conversationId });
        setMessages(messagesData);
        
        // Отмечаем сообщения как прочитанные
        await chatService.markMessagesAsRead(conversationId);
      } catch (err) {
        console.error('Ошибка при загрузке чата:', err);
        setError('Не удалось загрузить сообщения. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    loadChatData();
    
    // Имитация получения новых сообщений (для демонстрации)
    const intervalId = setInterval(() => {
      chatService.getConversationMessages({ conversationId })
        .then(updatedMessages => {
          if (updatedMessages.length > messages.length) {
            setMessages(updatedMessages);
            chatService.markMessagesAsRead(conversationId);
          }
        })
        .catch(err => console.error('Ошибка при обновлении сообщений:', err));
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [conversationId]);
  
  // Прокручиваем список вниз при добавлении новых сообщений
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages, loading]);
  
  // Получаем данные о собеседнике
  const getOtherParticipant = () => {
    if (!conversation) return null;
    return conversation.participants.find(p => p.id !== 'current-user');
  };
  
  // Отправляем новое сообщение
  const handleSendMessage = async () => {
    if (!messageText.trim() && !selectedAttachments.length) return;
    
    try {
      setSendingMessage(true);
      
      // Отправляем сообщение
      await chatService.sendMessage({
        conversationId,
        content: messageText.trim(),
        attachments: selectedAttachments.map(att => ({
          type: att.type,
          url: att.url,
          name: att.name,
          size: att.size,
          thumbnail: att.thumbnail,
          mimeType: att.mimeType
        }))
      });
      
      // Очищаем поле ввода
      setMessageText('');
      setSelectedAttachments([]);
      
      // Загружаем обновленные сообщения
      const updatedMessages = await chatService.getConversationMessages({ conversationId });
      setMessages(updatedMessages);
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err);
      alert('Не удалось отправить сообщение. Пожалуйста, попробуйте еще раз.');
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Обрабатываем нажатие на изображение
  const handleImagePress = (attachment: Attachment) => {
    setSelectedImage(attachment);
  };
  
  // Выбор изображения из галереи
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Создаем объект вложения
        const newAttachment: Attachment = {
          id: `temp-${Date.now()}`,
          type: 'image',
          url: asset.uri,
          name: asset.fileName || 'image.jpg',
          size: asset.fileSize || 0,
          mimeType: asset.mimeType || 'image/jpeg'
        };
        
        setSelectedAttachments([...selectedAttachments, newAttachment]);
      }
    } catch (err) {
      console.error('Ошибка при выборе изображения:', err);
      alert('Не удалось загрузить изображение. Пожалуйста, попробуйте еще раз.');
    }
  };
  
  // Удаление выбранного вложения
  const removeAttachment = (id: string) => {
    setSelectedAttachments(selectedAttachments.filter(att => att.id !== id));
  };
  
  // Рендер выбранных вложений
  const renderSelectedAttachments = () => {
    if (selectedAttachments.length === 0) return null;
    
    return (
      <View style={styles.selectedAttachments}>
        {selectedAttachments.map(attachment => (
          <View key={attachment.id} style={styles.selectedAttachmentItem}>
            {attachment.type === 'image' && (
              <Image 
                source={{ uri: attachment.url }} 
                style={styles.selectedAttachmentImage}
              />
            )}
            <TouchableOpacity 
              style={styles.removeAttachmentButton}
              onPress={() => removeAttachment(attachment.id)}
            >
              <Ionicons name="close-circle" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };
  
  // Рендер заголовка
  const renderHeader = () => {
    const otherParticipant = getOtherParticipant();
    
    return {
      title: otherParticipant?.name || 'Чат',
      headerTitle: () => (
        <View style={styles.headerContainer}>
          {otherParticipant?.avatar ? (
            <Image 
              source={{ uri: otherParticipant.avatar }} 
              style={styles.headerAvatar}
            />
          ) : (
            <View style={[styles.headerAvatar, styles.defaultAvatar]}>
              <Text style={styles.avatarText}>
                {otherParticipant?.name.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.headerTitle}>{otherParticipant?.name || 'Неизвестный пользователь'}</Text>
            {propertyTitle && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {propertyTitle}
              </Text>
            )}
          </View>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            if (conversation?.propertyId) {
              router.push(`/property/${conversation.propertyId}`);
            }
          }}
          disabled={!conversation?.propertyId}
        >
          <Ionicons 
            name="home-outline" 
            size={24} 
            color={conversation?.propertyId ? "#0078FF" : "#CCCCCC"} 
          />
        </TouchableOpacity>
      ),
    };
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <StatusBar style="dark" />
      
      <Stack.Screen
        options={renderHeader()}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0078FF" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Вернуться назад</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => (
              <MessageItem 
                message={item} 
                isCurrentUser={item.senderId === 'current-user'}
                onImagePress={handleImagePress}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
            onContentSizeChange={() => 
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
          
          <View style={styles.inputContainer}>
            {renderSelectedAttachments()}
            
            <View style={styles.inputRow}>
              <TouchableOpacity 
                style={styles.attachButton}
                onPress={pickImage}
              >
                <Ionicons name="attach" size={24} color="#0078FF" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                placeholder="Введите сообщение..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
              />
              
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  (!messageText.trim() && !selectedAttachments.length) && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={(!messageText.trim() && !selectedAttachments.length) || sendingMessage}
              >
                {sendingMessage ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Модальное окно для просмотра изображения */}
          <Modal
            visible={!!selectedImage}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setSelectedImage(null)}
          >
            <View style={styles.imageViewerContainer}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              
              {selectedImage && (
                <Image 
                  source={{ uri: selectedImage.url }} 
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </Modal>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  defaultAvatar: {
    backgroundColor: '#0078FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    maxWidth: 150,
  },
  headerButton: {
    marginLeft: 8,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0078FF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  messagesList: {
    paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 40,
    maxHeight: 120,
    fontSize: 16,
  },
  attachButton: {
    padding: 10,
    marginRight: 4,
  },
  sendButton: {
    backgroundColor: '#0078FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  selectedAttachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    marginBottom: 8,
  },
  selectedAttachmentItem: {
    position: 'relative',
    margin: 4,
  },
  selectedAttachmentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width,
    height: height * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
}); 
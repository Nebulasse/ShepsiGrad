import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Conversation } from '../../types/Chat';

interface ConversationItemProps {
  conversation: Conversation;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation }) => {
  // Получаем другого участника (не текущего пользователя)
  const otherParticipant = conversation.participants.find(
    p => p.id !== 'current-user'
  );

  // Форматируем дату последнего сообщения
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: ru });
    } else if (isYesterday(date)) {
      return 'Вчера';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE', { locale: ru });
    } else if (isThisYear(date)) {
      return format(date, 'd MMM', { locale: ru });
    } else {
      return format(date, 'dd.MM.yyyy', { locale: ru });
    }
  };

  // Обрабатываем нажатие на элемент диалога
  const handlePress = () => {
    router.push({
      pathname: `/chat/${conversation.id}`,
      params: {
        propertyId: conversation.propertyId,
        propertyTitle: conversation.propertyTitle
      }
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Аватар собеседника */}
      <View style={styles.avatarContainer}>
        {otherParticipant?.avatar ? (
          <Image 
            source={{ uri: otherParticipant.avatar }} 
            style={styles.avatar} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Text style={styles.avatarText}>
              {otherParticipant?.name.charAt(0) || '?'}
            </Text>
          </View>
        )}
        {otherParticipant?.role === 'host' && (
          <View style={styles.badge}>
            <Ionicons name="home" size={10} color="#fff" />
          </View>
        )}
      </View>
      
      {/* Информация о диалоге */}
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {otherParticipant?.name || 'Неизвестный пользователь'}
          </Text>
          {conversation.lastMessage && (
            <Text style={styles.time}>
              {formatMessageDate(conversation.lastMessage.timestamp)}
            </Text>
          )}
        </View>
        
        <View style={styles.bottomRow}>
          {conversation.propertyTitle && (
            <Text style={styles.propertyName} numberOfLines={1}>
              {conversation.propertyTitle}
            </Text>
          )}
          
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        {conversation.lastMessage && (
          <Text style={[
            styles.lastMessage,
            !conversation.lastMessage.isRead && 
            conversation.lastMessage.senderId !== 'current-user' && 
            styles.unreadMessage
          ]} numberOfLines={2}>
            {conversation.lastMessage.content}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: '#FFFFFF'
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    backgroundColor: '#0078FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0078FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 13,
    color: '#0078FF',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#0078FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  unreadMessage: {
    color: '#000000',
    fontWeight: '500',
  },
});

export default ConversationItem; 
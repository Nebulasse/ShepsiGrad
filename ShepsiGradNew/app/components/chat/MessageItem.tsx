import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

import { Message, Attachment } from '../../types/Chat';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  onImagePress?: (attachment: Attachment) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isCurrentUser,
  onImagePress
}) => {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ru });
  };

  // Обработчик нажатия на изображение
  const handleImagePress = (attachment: Attachment) => {
    if (onImagePress) {
      onImagePress(attachment);
    }
  };

  // Рендер вложения
  const renderAttachment = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <TouchableOpacity 
            key={attachment.id}
            onPress={() => handleImagePress(attachment)}
            style={styles.imageContainer}
          >
            <Image 
              source={{ uri: attachment.url }} 
              style={styles.image} 
              resizeMode="cover"
            />
          </TouchableOpacity>
        );
      case 'document':
        return (
          <TouchableOpacity 
            key={attachment.id}
            style={styles.documentContainer}
          >
            <Ionicons name="document-text-outline" size={24} color="#0078FF" />
            <Text style={styles.documentName} numberOfLines={1}>
              {attachment.name || 'Документ'}
            </Text>
            {attachment.size && (
              <Text style={styles.documentSize}>
                {(attachment.size / 1024).toFixed(1)} KB
              </Text>
            )}
          </TouchableOpacity>
        );
      case 'location':
        return (
          <TouchableOpacity 
            key={attachment.id}
            style={styles.locationContainer}
          >
            <Image 
              source={{ uri: attachment.thumbnail || attachment.url }} 
              style={styles.locationImage} 
              resizeMode="cover"
            />
            <View style={styles.locationMarker}>
              <Ionicons name="location" size={16} color="#FF3B30" />
            </View>
            <Text style={styles.locationText}>Расположение</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.rightContainer : styles.leftContainer
    ]}>
      {!isCurrentUser && message.senderAvatar && (
        <Image 
          source={{ uri: message.senderAvatar }} 
          style={styles.avatar} 
        />
      )}
      
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.rightMessage : styles.leftMessage
      ]}>
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map(attachment => renderAttachment(attachment))}
          </View>
        )}
        
        <Text style={styles.messageText}>{message.content}</Text>
        
        <View style={styles.messageFooter}>
          <Text style={styles.timeText}>
            {formatTime(message.timestamp)}
          </Text>
          
          {isCurrentUser && (
            <Ionicons 
              name={message.isRead ? "checkmark-done" : "checkmark"} 
              size={14} 
              color={message.isRead ? "#0078FF" : "#8E8E93"} 
              style={styles.readIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    maxWidth: '90%',
  },
  leftContainer: {
    alignSelf: 'flex-start',
  },
  rightContainer: {
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 18,
    maxWidth: '90%',
  },
  leftMessage: {
    backgroundColor: '#F2F2F7',
    borderBottomLeftRadius: 4,
  },
  rightMessage: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  readIcon: {
    marginLeft: 4,
  },
  attachmentsContainer: {
    marginBottom: 8,
  },
  imageContainer: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  documentName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  documentSize: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  locationContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  locationImage: {
    width: '100%',
    height: '100%',
  },
  locationMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  locationText: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#FFFFFF',
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
  },
});

export default MessageItem; 
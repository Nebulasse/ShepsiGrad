import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import chatService from '../../services/chatService';
import { ConversationCreateData } from '../../types/Chat';

interface CreateConversationModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId?: string;
  propertyTitle?: string;
  hostId?: string;
  hostName?: string;
}

const CreateConversationModal: React.FC<CreateConversationModalProps> = ({
  visible,
  onClose,
  propertyId,
  propertyTitle,
  hostId,
  hostName
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Обработчик создания нового диалога
  const handleCreateConversation = async () => {
    if (!message.trim()) {
      setError('Пожалуйста, введите сообщение');
      return;
    }

    if (!hostId) {
      setError('Не указан ID владельца объекта');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Создаем данные для нового диалога
      const conversationData: ConversationCreateData = {
        participantIds: ['current-user', hostId],
        initialMessage: message.trim(),
        propertyId: propertyId
      };

      // Создаем новый диалог
      const newConversation = await chatService.createConversation(conversationData);
      
      // Закрываем модальное окно
      onClose();
      
      // Переходим к новому диалогу
      router.push({
        pathname: `/conversation/${newConversation.id}`,
        params: {
          propertyTitle
        }
      });
    } catch (err) {
      console.error('Ошибка при создании диалога:', err);
      setError('Не удалось создать диалог. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  // Закрытие клавиатуры при нажатии за пределами формы
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Новое сообщение</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  disabled={isLoading}
                >
                  <Ionicons name="close" size={24} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <View style={styles.recipientContainer}>
                <Text style={styles.recipientLabel}>Получатель:</Text>
                <Text style={styles.recipientName}>{hostName || 'Владелец объекта'}</Text>
              </View>

              {propertyTitle && (
                <View style={styles.propertyContainer}>
                  <Ionicons name="home-outline" size={18} color="#0078FF" style={styles.propertyIcon} />
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {propertyTitle}
                  </Text>
                </View>
              )}

              <TextInput
                style={styles.messageInput}
                placeholder="Введите сообщение..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                maxLength={500}
                editable={!isLoading}
              />
              
              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!message.trim() || isLoading) && styles.disabledButton
                ]}
                onPress={handleCreateConversation}
                disabled={!message.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendButtonText}>Отправить</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipientLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 8,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
  },
  propertyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  propertyIcon: {
    marginRight: 8,
  },
  propertyTitle: {
    fontSize: 14,
    color: '#0078FF',
    flex: 1,
  },
  messageInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#0078FF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateConversationModal; 
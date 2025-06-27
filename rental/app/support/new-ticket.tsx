import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supportService } from '../services/supportService';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

export default function NewTicketScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Загрузка категорий поддержки
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await supportService.getSupportCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        // Используем статические данные при ошибке загрузки
        setCategories([
          'Техническая проблема',
          'Вопрос по бронированиям',
          'Финансовый вопрос',
          'Предложение по улучшению',
          'Другое'
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Функция для выбора изображения
  const pickImage = async () => {
    try {
      setUploadingAttachment(true);
      
      // Запрос разрешений на доступ к галерее
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Для загрузки изображений необходимо разрешение на доступ к галерее');
        return;
      }
      
      // Открытие галереи для выбора изображения
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Создаем объект для загрузки
        const imageUri = selectedImage.uri;
        const filename = imageUri.split('/').pop();
        
        // Определяем тип файла
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        // Создаем объект для загрузки
        const fileToUpload = {
          uri: imageUri,
          name: filename,
          type
        };
        
        // Загружаем изображение на сервер
        const uploadResult = await supportService.uploadAttachment(fileToUpload);
        
        // Добавляем загруженное изображение в список вложений
        setAttachments([...attachments, uploadResult.id]);
        
        Alert.alert('Успех', 'Изображение успешно загружено');
      }
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить изображение. Пожалуйста, попробуйте позже.');
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Функция для создания тикета
  const createTicket = async () => {
    // Валидация полей
    if (!subject.trim()) {
      Alert.alert('Ошибка', 'Введите тему обращения');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Ошибка', 'Введите сообщение');
      return;
    }

    try {
      setIsLoading(true);
      await supportService.createTicket({
        subject,
        message,
        category: category || undefined,
        priority: priority as 'low' | 'medium' | 'high',
        attachments: attachments.length > 0 ? attachments : undefined
      });
      
      Alert.alert(
        'Успех',
        'Ваше обращение успешно создано. Мы свяжемся с вами в ближайшее время.',
        [
          { 
            text: 'OK', 
            onPress: () => router.push('/support/tickets') 
          }
        ]
      );
    } catch (error) {
      console.error('Ошибка при создании тикета:', error);
      Alert.alert('Ошибка', 'Не удалось создать обращение. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Новое обращение' }} />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Тема обращения</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите тему обращения"
              value={subject}
              onChangeText={setSubject}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Категория</Text>
            {loadingCategories ? (
              <ActivityIndicator size="small" color="#4D8EFF" />
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Выберите категорию" value="" />
                  {categories.map((cat, index) => (
                    <Picker.Item key={index} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Приоритет</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={priority}
                onValueChange={(itemValue) => setPriority(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Низкий" value="low" />
                <Picker.Item label="Средний" value="medium" />
                <Picker.Item label="Высокий" value="high" />
              </Picker>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Сообщение</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Опишите вашу проблему или вопрос подробно..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.attachmentContainer}>
            <Text style={styles.label}>Вложения</Text>
            
            <TouchableOpacity 
              style={styles.attachButton} 
              onPress={pickImage}
              disabled={uploadingAttachment}
            >
              {uploadingAttachment ? (
                <ActivityIndicator size="small" color="#4D8EFF" />
              ) : (
                <>
                  <Ionicons name="attach" size={20} color="#4D8EFF" />
                  <Text style={styles.attachButtonText}>Прикрепить фото</Text>
                </>
              )}
            </TouchableOpacity>
            
            {attachments.length > 0 && (
              <Text style={styles.attachmentInfo}>
                Прикреплено файлов: {attachments.length}
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!subject || !message) && styles.submitButtonDisabled
            ]}
            onPress={createTicket}
            disabled={isLoading || !subject || !message}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Создать обращение</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  messageInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 200,
    textAlignVertical: 'top',
  },
  attachmentContainer: {
    marginBottom: 24,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  attachButtonText: {
    color: '#4D8EFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  attachmentInfo: {
    marginTop: 12,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#4D8EFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A0C3FF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
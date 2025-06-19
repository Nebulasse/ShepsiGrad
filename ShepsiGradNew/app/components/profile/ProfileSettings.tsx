import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../services/api';

interface ProfileSettingsProps {
  userData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function ProfileSettings({ userData, onSave, onCancel }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: userData?.first_name || '',
    last_name: userData?.last_name || '',
    phone: userData?.phone || '',
    email: userData?.email || '',
    avatar_url: userData?.avatar_url || '',
    bio: userData?.bio || '',
    notifications_enabled: userData?.notifications_enabled !== false,
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({
      ...passwordData,
      [field]: value,
    });
  };

  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нам нужны разрешения для доступа к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // Загрузка изображения на сервер
        setIsLoading(true);
        try {
          const formData = new FormData();
          formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'profile-image.jpg',
          } as any);

          const response = await api.post('/users/avatar', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data && response.data.url) {
            setFormData(prev => ({
              ...prev,
              avatar_url: response.data.url,
            }));
            Alert.alert('Успех', 'Аватар успешно загружен');
          }
        } catch (error) {
          console.error('Error uploading avatar:', error);
          Alert.alert('Ошибка', 'Не удалось загрузить аватар');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      Alert.alert('Ошибка', 'Имя не может быть пустым');
      return false;
    }

    if (!formData.last_name.trim()) {
      Alert.alert('Ошибка', 'Фамилия не может быть пустой');
      return false;
    }

    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordData.current_password) {
      Alert.alert('Ошибка', 'Введите текущий пароль');
      return false;
    }

    if (!passwordData.new_password) {
      Alert.alert('Ошибка', 'Введите новый пароль');
      return false;
    }

    if (passwordData.new_password.length < 6) {
      Alert.alert('Ошибка', 'Новый пароль должен содержать не менее 6 символов');
      return false;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSave(formData);
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      await api.put('/users/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      Alert.alert('Успех', 'Пароль успешно изменен');
      setShowPasswordChange(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Ошибка', 'Не удалось изменить пароль. Проверьте текущий пароль.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Основная информация</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Имя</Text>
          <TextInput
            style={styles.input}
            value={formData.first_name}
            onChangeText={(value) => handleChange('first_name', value)}
            placeholder="Введите имя"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Фамилия</Text>
          <TextInput
            style={styles.input}
            value={formData.last_name}
            onChangeText={(value) => handleChange('last_name', value)}
            placeholder="Введите фамилию"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Телефон</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', value)}
            placeholder="Введите телефон"
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { color: '#666' }]}
            value={formData.email}
            editable={false}
          />
          <Text style={styles.helperText}>Email нельзя изменить</Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>О себе</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(value) => handleChange('bio', value)}
            placeholder="Расскажите о себе"
            multiline
            numberOfLines={4}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Фото профиля</Text>
        
        <TouchableOpacity 
          style={styles.photoButton}
          onPress={pickImage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <>
              <Ionicons name="camera-outline" size={24} color="#007AFF" />
              <Text style={styles.photoButtonText}>
                {formData.avatar_url ? 'Изменить фото' : 'Загрузить фото'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Безопасность</Text>
        
        <TouchableOpacity 
          style={styles.securityButton}
          onPress={() => setShowPasswordChange(!showPasswordChange)}
        >
          <Ionicons name="lock-closed-outline" size={24} color="#007AFF" />
          <Text style={styles.securityButtonText}>Изменить пароль</Text>
          <Ionicons 
            name={showPasswordChange ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#007AFF" 
          />
        </TouchableOpacity>
        
        {showPasswordChange && (
          <View style={styles.passwordSection}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Текущий пароль</Text>
              <TextInput
                style={styles.input}
                value={passwordData.current_password}
                onChangeText={(value) => handlePasswordChange('current_password', value)}
                placeholder="Введите текущий пароль"
                secureTextEntry
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Новый пароль</Text>
              <TextInput
                style={styles.input}
                value={passwordData.new_password}
                onChangeText={(value) => handlePasswordChange('new_password', value)}
                placeholder="Минимум 6 символов"
                secureTextEntry
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Подтверждение пароля</Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirm_password}
                onChangeText={(value) => handlePasswordChange('confirm_password', value)}
                placeholder="Повторите новый пароль"
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={handlePasswordSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Сохранить пароль</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Уведомления</Text>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Включить уведомления</Text>
          <Switch
            value={formData.notifications_enabled}
            onValueChange={(value) => handleSwitchChange('notifications_enabled', value)}
            trackColor={{ false: '#ccc', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  photoButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 16,
  },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  securityButtonText: {
    flex: 1,
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 16,
  },
  passwordSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 32,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
}); 
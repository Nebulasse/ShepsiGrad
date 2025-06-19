import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface ProfileSettingsProps {
  onClose: () => void;
}

export default function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const { user, updateUserProfile, updateUserPassword, logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Данные профиля
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  // Данные для смены пароля
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Настройки уведомлений
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    bookings: true,
    messages: true,
    promotions: false,
  });
  
  // Обработчик изменения полей профиля
  const handleProfileChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };
  
  // Обработчик изменения полей пароля
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({
      ...passwordData,
      [field]: value
    });
  };
  
  // Обработчик изменения настроек уведомлений
  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications({
      ...notifications,
      [field]: value
    });
  };
  
  // Сохранение изменений профиля
  const handleSaveProfile = async () => {
    if (!profileData.name || !profileData.email) {
      Alert.alert('Ошибка', 'Имя и email обязательны для заполнения');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateUserProfile(profileData);
      setIsEditing(false);
      Alert.alert('Успех', 'Профиль успешно обновлен');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Изменение пароля
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Ошибка', 'Новые пароли не совпадают');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      Alert.alert('Ошибка', 'Новый пароль должен содержать минимум 8 символов');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      Alert.alert('Успех', 'Пароль успешно изменен');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось изменить пароль. Проверьте текущий пароль');
      console.error('Error changing password:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Удаление аккаунта
  const handleDeleteAccount = () => {
    Alert.alert(
      'Удаление аккаунта',
      'Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Подтверждение',
              'Пожалуйста, подтвердите удаление аккаунта еще раз.',
              [
                { text: 'Отмена', style: 'cancel' },
                { 
                  text: 'Подтверждаю удаление', 
                  style: 'destructive',
                  onPress: async () => {
                    setIsLoading(true);
                    try {
                      // Здесь будет API запрос на удаление аккаунта
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      await logout();
                      // Перенаправление на главную страницу произойдет автоматически после выхода
                    } catch (error) {
                      Alert.alert('Ошибка', 'Не удалось удалить аккаунт');
                      console.error('Error deleting account:', error);
                      setIsLoading(false);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки профиля</Text>
      </View>
      
      {/* Секция профиля */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Личная информация</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editButton}>Изменить</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelButton}>Отмена</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {isEditing ? (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Имя</Text>
              <TextInput
                style={styles.input}
                value={profileData.name}
                onChangeText={(value) => handleProfileChange('name', value)}
                placeholder="Ваше имя"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={profileData.email}
                onChangeText={(value) => handleProfileChange('email', value)}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Телефон</Text>
              <TextInput
                style={styles.input}
                value={profileData.phone}
                onChangeText={(value) => handleProfileChange('phone', value)}
                placeholder="+7 (900) 123-45-67"
                keyboardType="phone-pad"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && styles.disabledButton]} 
              onPress={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Сохранить изменения</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Имя:</Text>
              <Text style={styles.infoValue}>{profileData.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{profileData.email}</Text>
            </View>
            
            {profileData.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Телефон:</Text>
                <Text style={styles.infoValue}>{profileData.phone}</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Секция безопасности */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Безопасность</Text>
        </View>
        
        {!showPasswordForm ? (
          <TouchableOpacity 
            style={styles.securityOption}
            onPress={() => setShowPasswordForm(true)}
          >
            <Ionicons name="key-outline" size={24} color="#333" />
            <Text style={styles.securityOptionText}>Изменить пароль</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Текущий пароль</Text>
              <TextInput
                style={styles.input}
                value={passwordData.currentPassword}
                onChangeText={(value) => handlePasswordChange('currentPassword', value)}
                placeholder="Введите текущий пароль"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Новый пароль</Text>
              <TextInput
                style={styles.input}
                value={passwordData.newPassword}
                onChangeText={(value) => handlePasswordChange('newPassword', value)}
                placeholder="Минимум 8 символов"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Подтверждение пароля</Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirmPassword}
                onChangeText={(value) => handlePasswordChange('confirmPassword', value)}
                placeholder="Повторите новый пароль"
                secureTextEntry
              />
            </View>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
              >
                <Text style={styles.secondaryButtonText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.disabledButton]} 
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Изменить</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      {/* Секция уведомлений */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Уведомления</Text>
        </View>
        
        <View style={styles.notificationOptions}>
          <View style={styles.notificationOption}>
            <Text style={styles.notificationText}>Email уведомления</Text>
            <Switch
              value={notifications.email}
              onValueChange={(value) => handleNotificationChange('email', value)}
              trackColor={{ false: '#d1d1d1', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.notificationOption}>
            <Text style={styles.notificationText}>Push-уведомления</Text>
            <Switch
              value={notifications.push}
              onValueChange={(value) => handleNotificationChange('push', value)}
              trackColor={{ false: '#d1d1d1', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.notificationOption}>
            <Text style={styles.notificationText}>Уведомления о бронированиях</Text>
            <Switch
              value={notifications.bookings}
              onValueChange={(value) => handleNotificationChange('bookings', value)}
              trackColor={{ false: '#d1d1d1', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.notificationOption}>
            <Text style={styles.notificationText}>Уведомления о сообщениях</Text>
            <Switch
              value={notifications.messages}
              onValueChange={(value) => handleNotificationChange('messages', value)}
              trackColor={{ false: '#d1d1d1', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.notificationOption}>
            <Text style={styles.notificationText}>Промо-предложения</Text>
            <Switch
              value={notifications.promotions}
              onValueChange={(value) => handleNotificationChange('promotions', value)}
              trackColor={{ false: '#d1d1d1', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>
      
      {/* Секция удаления аккаунта */}
      <View style={styles.dangerSection}>
        <TouchableOpacity 
          style={styles.dangerButton} 
          onPress={handleDeleteAccount}
        >
          <Text style={styles.dangerButtonText}>Удалить аккаунт</Text>
        </TouchableOpacity>
        <Text style={styles.dangerText}>
          Это действие удалит все ваши данные и не может быть отменено.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    color: '#007AFF',
    fontSize: 14,
  },
  cancelButton: {
    color: '#999',
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  profileInfo: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  securityOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  notificationOptions: {
    marginBottom: 8,
  },
  notificationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationText: {
    fontSize: 16,
  },
  dangerSection: {
    marginTop: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  dangerButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
}); 
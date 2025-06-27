import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { authService } from './services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PROFILE_MODULE } from './moduleConfig';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  currency: string;
  bankInfo?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  isVerified: boolean;
  createdAt: string;
  address?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [activeSection, setActiveSection] = useState<'personal' | 'notifications' | 'payment' | 'support'>('personal');

  // Загрузка данных пользователя
  useEffect(() => {
    fetchUserData();
  }, []);

  // Получение данных пользователя
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setFormData(userData);
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные профиля');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка изменения полей формы
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Обработка изменения полей банковской информации
  const handleBankInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      bankInfo: {
        ...prev.bankInfo,
        [field]: value
      }
    }));
  };

  // Выбор изображения из галереи
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Необходимо разрешение', 'Пожалуйста, разрешите доступ к галерее');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUpdating(true);
        
        try {
          const updatedUser = await authService.updateProfile({
            avatar: result.assets[0].uri,
          });
          
          setUser(updatedUser);
          setFormData(prev => ({
            ...prev,
            avatar: result.assets[0].uri
          }));
          Alert.alert('Успешно', 'Фото профиля обновлено');
        } catch (error) {
          console.error('Ошибка при обновлении фото:', error);
          Alert.alert('Ошибка', 'Не удалось обновить фото профиля');
        } finally {
          setUpdating(false);
        }
      }
    } catch (error) {
      console.error('Ошибка при выборе изображения:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  // Сохранение изменений профиля
  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // В реальном приложении здесь был бы запрос к API
      // Имитируем задержку
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = await authService.updateProfile(formData);
      setUser(updatedUser);
      setFormData(updatedUser);
      setIsEditing(false);
      Alert.alert('Успех', 'Данные профиля успешно обновлены');
    } catch (error) {
      console.error('Ошибка при сохранении данных профиля:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить данные профиля');
    } finally {
      setIsSaving(false);
    }
  };

  // Выход из аккаунта
  const handleLogout = async () => {
    Alert.alert(
      'Выход из аккаунта',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              await AsyncStorage.removeItem('shepsigrad_landlord_token');
              router.replace('/');
            } catch (error) {
              console.error('Ошибка при выходе из аккаунта:', error);
            }
          } 
        }
      ]
    );
  };

  const toggleNotificationSetting = async (type: 'email' | 'push' | 'sms') => {
    if (!user) return;
    
    const updatedSettings = {
      ...user.notificationSettings,
      [type]: !user.notificationSettings[type],
    };
    
    try {
      setUpdating(true);
      const updatedUser = await authService.updateNotificationSettings(updatedSettings);
      setUser(updatedUser);
    } catch (error) {
      console.error('Ошибка при обновлении настроек уведомлений:', error);
      Alert.alert('Ошибка', 'Не удалось обновить настройки уведомлений');
    } finally {
      setUpdating(false);
    }
  };

  const navigateToChangePassword = () => {
    router.push('/change-password');
  };

  const navigateToDocuments = () => {
    router.push('/documents');
  };

  const navigateToPaymentMethods = () => {
    router.push('/payment-methods');
  };

  if (isLoading) {
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
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Профиль',
          headerStyle: {
            backgroundColor: '#4D8EFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerRight: () => (
            isEditing ? (
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={saveChanges}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.headerButtonText}>Сохранить</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.headerButtonText}>Изменить</Text>
              </TouchableOpacity>
            )
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Аватар и имя */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={isEditing ? pickImage : undefined}
            disabled={!isEditing}
          >
            {formData.avatar ? (
              <Image source={{ uri: formData.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {formData.name?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
            {isEditing && (
              <View style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        
        {/* Вкладки */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeSection === 'personal' && styles.activeTab]}
            onPress={() => setActiveSection('personal')}
          >
            <Ionicons 
              name="person-outline" 
              size={20} 
              color={activeSection === 'personal' ? '#4D8EFF' : '#666'} 
            />
            <Text style={[styles.tabText, activeSection === 'personal' && styles.activeTabText]}>
              Личные данные
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeSection === 'notifications' && styles.activeTab]}
            onPress={() => setActiveSection('notifications')}
          >
            <Ionicons 
              name="notifications-outline" 
              size={20} 
              color={activeSection === 'notifications' ? '#4D8EFF' : '#666'} 
            />
            <Text style={[styles.tabText, activeSection === 'notifications' && styles.activeTabText]}>
              Уведомления
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeSection === 'payment' && styles.activeTab]}
            onPress={() => setActiveSection('payment')}
          >
            <Ionicons 
              name="card-outline" 
              size={20} 
              color={activeSection === 'payment' ? '#4D8EFF' : '#666'} 
            />
            <Text style={[styles.tabText, activeSection === 'payment' && styles.activeTabText]}>
              Платежи
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeSection === 'support' && styles.activeTab]}
            onPress={() => setActiveSection('support')}
          >
            <Ionicons 
              name="help-circle-outline" 
              size={20} 
              color={activeSection === 'support' ? '#4D8EFF' : '#666'} 
            />
            <Text style={[styles.tabText, activeSection === 'support' && styles.activeTabText]}>
              Поддержка
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Содержимое вкладок */}
        <View style={styles.sectionContent}>
          {/* Личные данные */}
          {activeSection === 'personal' && (
            <View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Имя</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={formData.name}
                  onChangeText={(value) => handleChange('name', value)}
                  editable={isEditing}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  keyboardType="email-address"
                  editable={isEditing}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Телефон</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={formData.phone}
                  onChangeText={(value) => handleChange('phone', value)}
                  keyboardType="phone-pad"
                  editable={isEditing}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Язык</Text>
                <TouchableOpacity 
                  style={[styles.selectInput, !isEditing && styles.inputDisabled]}
                  disabled={!isEditing}
                >
                  <Text>{formData.language}</Text>
                  {isEditing && <Ionicons name="chevron-down" size={16} color="#666" />}
                </TouchableOpacity>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Валюта</Text>
                <TouchableOpacity 
                  style={[styles.selectInput, !isEditing && styles.inputDisabled]}
                  disabled={!isEditing}
                >
                  <Text>{formData.currency}</Text>
                  {isEditing && <Ionicons name="chevron-down" size={16} color="#666" />}
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Уведомления */}
          {activeSection === 'notifications' && (
            <View>
              <View style={styles.switchGroup}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Уведомления</Text>
                  <Text style={styles.switchDescription}>Включить все уведомления</Text>
                </View>
                <Switch
                  value={formData.notificationsEnabled}
                  onValueChange={(value) => handleChange('notificationsEnabled', value)}
                  disabled={!isEditing}
                  trackColor={{ false: '#E5E5EA', true: '#4CD964' }}
                  thumbColor={Platform.OS === 'ios' ? '#fff' : formData.notificationsEnabled ? '#4CD964' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.switchGroup}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Email уведомления</Text>
                  <Text style={styles.switchDescription}>Получать уведомления на email</Text>
                </View>
                <Switch
                  value={formData.emailNotifications}
                  onValueChange={(value) => handleChange('emailNotifications', value)}
                  disabled={!isEditing || !formData.notificationsEnabled}
                  trackColor={{ false: '#E5E5EA', true: '#4CD964' }}
                  thumbColor={Platform.OS === 'ios' ? '#fff' : formData.emailNotifications ? '#4CD964' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.switchGroup}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Push-уведомления</Text>
                  <Text style={styles.switchDescription}>Получать push-уведомления</Text>
                </View>
                <Switch
                  value={formData.pushNotifications}
                  onValueChange={(value) => handleChange('pushNotifications', value)}
                  disabled={!isEditing || !formData.notificationsEnabled}
                  trackColor={{ false: '#E5E5EA', true: '#4CD964' }}
                  thumbColor={Platform.OS === 'ios' ? '#fff' : formData.pushNotifications ? '#4CD964' : '#f4f3f4'}
                />
              </View>
            </View>
          )}
          
          {/* Платежи */}
          {activeSection === 'payment' && (
            <View>
              <View style={styles.bankInfoCard}>
                <Text style={styles.bankInfoTitle}>Банковская информация</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Имя владельца счета</Text>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={formData.bankInfo?.accountName}
                    onChangeText={(value) => handleBankInfoChange('accountName', value)}
                    editable={isEditing}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Номер счета</Text>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={formData.bankInfo?.accountNumber}
                    onChangeText={(value) => handleBankInfoChange('accountNumber', value)}
                    keyboardType="numeric"
                    editable={isEditing}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Банк</Text>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={formData.bankInfo?.bankName}
                    onChangeText={(value) => handleBankInfoChange('bankName', value)}
                    editable={isEditing}
                  />
                </View>
              </View>
              
              <TouchableOpacity style={styles.paymentHistoryButton}>
                <Text style={styles.paymentHistoryText}>История выплат</Text>
                <Ionicons name="chevron-forward" size={16} color="#4D8EFF" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Поддержка */}
          {activeSection === 'support' && (
            <View>
              <TouchableOpacity style={styles.supportItem}>
                <View style={styles.supportItemIcon}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#4D8EFF" />
                </View>
                <View style={styles.supportItemContent}>
                  <Text style={styles.supportItemTitle}>Чат с поддержкой</Text>
                  <Text style={styles.supportItemDescription}>Задайте вопрос нашей команде поддержки</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.supportItem}>
                <View style={styles.supportItemIcon}>
                  <Ionicons name="document-text-outline" size={24} color="#4D8EFF" />
                </View>
                <View style={styles.supportItemContent}>
                  <Text style={styles.supportItemTitle}>Часто задаваемые вопросы</Text>
                  <Text style={styles.supportItemDescription}>Ответы на популярные вопросы</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.supportItem}>
                <View style={styles.supportItemIcon}>
                  <Ionicons name="call-outline" size={24} color="#4D8EFF" />
                </View>
                <View style={styles.supportItemContent}>
                  <Text style={styles.supportItemTitle}>Связаться с нами</Text>
                  <Text style={styles.supportItemDescription}>Телефон и email для связи</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.supportItem}>
                <View style={styles.supportItemIcon}>
                  <Ionicons name="information-circle-outline" size={24} color="#4D8EFF" />
                </View>
                <View style={styles.supportItemContent}>
                  <Text style={styles.supportItemTitle}>О приложении</Text>
                  <Text style={styles.supportItemDescription}>Версия 1.0.0</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Кнопка выхода */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cancelButton: {
    fontSize: 16,
    color: '#0066CC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4D8EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: '600',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4D8EFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4D8EFF',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#4D8EFF',
    fontWeight: '500',
  },
  sectionContent: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
  },
  bankInfoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  bankInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  paymentHistoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderRadius: 8,
  },
  paymentHistoryText: {
    fontSize: 16,
    color: '#4D8EFF',
    fontWeight: '500',
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  supportItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  supportItemContent: {
    flex: 1,
  },
  supportItemTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  supportItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    marginTop: 20,
    marginBottom: 30,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
    marginLeft: 8,
  },
  headerButton: {
    paddingHorizontal: 15,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 
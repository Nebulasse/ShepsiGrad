import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileSettingsProps {
  onClose: () => void;
}

export default function EnhancedProfileSettings({ onClose }: ProfileSettingsProps) {
  const { user, updateUserProfile, updateUserPassword, logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'notifications', 'favorites'
  
  // Данные профиля
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
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

  // Избранные объявления
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  
  // Данные о бронированиях
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Загрузка настроек уведомлений из AsyncStorage
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('notificationSettings');
        if (savedSettings) {
          setNotifications(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Ошибка при загрузке настроек уведомлений:', error);
      }
    };
    
    loadNotificationSettings();
  }, []);

  // Загрузка избранных объявлений и бронирований при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      loadBookings();
    }, [])
  );

  // Функция для загрузки избранных объявлений
  const loadFavorites = async () => {
    if (!user) return;
    
    setFavoritesLoading(true);
    try {
      // Здесь должен быть API запрос к серверу
      // Пример заглушки:
      await new Promise(resolve => setTimeout(resolve, 500));
      setFavorites([
        {
          id: '1',
          title: 'Уютная квартира в центре',
          price: '3500 ₽/день',
          location: 'Шепси, ул. Приморская',
          imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
          rating: 4.8
        },
        {
          id: '2',
          title: 'Апартаменты с видом на море',
          price: '5000 ₽/день',
          location: 'Шепси, ул. Морская',
          imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
          rating: 4.9
        }
      ]);
    } catch (error) {
      console.error('Ошибка при загрузке избранных объявлений:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить избранные объявления');
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Функция для загрузки бронирований
  const loadBookings = async () => {
    if (!user) return;
    
    setBookingsLoading(true);
    try {
      // Здесь должен быть API запрос к серверу
      // Пример заглушки:
      await new Promise(resolve => setTimeout(resolve, 500));
      setBookings([
        {
          id: '1',
          propertyTitle: 'Уютная квартира в центре',
          checkIn: '2024-07-20',
          checkOut: '2024-07-25',
          status: 'confirmed',
          totalPrice: 17500,
          imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
        },
        {
          id: '2',
          propertyTitle: 'Апартаменты с видом на море',
          checkIn: '2024-08-10',
          checkOut: '2024-08-15',
          status: 'pending',
          totalPrice: 25000,
          imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'
        }
      ]);
    } catch (error) {
      console.error('Ошибка при загрузке бронирований:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить бронирования');
    } finally {
      setBookingsLoading(false);
    }
  };

  // Обновление данных при pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      if (activeTab === 'favorites') {
        await loadFavorites();
      } else if (activeTab === 'bookings') {
        await loadBookings();
      }
    } finally {
      setRefreshing(false);
    }
  };
  
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
  const handleNotificationChange = async (field: string, value: boolean) => {
    const updatedSettings = {
      ...notifications,
      [field]: value
    };
    
    setNotifications(updatedSettings);
    
    // Сохраняем настройки в AsyncStorage
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Ошибка при сохранении настроек уведомлений:', error);
    }
  };
  
  // Выбор аватара из галереи
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Для выбора изображения необходимо разрешение на доступ к галерее');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleProfileChange('avatarUrl', result.assets[0].uri);
      
      // В реальном приложении здесь был бы код для загрузки изображения на сервер
      // и обновления URL аватара в профиле пользователя
    }
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

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Получение статуса бронирования на русском
  const getBookingStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено';
      case 'pending': return 'Ожидает подтверждения';
      case 'cancelled': return 'Отменено';
      case 'completed': return 'Завершено';
      default: return 'Неизвестно';
    }
  };

  // Получение цвета статуса бронирования
  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'completed': return '#2196F3';
      default: return '#999';
    }
  };

  // Рендер содержимого в зависимости от выбранной вкладки
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileContent();
      case 'security':
        return renderSecurityContent();
      case 'notifications':
        return renderNotificationsContent();
      case 'favorites':
        return renderFavoritesContent();
      case 'bookings':
        return renderBookingsContent();
      default:
        return renderProfileContent();
    }
  };

  // Рендер содержимого вкладки профиля
  const renderProfileContent = () => (
    <>
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
        
        <View style={styles.avatarContainer}>
          {profileData.avatarUrl ? (
            <Image source={{ uri: profileData.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>{profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
          )}
          
          {isEditing && (
            <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
              <Text style={styles.changeAvatarText}>Изменить фото</Text>
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
    </>
  );

  // Рендер содержимого вкладки безопасности
  const renderSecurityContent = () => (
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

      <TouchableOpacity 
        style={styles.securityOption}
        onPress={() => Alert.alert('Двухфакторная аутентификация', 'Эта функция будет доступна в ближайшее время')}
      >
        <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
        <Text style={styles.securityOptionText}>Двухфакторная аутентификация</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.securityOption}
        onPress={() => Alert.alert('Сессии', 'Эта функция будет доступна в ближайшее время')}
      >
        <Ionicons name="laptop-outline" size={24} color="#333" />
        <Text style={styles.securityOptionText}>Активные сессии</Text>
      </TouchableOpacity>

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
    </View>
  );

  // Рендер содержимого вкладки уведомлений
  const renderNotificationsContent = () => (
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
  );

  // Рендер содержимого вкладки избранного
  const renderFavoritesContent = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Избранное</Text>
      </View>
      
      {favoritesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : favorites.length > 0 ? (
        <View style={styles.favoritesContainer}>
          {favorites.map((property: any) => (
            <TouchableOpacity 
              key={property.id} 
              style={styles.favoriteItem}
              onPress={() => {/* Навигация на страницу объявления */}}
            >
              <Image source={{ uri: property.imageUrl }} style={styles.favoriteImage} />
              <View style={styles.favoriteInfo}>
                <Text style={styles.favoritePrice}>{property.price}</Text>
                <Text style={styles.favoriteTitle}>{property.title}</Text>
                <Text style={styles.favoriteLocation}>{property.location}</Text>
                <View style={styles.favoriteRating}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.favoriteRatingText}>{property.rating}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.removeFavoriteButton}
                onPress={() => Alert.alert('Удаление', 'Удалить из избранного?', [
                  { text: 'Отмена', style: 'cancel' },
                  { text: 'Удалить', style: 'destructive', onPress: () => {/* Удаление из избранного */} }
                ])}
              >
                <Ionicons name="heart" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>Нет избранных объявлений</Text>
          <Text style={styles.emptyStateText}>Добавляйте понравившиеся объявления в избранное, чтобы быстро находить их</Text>
        </View>
      )}
    </View>
  );

  // Рендер содержимого вкладки бронирований
  const renderBookingsContent = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Мои бронирования</Text>
      </View>
      
      {bookingsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : bookings.length > 0 ? (
        <View style={styles.bookingsContainer}>
          {bookings.map((booking: any) => (
            <TouchableOpacity 
              key={booking.id} 
              style={styles.bookingItem}
              onPress={() => {/* Навигация на страницу бронирования */}}
            >
              <Image source={{ uri: booking.imageUrl }} style={styles.bookingImage} />
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingTitle}>{booking.propertyTitle}</Text>
                <Text style={styles.bookingDates}>
                  {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                </Text>
                <View style={styles.bookingDetails}>
                  <Text style={styles.bookingPrice}>{booking.totalPrice} ₽</Text>
                  <View style={[styles.bookingStatus, { backgroundColor: getBookingStatusColor(booking.status) + '20' }]}>
                    <Text style={[styles.bookingStatusText, { color: getBookingStatusColor(booking.status) }]}>
                      {getBookingStatusText(booking.status)}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.bookingActionButton}
                onPress={() => {/* Действие в зависимости от статуса */}}
              >
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>Нет бронирований</Text>
          <Text style={styles.emptyStateText}>Здесь будет отображаться история ваших бронирований</Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Настройки профиля</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          {renderContent()}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  contentContainer: {
    padding: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeAvatarButton: {
    padding: 5,
  },
  changeAvatarText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
  },
  profileInfo: {
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  infoValue: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  securityOptionText: {
    marginLeft: 10,
  },
  dangerSection: {
    padding: 10,
  },
  dangerButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#333',
    marginTop: 10,
  },
  notificationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoritesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  favoriteItem: {
    width: '50%',
    padding: 5,
  },
  favoriteImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
  },
  favoriteInfo: {
    padding: 5,
  },
  favoritePrice: {
    fontWeight: 'bold',
  },
  favoriteTitle: {
    marginTop: 5,
  },
  favoriteLocation: {
    marginTop: 5,
  },
  favoriteRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  favoriteRatingText: {
    marginLeft: 5,
  },
  removeFavoriteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyStateText: {
    color: '#333',
  },
  bookingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bookingItem: {
    width: '50%',
    padding: 5,
  },
  bookingImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
  },
  bookingInfo: {
    padding: 5,
  },
  bookingTitle: {
    fontWeight: 'bold',
  },
  bookingDates: {
    marginTop: 5,
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingPrice: {
    fontWeight: 'bold',
  },
  bookingStatus: {
    padding: 2,
    borderRadius: 5,
  },
  bookingStatusText: {
    fontWeight: 'bold',
  },
  bookingActionButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
});

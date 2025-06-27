import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Switch, 
  Alert, 
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { api } from '../../services/api';
import { config } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileSettingsProps {
  onClose?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { user, updateProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Данные пользователя
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
  });
  
  // Настройки уведомлений
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    newMessages: true,
    bookingUpdates: true,
    propertyUpdates: true,
    promotions: false,
  });
  
  // Настройки безопасности
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricLogin: false,
  });
  
  // Активная вкладка
  const [activeTab, setActiveTab] = useState('profile');
  
  // Загрузка данных пользователя
  useEffect(() => {
    if (user) {
      loadUserData();
      loadUserSettings();
    }
  }, [user]);
  
  // Загрузка данных пользователя
  const loadUserData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/me');
      
      if (response) {
        setUserData({
          firstName: response.firstName || '',
          lastName: response.lastName || '',
          email: response.email || '',
          phone: response.phone || '',
          avatar: response.avatar || '',
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка настроек пользователя
  const loadUserSettings = async () => {
    try {
      // Пробуем загрузить настройки из локального хранилища
      const notificationSettingsStr = await AsyncStorage.getItem('notification_settings');
      const securitySettingsStr = await AsyncStorage.getItem('security_settings');
      
      if (notificationSettingsStr) {
        setNotificationSettings(JSON.parse(notificationSettingsStr));
      }
      
      if (securitySettingsStr) {
        setSecuritySettings(JSON.parse(securitySettingsStr));
      }
      
      // Если есть API для настроек, загружаем оттуда
      try {
        const response = await api.get('/users/settings');
        
        if (response) {
          // Настройки уведомлений
          if (response.notifications) {
            setNotificationSettings({
              email: response.notifications.email ?? true,
              push: response.notifications.push ?? true,
              sms: response.notifications.sms ?? false,
              newMessages: response.notifications.newMessages ?? true,
              bookingUpdates: response.notifications.bookingUpdates ?? true,
              propertyUpdates: response.notifications.propertyUpdates ?? true,
              promotions: response.notifications.promotions ?? false,
            });
          }
          
          // Настройки безопасности
          if (response.security) {
            setSecuritySettings({
              twoFactorAuth: response.security.twoFactorAuth ?? false,
              biometricLogin: response.security.biometricLogin ?? false,
            });
          }
        }
      } catch (error) {
        console.log('API для настроек недоступен, используем локальные настройки');
      }
    } catch (error) {
      console.error('Ошибка при загрузке настроек пользователя:', error);
    }
  };
  
  // Сохранение данных профиля
  const saveProfile = async () => {
    setSaving(true);
    try {
      // Проверка на заполненность обязательных полей
      if (!userData.firstName || !userData.lastName || !userData.email) {
        Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
        setSaving(false);
        return;
      }
      
      // Проверка формата email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        Alert.alert('Ошибка', 'Пожалуйста, введите корректный email');
        setSaving(false);
        return;
      }
      
      // Проверка формата телефона (если заполнен)
      if (userData.phone && !/^\+?[0-9\s-()]{10,15}$/.test(userData.phone)) {
        Alert.alert('Ошибка', 'Пожалуйста, введите корректный номер телефона');
        setSaving(false);
        return;
      }
      
      const response = await api.put('/users/me', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      });
      
      if (response) {
        // Обновляем данные в контексте авторизации
        await updateProfile({
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          avatar: userData.avatar,
        });
        
        Alert.alert('Успех', 'Профиль успешно обновлен');
      }
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    } finally {
      setSaving(false);
    }
  };
  
  // Сохранение настроек уведомлений
  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      // Сохраняем настройки локально
      await AsyncStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
      
      // Если есть API для настроек, сохраняем туда
      try {
        await api.put('/users/settings/notifications', notificationSettings);
      } catch (error) {
        console.log('API для настроек недоступен, сохраняем только локально');
      }
      
      Alert.alert('Успех', 'Настройки уведомлений обновлены');
    } catch (error) {
      console.error('Ошибка при сохранении настроек уведомлений:', error);
      Alert.alert('Ошибка', 'Не удалось обновить настройки уведомлений');
    } finally {
      setSaving(false);
    }
  };
  
  // Сохранение настроек безопасности
  const saveSecuritySettings = async () => {
    setSaving(true);
    try {
      // Сохраняем настройки локально
      await AsyncStorage.setItem('security_settings', JSON.stringify(securitySettings));
      
      // Если есть API для настроек, сохраняем туда
      try {
        await api.put('/users/settings/security', securitySettings);
      } catch (error) {
        console.log('API для настроек недоступен, сохраняем только локально');
      }
      
      Alert.alert('Успех', 'Настройки безопасности обновлены');
    } catch (error) {
      console.error('Ошибка при сохранении настроек безопасности:', error);
      Alert.alert('Ошибка', 'Не удалось обновить настройки безопасности');
    } finally {
      setSaving(false);
    }
  };
  
  // Выбор и загрузка аватара
  const pickAvatar = async () => {
    try {
      // Запрашиваем разрешение на доступ к галерее
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение на доступ к галерее');
        return;
      }
      
      // Открываем выбор изображения
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setUploadingAvatar(true);
        
        try {
          // Получаем данные файла
          const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
          
          if (!fileInfo.exists) {
            Alert.alert('Ошибка', 'Файл не существует');
            return;
          }
          
          // Проверяем размер файла (не более 5 МБ)
          if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
            Alert.alert('Ошибка', 'Размер файла не должен превышать 5 МБ');
            return;
          }
          
          // Получаем расширение файла
          const fileExt = selectedImage.uri.split('.').pop()?.toLowerCase() || 'jpg';
          
          // Создаем уникальное имя файла
          const fileName = `avatar_${user?.id}_${Date.now()}.${fileExt}`;
          
          // Конвертируем изображение в base64 для отправки на сервер
          const base64 = await FileSystem.readAsStringAsync(selectedImage.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Загружаем аватар на сервер
          const response = await api.post('/users/avatar', {
            image: base64,
            fileName,
            contentType: `image/${fileExt}`,
          });
          
          if (response && response.avatarUrl) {
            // Обновляем локальные данные
            setUserData({ ...userData, avatar: response.avatarUrl });
            
            // Обновляем данные в контексте авторизации
            await updateProfile({ avatar: response.avatarUrl });
            
            Alert.alert('Успех', 'Аватар успешно обновлен');
          }
        } catch (error) {
          console.error('Ошибка при загрузке аватара:', error);
          Alert.alert('Ошибка', 'Не удалось загрузить аватар');
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.error('Ошибка при выборе аватара:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
      setUploadingAvatar(false);
    }
  };
  
  // Изменение пароля
  const changePassword = async () => {
    router.push('/change-password');
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
            await logout();
            router.replace('/');
          }
        },
      ]
    );
  };
  
  // Обработка нажатия на кнопку "Назад"
  const handleBackPress = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D8EFF" />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки профиля</Text>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]} 
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Профиль
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]} 
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
            Уведомления
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'security' && styles.activeTab]} 
          onPress={() => setActiveTab('security')}
        >
          <Text style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>
            Безопасность
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'profile' && (
        <View style={styles.section}>
          <View style={styles.avatarContainer}>
            {uploadingAvatar ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="large" color="#4D8EFF" />
              </View>
            ) : userData.avatar ? (
              <Image 
                source={{ uri: userData.avatar }} 
                style={styles.avatar}
                onError={() => {
                  console.log('Ошибка загрузки аватара');
                  setUserData({ ...userData, avatar: '' });
                }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.changeAvatarButton} 
              onPress={pickAvatar}
              disabled={uploadingAvatar}
            >
              <Text style={styles.changeAvatarText}>
                {uploadingAvatar ? 'Загрузка...' : 'Изменить фото'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Имя *</Text>
            <TextInput
              style={styles.input}
              value={userData.firstName}
              onChangeText={(text) => setUserData({ ...userData, firstName: text })}
              placeholder="Введите ваше имя"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Фамилия *</Text>
            <TextInput
              style={styles.input}
              value={userData.lastName}
              onChangeText={(text) => setUserData({ ...userData, lastName: text })}
              placeholder="Введите вашу фамилию"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#F0F0F0' }]}
              value={userData.email}
              placeholder="Введите ваш email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            <Text style={styles.helpText}>Email нельзя изменить</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Телефон</Text>
            <TextInput
              style={styles.input}
              value={userData.phone}
              onChangeText={(text) => setUserData({ ...userData, phone: text })}
              placeholder="Введите ваш телефон"
              keyboardType="phone-pad"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Сохранить изменения</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {activeTab === 'notifications' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Каналы уведомлений</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email-уведомления</Text>
            <Switch
              value={notificationSettings.email}
              onValueChange={(value) => 
                setNotificationSettings({ ...notificationSettings, email: value })
              }
              trackColor={{ false: '#D1D1D6', true: '#4D8EFF' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push-уведомления</Text>
            <Switch
              value={notificationSettings.push}
              onValueChange={(value) => 
                setNotificationSettings({ ...notificationSettings, push: value })
              }
              trackColor={{ false: '#D1D1D6', true: '#4D8EFF' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>SMS-уведомления</Text>
            <Switch
              value={notificationSettings.sms}
              onValueChange={(value) => 
                setNotificationSettings({ ...notificationSettings, sms: value })
              }
              trackColor={{ false: '#D1D1D6', true: '#4D8EFF' }}
            />
          </View>
          
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Типы уведомлений</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Новые сообщения</Text>
            <Switch
              value={notificationSettings.newMessages}
              onValueChange={(value) => 
                setNotificationSettings({ ...notificationSettings, newMessages: value })
              }
              trackColor={{ false: '#D1D1D6', true: '#4D8EFF' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Обновления бронирований</Text>
            <Switch
              value={notificationSettings.bookingUpdates}
              onValueChange={(value) => 
                setNotificationSettings({ ...notificationSettings, bookingUpdates: value })
              }
              trackColor={{ false: '#D1D1D6', true: '#4D8EFF' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Обновления объектов</Text>
            <Switch
              value={notificationSettings.propertyUpdates}
              onValueChange={(value) => 
                setNotificationSettings({ ...notificationSettings, propertyUpdates: value })
              }
              trackColor={{ false: '#D1D1D6', true: '#4D8EFF' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Акции и предложения</Text>
            <Switch
              value={notificationSettings.promotions}
              onValueChange={(value) => 
                setNotificationSettings({ ...notificationSettings, promotions: value })
              }
              trackColor={{ false: '#D1D1D6', true: '#4D8EFF' }}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={saveNotificationSettings}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Сохранить настройки</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {activeTab === 'security' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки безопасности</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Двухфакторная аутентификация</Text>
            <Switch
              value={securitySettings.twoFactorAuth}
              onValueChange={(value) => 
                setSecuritySettings({ ...securitySettings, twoFactorAuth: value })
              }
              trackColor={{ false: '#D1D1D6', true: '#4D8EFF' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Вход по биометрии</Text>
            <Switch
              value={securitySettings.biometricLogin}
              onValueChange={(value) => 
                setSecuritySettings({ ...securitySettings, biometricLogin: value })
              }
              trackColor={{ false: '#D1D1D6', true: '#4D8EFF' }}
            />
          </View>
          
          <TouchableOpacity style={styles.actionButton} onPress={changePassword}>
            <Text style={styles.actionButtonText}>Изменить пароль</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={saveSecuritySettings}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Сохранить настройки</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4D8EFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#4D8EFF',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    margin: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changeAvatarButton: {
    marginTop: 10,
  },
  changeAvatarText: {
    color: '#4D8EFF',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4D8EFF',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#4D8EFF',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: '#4D8EFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileSettings; 
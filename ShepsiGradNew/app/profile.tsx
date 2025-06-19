import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './contexts/AuthContext';
import { getCurrentUser, logout, updateUserProfile } from './services/api';
import ProfileSettings from './components/profile/ProfileSettings';

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const data = await getCurrentUser();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
    }
  };

  const handleSaveProfile = async (profileData: any) => {
    try {
      setIsLoading(true);
      await updateUserProfile(profileData);
      await fetchUserData();
      setShowSettings(false);
      Alert.alert('Успех', 'Профиль успешно обновлен');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (showSettings) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Настройки профиля',
            headerLeft: () => (
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
            )
          }} 
        />
        <ProfileSettings 
          userData={userData} 
          onSave={handleSaveProfile}
          onCancel={() => setShowSettings(false)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Профиль' }} />
      
      <View style={styles.profileHeader}>
        <Image 
          source={
            userData?.avatar_url 
              ? { uri: userData.avatar_url } 
              : { uri: 'https://via.placeholder.com/80x80' }
          } 
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {userData?.first_name} {userData?.last_name}
          </Text>
          <Text style={styles.userEmail}>{userData?.email}</Text>
          {userData?.phone && (
            <Text style={styles.userPhone}>{userData.phone}</Text>
          )}
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/bookings')}
        >
          <Ionicons name="calendar-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Мои бронирования</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/favorites')}
        >
          <Ionicons name="heart-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Избранное</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/chat')}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Сообщения</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setShowSettings(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Настройки профиля</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Помощь', 'Здесь будет раздел помощи')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Помощь</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>Версия приложения: 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#FF3B30',
  },
  versionInfo: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
}); 
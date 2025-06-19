import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Platform } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import chatService from './services/chatService';
import { AuthProvider } from './contexts/AuthContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
  const router = useRouter();
  const currentPath = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Загрузка количества непрочитанных сообщений
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await chatService.getTotalUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Ошибка при получении непрочитанных сообщений:', error);
      }
    };

    loadUnreadCount();

    // Периодически обновляем счетчик непрочитанных сообщений
    const intervalId = setInterval(loadUnreadCount, 15000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="auto" />
          <Slot />
          <CustomTabBar currentPath={currentPath} onNavigate={router.push} />
        </SafeAreaView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

interface TabBarProps {
  currentPath: string | null;
  onNavigate: (path: string) => void;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabItem {
  name: string;
  route: string;
  icon: IconName;
  activeIcon: IconName;
  label: string;
}

function CustomTabBar({ currentPath, onNavigate }: TabBarProps) {
  // Фиксированная высота меню
  const MENU_HEIGHT = 55;
  const [bottomAreaHeight, setBottomAreaHeight] = useState(0);
  
  // Определяем высоту системной навигации и размещаем меню правильно
  useEffect(() => {
    if (Platform.OS === 'android') {
      const screenHeight = Dimensions.get('screen').height;
      const windowHeight = Dimensions.get('window').height;
      const navigationBarHeight = screenHeight - windowHeight;
      
      // Для Android с навигационными кнопками
      if (navigationBarHeight > 0) {
        // Устанавливаем высоту белой области под меню равной высоте навигационной панели
        setBottomAreaHeight(navigationBarHeight);
      }
    }
  }, []);

  // Не показываем табы на некоторых экранах
  if (currentPath?.includes('/property/') || currentPath?.includes('/conversation/')) {
    return null;
  }

  const tabItems: TabItem[] = [
    {
      name: 'home',
      route: '/',
      icon: 'home-outline',
      activeIcon: 'home',
      label: 'Главная'
    },
    {
      name: 'search',
      route: '/search',
      icon: 'search-outline',
      activeIcon: 'search',
      label: 'Поиск'
    },
    {
      name: 'favorites',
      route: '/favorites',
      icon: 'heart-outline',
      activeIcon: 'heart',
      label: 'Избранное'
    },
    {
      name: 'messages',
      route: '/messages',
      icon: 'chatbubble-outline',
      activeIcon: 'chatbubble',
      label: 'Чаты'
    },
    {
      name: 'profile',
      route: '/profile',
      icon: 'person-outline',
      activeIcon: 'person',
      label: 'Профиль'
    }
  ];

  return (
    <View style={styles.tabBarWrapper}>
      {/* Панель навигации */}
      <View style={[styles.tabBar, { height: MENU_HEIGHT }]}>
        {tabItems.map((item) => {
          const isActive = 
            (item.route === '/' && (currentPath === '/' || currentPath === '/index')) || 
            (item.route !== '/' && currentPath?.startsWith(item.route));
          
          return (
            <TouchableOpacity
              key={item.name}
              style={styles.tabItem}
              onPress={() => onNavigate(item.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? item.activeIcon : item.icon}
                size={22}
                color={isActive ? '#0075FF' : '#9E9E9E'}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? '#0075FF' : '#9E9E9E' }
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Белая область под навигацией для заполнения пространства до низа экрана */}
      {bottomAreaHeight > 0 && (
        <View style={[styles.bottomFill, { height: bottomAreaHeight }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
    paddingBottom: 70, // Увеличиваем отступ снизу на всём контейнере
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  tabBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomFill: {
    backgroundColor: '#fff',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  tabBadge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 
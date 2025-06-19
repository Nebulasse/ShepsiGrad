import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import chatService from '../services/chatService';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={26} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0078FF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 1,
          borderTopColor: '#EFEFEF',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Поиск',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Карта',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Брони',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Чаты',
          tabBarIcon: ({ color }) => (
            <View>
              <TabBarIcon name="chatbubble-ellipses" color={color} />
              {unreadCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
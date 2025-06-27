import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './contexts/AuthContext';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
  });

  useEffect(() => {
    // Имитация загрузки ресурсов приложения
    const prepareApp = async () => {
      try {
        // Проверка авторизации
        const token = await AsyncStorage.getItem('shepsigrad_landlord_token');
        // Здесь можно добавить дополнительные проверки токена
        
        // Имитация задержки загрузки
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Ошибка при подготовке приложения:', e);
      } finally {
        setIsReady(true);
      }
    };

    prepareApp();
  }, []);

  if (!isReady || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4D8EFF" />
        <Text style={styles.loadingText}>Загрузка приложения...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4D8EFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="index" options={{ 
            headerTitle: "ShepsiGrad Landlord",
            headerTitleStyle: { fontFamily: 'Roboto-Bold' }
          }} />
          <Stack.Screen name="login" options={{ 
            headerTitle: "Вход в систему",
            headerTitleStyle: { fontFamily: 'Roboto-Bold' }
          }} />
          <Stack.Screen name="register" options={{ 
            headerTitle: "Регистрация",
            headerTitleStyle: { fontFamily: 'Roboto-Bold' }
          }} />
          <Stack.Screen name="forgot-password" options={{ 
            headerTitle: "Восстановление пароля",
            headerTitleStyle: { fontFamily: 'Roboto-Bold' }
          }} />
          <Stack.Screen name="help" options={{ 
            headerTitle: "Помощь",
            headerTitleStyle: { fontFamily: 'Roboto-Bold' }
          }} />
          <Stack.Screen name="properties/[id]" options={{ 
            headerTitle: "Объект недвижимости",
            headerTitleStyle: { fontFamily: 'Roboto-Bold' }
          }} />
          <Stack.Screen name="properties/add" options={{ 
            headerTitle: "Добавление объекта",
            headerTitleStyle: { fontFamily: 'Roboto-Bold' }
          }} />
          <Stack.Screen name="bookings" options={{ 
            headerTitle: "Бронирования",
            headerTitleStyle: { fontFamily: 'Roboto-Bold' }
          }} />
          <Stack.Screen name="conversation/[id]" options={{ 
            headerTitle: "Чат",
            headerTitleStyle: { fontFamily: 'Roboto-Bold' }
          }} />
          <Stack.Screen name="test-sync" options={{ 
            headerTitle: "Тест синхронизации",
            headerTitleStyle: { fontFamily: 'Roboto-Bold' }
          }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  }
}); 
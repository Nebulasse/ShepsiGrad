import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

// Для веб-платформы импортируем компонент Dashboard
import Dashboard from '../src/pages/Dashboard';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoading) {
      // Если пользователь не аутентифицирован, перенаправляем на страницу входа
      if (!isAuthenticated) {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  // Для веб-платформы используем компонент Dashboard
  if (Platform.OS === 'web') {
    return <Dashboard />;
  }

  // Для мобильных платформ показываем простой интерфейс
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShepsiGrad Админ</Text>
      <Text style={styles.subtitle}>Панель управления</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
}); 
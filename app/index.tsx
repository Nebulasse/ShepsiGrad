import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from './contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Добро пожаловать в ShepsiGrad Landlord</Text>
        <Text style={styles.subtitle}>
          Управляйте своими объектами недвижимости и бронированиями
        </Text>
        
        <View style={styles.authButtons}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Войти</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/register" asChild>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.secondaryButtonText}>Зарегистрироваться</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        <Link href="/help" asChild>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Нужна помощь?</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.welcomeText}>Здравствуйте, {user?.name || 'Арендодатель'}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Управление недвижимостью</Text>
        
        <Link href="/properties/add" asChild>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuButtonText}>Добавить новый объект</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/bookings" asChild>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuButtonText}>Мои бронирования</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Инструменты</Text>
        
        <Link href="/test-sync" asChild>
          <TouchableOpacity style={[styles.menuButton, styles.testButton]}>
            <Text style={styles.menuButtonText}>Тест синхронизации объектов</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  authButtons: {
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4D8EFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4D8EFF',
  },
  secondaryButtonText: {
    color: '#4D8EFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpButton: {
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#666',
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuButton: {
    backgroundColor: '#f0f7ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  menuButtonText: {
    color: '#333',
    fontSize: 16,
  },
  testButton: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#4D8EFF',
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
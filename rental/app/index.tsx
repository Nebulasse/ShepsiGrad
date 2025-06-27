import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function WelcomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [engineInfo, setEngineInfo] = useState('');

  useEffect(() => {
    // Проверяем JavaScript движок
    const isJSC = !(global as any).HermesInternal;
    const engine = isJSC ? 'JSC' : 'Hermes';
    setEngineInfo(engine);
    
    console.log(`[WelcomeScreen] JavaScript движок: ${engine}`);
    console.log('[WelcomeScreen] Компонент загружен успешно');
    
    // Имитируем загрузку
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка приложения...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShepsiGrad Landlord</Text>
      <Text style={styles.subtitle}>Приложение работает!</Text>
      <Text style={styles.engineInfo}>JavaScript движок: {engineInfo}</Text>
      <Text style={styles.statusText}>✅ Статус: Загружено успешно</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  engineInfo: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});
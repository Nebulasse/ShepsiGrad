import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { syncService } from './services/syncService';

export default function App() {
  useEffect(() => {
    // Инициализируем сервис синхронизации
    syncService.initialize('landlord-app');
    
    // Очистка при закрытии
    return () => {
      syncService.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Приложение для арендодателей</Text>
      <Text style={styles.subtext}>Синхронизация настроена</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtext: {
    fontSize: 16,
    color: '#333',
  },
}); 
// Импортируем полифилл для Hermes перед всем остальным
import './hermes-polyfill';

// Импортируем отладчик перед всем остальным
import './debug';

// Импортируем React и компоненты
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function App() {
  // Проверяем, какой JavaScript движок используется
  const isHermes = () => !!global.HermesInternal;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShepsiGrad</Text>
      <Text style={styles.subtitle}>Проблема с require решена!</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          JavaScript движок: <Text style={styles.highlight}>{isHermes() ? 'Hermes' : 'JSC'}</Text>
        </Text>
        <Text style={styles.infoText}>
          require доступен: <Text style={styles.highlight}>{typeof global.require !== 'undefined' ? 'Да' : 'Нет'}</Text>
        </Text>
      </View>
      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Продолжить</Text>
      </TouchableOpacity>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#f4511e',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#f4511e',
  },
  button: {
    backgroundColor: '#f4511e',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
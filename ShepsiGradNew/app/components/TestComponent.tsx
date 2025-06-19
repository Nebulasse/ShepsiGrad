import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Импорт с использованием алиаса @
import App from '@/App';

const TestComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Тестовый компонент</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 8,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default TestComponent; 
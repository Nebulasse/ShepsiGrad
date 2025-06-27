import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { testPropertySync } from './services/propertyService';
import { Property } from './services/propertyService';

export default function TestSyncScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    property?: Property;
    error?: string;
    timestamp?: string;
  } | null>(null);

  const runTest = async () => {
    setLoading(true);
    try {
      const testResult = await testPropertySync();
      setResult({
        ...testResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест синхронизации объектов недвижимости</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={runTest}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Тестирование...' : 'Запустить тест'}
        </Text>
        {loading && <ActivityIndicator color="#fff" style={styles.loader} />}
      </TouchableOpacity>
      
      {result && (
        <ScrollView style={styles.resultContainer}>
          <Text style={styles.resultTitle}>
            Результат теста:
          </Text>
          <Text style={[
            styles.resultStatus, 
            result.success ? styles.success : styles.error
          ]}>
            {result.success ? 'УСПЕШНО' : 'ОШИБКА'}
          </Text>
          
          {result.timestamp && (
            <Text style={styles.timestamp}>
              Время: {new Date(result.timestamp).toLocaleString()}
            </Text>
          )}
          
          {result.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Ошибка:</Text>
              <Text style={styles.errorText}>{result.error}</Text>
            </View>
          )}
          
          {result.property && (
            <View style={styles.propertyContainer}>
              <Text style={styles.propertyTitle}>Созданный объект:</Text>
              <Text style={styles.propertyId}>ID: {result.property.id}</Text>
              <Text style={styles.propertyText}>Название: {result.property.title}</Text>
              <Text style={styles.propertyText}>Адрес: {result.property.address}</Text>
              <Text style={styles.propertyText}>Город: {result.property.city}</Text>
              <Text style={styles.propertyText}>Цена: {result.property.price_per_day} ₽/день</Text>
              <Text style={styles.propertyText}>Тип: {result.property.property_type}</Text>
              <Text style={styles.propertyText}>Спальни: {result.property.bedrooms}</Text>
              <Text style={styles.propertyText}>Ванные: {result.property.bathrooms}</Text>
              <Text style={styles.propertyText}>Гости: {result.property.max_guests}</Text>
              <Text style={styles.propertyText}>Статус: {result.property.status}</Text>
              <Text style={styles.propertyText}>Создан: {new Date(result.property.created_at).toLocaleString()}</Text>
              <Text style={styles.propertyText}>Обновлен: {new Date(result.property.updated_at).toLocaleString()}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4D8EFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#a0c0ff',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginLeft: 10,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  success: {
    color: '#4CAF50',
  },
  error: {
    color: '#F44336',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 4,
  },
  errorText: {
    color: '#d32f2f',
  },
  propertyContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  propertyId: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  propertyText: {
    fontSize: 14,
    marginBottom: 4,
  },
}); 
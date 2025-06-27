/**
 * Страница 404 - Не найдено
 * 
 * Этот файл отображается, когда пользователь переходит по несуществующему маршруту
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from './styles';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={globalStyles.container}>
      <Stack.Screen options={{ 
        title: 'Страница не найдена',
        headerStyle: {
          backgroundColor: '#4D8EFF',
        },
        headerTintColor: '#fff',
      }} />
      
      <View style={styles.content}>
        <Ionicons name="alert-circle-outline" size={80} color="#4D8EFF" />
        
        <Text style={styles.title}>Страница не найдена</Text>
        <Text style={styles.message}>
          Извините, запрашиваемая страница не существует или была перемещена.
        </Text>
        
        <TouchableOpacity 
          style={globalStyles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={globalStyles.buttonText}>Вернуться на главную</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
}); 
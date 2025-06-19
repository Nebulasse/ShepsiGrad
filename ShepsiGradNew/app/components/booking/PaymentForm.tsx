import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { api, createPayment, checkPaymentStatus } from '../../services/api';

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ bookingId, amount, onSuccess, onCancel }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const router = useRouter();

  const initiatePayment = async () => {
    setIsLoading(true);
    try {
      const response = await createPayment(bookingId);
      
      if (response && response.confirmation_url) {
        setPaymentUrl(response.confirmation_url);
      } else {
        Alert.alert('Ошибка', 'Не удалось получить ссылку для оплаты.');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      Alert.alert('Ошибка', 'Не удалось инициировать платеж. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    // Обработка возврата с страницы оплаты
    if (navState.url.includes('/payment/callback')) {
      // Проверяем статус платежа
      checkPaymentStatus();
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await checkPaymentStatus(bookingId);
      
      if (response && response.booking_status === 'confirmed') {
        Alert.alert('Успех', 'Оплата прошла успешно!');
        onSuccess();
      } else {
        Alert.alert('Информация', 'Статус платежа: ' + (response?.payment_status || 'неизвестен'));
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      Alert.alert('Ошибка', 'Не удалось проверить статус платежа.');
    }
  };

  if (paymentUrl) {
    return (
      <View style={styles.container}>
        <WebView
          source={{ uri: paymentUrl }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
        />
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Отменить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Оплата бронирования</Text>
      <Text style={styles.amount}>{amount.toFixed(2)} ₽</Text>
      
      <TouchableOpacity
        style={styles.payButton}
        onPress={initiatePayment}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>Оплатить</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        disabled={isLoading}
      >
        <Text style={styles.cancelButtonText}>Отменить</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  payButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  webview: {
    flex: 1,
    marginBottom: 16,
  },
}); 
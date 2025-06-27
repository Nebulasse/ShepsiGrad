import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_CONFIG } from '../../config';
import WebView from 'react-native-webview';

// Интерфейс для данных бронирования
interface BookingData {
  id: string;
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  pricePerNight: number;
  nights: number;
  serviceFee: number;
  cleaningFee: number;
  status: string;
  imageUrl?: string;
}

// Интерфейс для данных платежа
interface PaymentData {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  confirmationUrl?: string;
  createdAt: string;
}

const PaymentForm = () => {
  const { id } = useLocalSearchParams();
  const bookingId = Array.isArray(id) ? id[0] : id;
  const { user, token } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('yookassa');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string>('');
  
  // Форматирование даты
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Дата не указана';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('ru-RU');
    } catch (error) {
      console.error('Ошибка при форматировании даты:', error);
      return dateString;
    }
  };
  
  // Загрузка данных бронирования
  useEffect(() => {
    if (bookingId && token) {
      fetchBookingData();
    }
  }, [bookingId, token]);
  
  // Загрузка данных бронирования
  const fetchBookingData = async () => {
    if (!token || !bookingId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.baseUrl}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных бронирования:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные бронирования');
    } finally {
      setLoading(false);
    }
  };
  
  // Создание платежа
  const createPayment = async () => {
    if (!booking || !token) {
      Alert.alert('Ошибка', 'Недостаточно данных для создания платежа');
      return;
    }
    
    try {
      setProcessing(true);
      
      // Формируем URL для возврата после оплаты
      const returnUrl = `${API_CONFIG.appUrl}/payment-callback`;
      
      // Отправляем запрос на создание платежа
      const response = await axios.post(
        `${API_CONFIG.baseUrl}/api/payments`,
        {
          bookingId: booking.id,
          paymentMethod,
          returnUrl
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data && response.data.confirmationUrl) {
        setPaymentData(response.data);
        setWebViewUrl(response.data.confirmationUrl);
        setShowWebView(true);
      } else {
        Alert.alert('Ошибка', 'Не удалось создать платеж');
      }
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      Alert.alert('Ошибка', 'Не удалось создать платеж');
    } finally {
      setProcessing(false);
    }
  };
  
  // Обработка завершения платежа
  const handlePaymentComplete = (success: boolean) => {
    setShowWebView(false);
    
    if (success) {
      Alert.alert(
        'Успешная оплата',
        'Ваше бронирование успешно оплачено!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/bookings')
          }
        ]
      );
    } else {
      Alert.alert(
        'Ошибка оплаты',
        'Произошла ошибка при оплате. Пожалуйста, попробуйте снова.',
        [
          {
            text: 'OK'
          }
        ]
      );
    }
  };
  
  // Обработка навигации в WebView
  const handleNavigationStateChange = (navState: any) => {
    // Проверяем URL на соответствие callback URL
    if (navState.url.includes('payment-callback')) {
      // Проверяем статус платежа
      if (navState.url.includes('status=success')) {
        handlePaymentComplete(true);
      } else {
        handlePaymentComplete(false);
      }
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D8EFF" />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }
  
  if (showWebView && webViewUrl) {
    return (
      <View style={styles.webViewContainer}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>Оплата бронирования</Text>
        </View>
        <WebView
          source={{ uri: webViewUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#4D8EFF" />
            </View>
          )}
        />
      </View>
    );
  }
  
  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Данные бронирования не найдены</Text>
        <TouchableOpacity 
          style={styles.payButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.payButtonText}>Вернуться назад</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Оплата бронирования</Text>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.propertyInfo}>
          {booking.imageUrl ? (
            <Image source={{ uri: booking.imageUrl }} style={styles.propertyImage} />
          ) : (
            <View style={styles.propertyImagePlaceholder}>
              <Ionicons name="image-outline" size={40} color="#CCC" />
            </View>
          )}
          <View style={styles.propertyText}>
            <Text style={styles.propertyName}>{booking.propertyName || 'Без названия'}</Text>
            <Text style={styles.bookingDates}>
              {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
            </Text>
            <Text style={styles.bookingGuests}>
              {booking.guests || 0} {getGuestText(booking.guests || 0)} • {booking.nights || 0} {getNightText(booking.nights || 0)}
            </Text>
          </View>
        </View>
        
        <View style={styles.priceBreakdown}>
          <Text style={styles.priceBreakdownTitle}>Детали оплаты</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{booking.pricePerNight || 0} ₽ × {booking.nights || 0} {getNightText(booking.nights || 0)}</Text>
            <Text style={styles.priceValue}>{(booking.pricePerNight || 0) * (booking.nights || 0)} ₽</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Сервисный сбор</Text>
            <Text style={styles.priceValue}>{booking.serviceFee || 0} ₽</Text>
          </View>
          
          {(booking.cleaningFee || 0) > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Плата за уборку</Text>
              <Text style={styles.priceValue}>{booking.cleaningFee} ₽</Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Итого</Text>
            <Text style={styles.totalValue}>{booking.totalPrice || 0} ₽</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.paymentMethods}>
        <Text style={styles.sectionTitle}>Способ оплаты</Text>
        
        <TouchableOpacity
          style={[styles.paymentMethod, paymentMethod === 'yookassa' && styles.selectedPaymentMethod]}
          onPress={() => setPaymentMethod('yookassa')}
        >
          <View style={styles.paymentMethodIcon}>
            <Ionicons name="card-outline" size={24} color="#333" />
          </View>
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodName}>Банковская карта</Text>
            <Text style={styles.paymentMethodDescription}>Visa, MasterCard, МИР</Text>
          </View>
          {paymentMethod === 'yookassa' && (
            <Ionicons name="checkmark-circle" size={24} color="#4D8EFF" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.paymentMethod, paymentMethod === 'sbp' && styles.selectedPaymentMethod]}
          onPress={() => setPaymentMethod('sbp')}
        >
          <View style={styles.paymentMethodIcon}>
            <Ionicons name="phone-portrait-outline" size={24} color="#333" />
          </View>
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodName}>Система быстрых платежей</Text>
            <Text style={styles.paymentMethodDescription}>Оплата по QR-коду</Text>
          </View>
          {paymentMethod === 'sbp' && (
            <Ionicons name="checkmark-circle" size={24} color="#4D8EFF" />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          Нажимая кнопку "Оплатить", вы соглашаетесь с условиями бронирования и политикой отмены.
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.payButton}
        onPress={createPayment}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.payButtonText}>Оплатить {booking.totalPrice || 0} ₽</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

// Вспомогательные функции для склонения слов
const getGuestText = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'гость';
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'гостя';
  } else {
    return 'гостей';
  }
};

const getNightText = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'ночь';
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'ночи';
  } else {
    return 'ночей';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  bookingDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    margin: 10,
  },
  propertyInfo: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 16,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  propertyImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyText: {
    flex: 1,
    marginLeft: 12,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingDates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingGuests: {
    fontSize: 14,
    color: '#666',
  },
  priceBreakdown: {
    marginTop: 8,
  },
  priceBreakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4D8EFF',
  },
  paymentMethods: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    margin: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: '#4D8EFF',
    backgroundColor: '#F0F7FF',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: '#666',
  },
  termsContainer: {
    padding: 16,
    marginHorizontal: 10,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: '#4D8EFF',
    borderRadius: 8,
    padding: 16,
    margin: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webViewContainer: {
    flex: 1,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default PaymentForm; 
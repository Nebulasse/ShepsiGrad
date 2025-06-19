import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import bookingService from '../services/bookingService';
import { Booking, BookingStatus } from '../types/Booking';
import CancelBookingModal from '../components/booking/CancelBookingModal';

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const bookingData = await bookingService.getBookingById(id as string);
      setBooking(bookingData);
    } catch (error) {
      console.error('Ошибка при загрузке деталей бронирования:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о бронировании');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const getStatusInfo = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return { text: 'Ожидает подтверждения', color: '#FFC107', icon: 'time-outline' };
      case 'confirmed':
        return { text: 'Подтверждено', color: '#4CAF50', icon: 'checkmark-circle-outline' };
      case 'completed':
        return { text: 'Завершено', color: '#9E9E9E', icon: 'checkmark-done-outline' };
      case 'cancelled':
        return { text: 'Отменено', color: '#F44336', icon: 'close-circle-outline' };
      case 'rejected':
        return { text: 'Отклонено', color: '#F44336', icon: 'ban-outline' };
      default:
        return { text: 'Неизвестный статус', color: '#9E9E9E', icon: 'help-circle-outline' };
    }
  };

  const handleCancelBooking = () => {
    setIsCancelModalVisible(true);
  };

  const confirmCancelBooking = async (reason: string) => {
    try {
      await bookingService.cancelBooking(id as string, reason);
      fetchBookingDetails(); // Обновляем данные бронирования
      Alert.alert('Успех', 'Бронирование успешно отменено');
    } catch (error) {
      console.error('Ошибка при отмене бронирования:', error);
      Alert.alert('Ошибка', 'Не удалось отменить бронирование');
    }
  };

  const handleBackToBookings = () => {
    router.push('/bookings');
  };

  const handleViewProperty = () => {
    if (booking) {
      router.push(`/property/${booking.propertyId}`);
    }
  };

  // Можно ли отменить бронирование
  const canBeCancelled = booking && (booking.status === 'pending' || booking.status === 'confirmed');

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Загрузка...' }} />
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0075FF" />
          <Text style={styles.loadingText}>Загрузка деталей бронирования...</Text>
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Бронирование не найдено' }} />
        <StatusBar style="auto" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Бронирование не найдено</Text>
          <Text style={styles.errorText}>Запрашиваемое бронирование не существует или было удалено</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToBookings}>
            <Text style={styles.backButtonText}>Вернуться к списку бронирований</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusInfo = getStatusInfo(booking.status);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Детали бронирования',
          headerRight: () => (
            canBeCancelled ? (
              <TouchableOpacity onPress={handleCancelBooking} style={styles.headerButton}>
                <Ionicons name="close-circle-outline" size={22} color="#F44336" />
              </TouchableOpacity>
            ) : null
          ),
        }}
      />
      <StatusBar style="auto" />

      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <View style={styles.propertySection}>
            <Text style={styles.propertyTitle}>{booking.propertyTitle}</Text>
            <TouchableOpacity onPress={handleViewProperty} style={styles.viewPropertyButton}>
              <Text style={styles.viewPropertyText}>Посмотреть объект</Text>
              <Ionicons name="chevron-forward" size={16} color="#0075FF" />
            </TouchableOpacity>
          </View>

          <View style={[styles.statusContainer, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name={statusInfo.icon as any} size={22} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Детали поездки</Text>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#0075FF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Даты проживания</Text>
                <Text style={styles.detailValue}>
                  {formatDate(booking.checkInDate)} — {formatDate(booking.checkOutDate)}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="people-outline" size={20} color="#0075FF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Количество гостей</Text>
                <Text style={styles.detailValue}>
                  {booking.guestsCount} {booking.guestsCount === 1 ? 'гость' : 
                    booking.guestsCount < 5 ? 'гостя' : 'гостей'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Информация о госте</Text>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="person-outline" size={20} color="#0075FF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Имя</Text>
                <Text style={styles.detailValue}>{booking.guestName}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="call-outline" size={20} color="#0075FF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Телефон</Text>
                <Text style={styles.detailValue}>{booking.guestPhone}</Text>
              </View>
            </View>
            
            {booking.guestEmail && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="mail-outline" size={20} color="#0075FF" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{booking.guestEmail}</Text>
                </View>
              </View>
            )}
          </View>

          {booking.comments && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Комментарии</Text>
              <Text style={styles.commentText}>{booking.comments}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Оплата</Text>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="card-outline" size={20} color="#0075FF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Статус оплаты</Text>
                <Text style={styles.detailValue}>
                  {booking.paymentStatus === 'paid' ? 'Оплачено' : 
                   booking.paymentStatus === 'partial' ? 'Частичная оплата' : 
                   booking.paymentStatus === 'refunded' ? 'Возвращено' : 
                   booking.paymentStatus === 'failed' ? 'Ошибка оплаты' : 'Не оплачено'}
                </Text>
              </View>
            </View>
            
            {booking.paymentMethod && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="cash-outline" size={20} color="#0075FF" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Способ оплаты</Text>
                  <Text style={styles.detailValue}>
                    {booking.paymentMethod === 'card' ? 'Банковская карта' : 
                     booking.paymentMethod === 'cash' ? 'Наличные' : 
                     booking.paymentMethod === 'transfer' ? 'Банковский перевод' : 'Онлайн-платеж'}
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Итоговая стоимость</Text>
              <Text style={styles.priceValue}>{booking.totalPrice.toLocaleString()} ₽</Text>
            </View>
          </View>

          {booking.status === 'cancelled' && booking.cancellationReason && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Причина отмены</Text>
              <Text style={styles.cancellationText}>{booking.cancellationReason}</Text>
            </View>
          )}

          {canBeCancelled && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelBooking}
            >
              <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.cancelButtonText}>Отменить бронирование</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <CancelBookingModal
        visible={isCancelModalVisible}
        onClose={() => setIsCancelModalVisible(false)}
        onCancel={confirmCancelBooking}
        bookingId={id as string}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#0075FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  propertySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  viewPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewPropertyText: {
    color: '#0075FF',
    fontSize: 14,
    marginRight: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333333',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0075FF',
  },
  commentText: {
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    lineHeight: 22,
  },
  cancellationText: {
    fontSize: 16,
    color: '#F44336',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    lineHeight: 22,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 
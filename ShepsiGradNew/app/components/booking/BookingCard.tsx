import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking, BookingStatus } from '../../types/Booking';
import { router } from 'expo-router';
import { bookingService } from '../../services/bookingService';

interface BookingCardProps {
  booking: Booking;
  onStatusChange?: () => void;
  onCancel?: (bookingId: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onStatusChange, onCancel }) => {
  // Преобразование даты из формата "YYYY-MM-DD" в "DD.MM.YYYY"
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Дата не указана';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Форматируем дату в формате "1 июля 2025"
      const day = date.getDate();
      const month = date.toLocaleString('ru-RU', { month: 'long' });
      const year = date.getFullYear();
      
      return `${day} ${month}`;
    } catch (error) {
      console.error('Ошибка при форматировании даты:', error);
      return dateString;
    }
  };
  
  // Получение текста и цвета статуса бронирования
  const getStatusInfo = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return { text: 'Ожидает подтверждения', color: '#FFC107' };
      case 'confirmed':
        return { text: 'Подтверждено', color: '#4CAF50' };
      case 'completed':
        return { text: 'Завершено', color: '#9E9E9E' };
      case 'cancelled':
        return { text: 'Отменено', color: '#F44336' };
      case 'rejected':
        return { text: 'Отклонено', color: '#F44336' };
      default:
        return { text: 'Неизвестный статус', color: '#9E9E9E' };
    }
  };
  
  // Получение текста и цвета статуса оплаты
  const getPaymentStatusInfo = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return { text: 'Оплачено', color: '#4CAF50' };
      case 'pending':
        return { text: 'Ожидает оплаты', color: '#FFC107' };
      case 'failed':
        return { text: 'Ошибка оплаты', color: '#F44336' };
      default:
        return { text: 'Статус неизвестен', color: '#9E9E9E' };
    }
  };
  
  // Переход к деталям бронирования
  const handleViewDetails = () => {
    router.push({
      pathname: '/booking/[id]',
      params: { id: booking.id }
    });
  };
  
  // Можно ли отменить бронирование
  const canBeCancelled = booking.status === 'pending' || booking.status === 'confirmed';
  
  // Обработка отмены бронирования
  const handleCancelBooking = () => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите отменить бронирование?',
      [
        {
          text: 'Нет',
          style: 'cancel'
        },
        {
          text: 'Да',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingService.cancelBooking(booking.id);
              if (onStatusChange) {
                onStatusChange();
              }
              if (onCancel) {
                onCancel(booking.id);
              }
            } catch (error) {
              console.error('Ошибка при отмене бронирования:', error);
              Alert.alert('Ошибка', 'Не удалось отменить бронирование');
            }
          }
        }
      ]
    );
  };
  
  // Переход к оплате
  const handlePayment = () => {
    router.push({
      pathname: '/booking/[id]/payment',
      params: { id: booking.id }
    });
  };
  
  // Информация о статусе
  const statusInfo = getStatusInfo(booking.status);
  const paymentStatusInfo = getPaymentStatusInfo(booking.paymentStatus || 'pending');
  
  // Форматирование дат
  const checkInFormatted = formatDate(booking.checkIn || booking.checkInDate);
  const checkOutFormatted = formatDate(booking.checkOut || booking.checkOutDate);
  const formattedDateRange = `${checkInFormatted} - ${checkOutFormatted} ${new Date(booking.checkOut || booking.checkOutDate || '').getFullYear()}`;

  return (
    <TouchableOpacity style={styles.card} onPress={handleViewDetails} testID="booking-card">
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: booking.imageUrl || booking.propertyImage || 'https://via.placeholder.com/100' }} 
          style={styles.image} 
          resizeMode="cover" 
        />
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: statusInfo.color }
          ]}
          testID="status-badge"
        >
          <Text style={styles.statusText}>{statusInfo.text}</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.propertyTitle}>{booking.propertyName || booking.propertyTitle || 'Без названия'}</Text>
        
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" style={styles.icon} />
          <Text style={styles.dateText}>{formattedDateRange}</Text>
        </View>
        
        <View style={styles.guestsRow}>
          <Ionicons name="people-outline" size={16} color="#666" style={styles.icon} />
          <Text style={styles.guestsText}>
            {booking.guests || booking.guestsCount || 0} {getGuestText(booking.guests || booking.guestsCount || 0)}
          </Text>
        </View>
        
        <View style={styles.nightsRow}>
          <Ionicons name="moon-outline" size={16} color="#666" style={styles.icon} />
          <Text style={styles.nightsText}>
            {booking.nights || 0} {getNightText(booking.nights || 0)}
          </Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Стоимость:</Text>
          <Text style={styles.priceValue}>{(booking.totalPrice || 0).toLocaleString()} ₽</Text>
        </View>
        
        <View style={styles.paymentStatusContainer}>
          <View 
            style={[styles.paymentStatusBadge, { backgroundColor: paymentStatusInfo.color }]}
            testID="payment-badge"
          >
            <Text style={styles.paymentStatusText}>{paymentStatusInfo.text}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        {canBeCancelled && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelBooking}
          >
            <Ionicons name="close-circle-outline" size={18} color="#F44336" />
            <Text style={styles.cancelText}>Отменить</Text>
          </TouchableOpacity>
        )}
        
        {booking.paymentStatus === 'pending' && (
          <TouchableOpacity 
            style={styles.payButton}
            onPress={handlePayment}
          >
            <Ionicons name="card-outline" size={18} color="#4D8EFF" />
            <Text style={styles.payText}>Оплатить</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  imageContainer: {
    width: 100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  guestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#444',
  },
  guestsText: {
    fontSize: 14,
    color: '#444',
  },
  nightsText: {
    fontSize: 14,
    color: '#444',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0075FF',
  },
  paymentStatusContainer: {
    marginTop: 8,
  },
  paymentStatusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  paymentStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  cancelText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payText: {
    color: '#4D8EFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default BookingCard; 
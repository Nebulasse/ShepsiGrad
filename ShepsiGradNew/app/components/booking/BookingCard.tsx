import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking, BookingStatus } from '../../types/Booking';
import { useRouter } from 'expo-router';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel }) => {
  const router = useRouter();
  
  // Преобразование даты из формата "YYYY-MM-DD" в "DD.MM.YYYY"
  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
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
  
  // Переход к деталям бронирования
  const handleViewDetails = () => {
    router.push(`/booking/${booking.id}`);
  };
  
  // Можно ли отменить бронирование
  const canBeCancelled = booking.status === 'pending' || booking.status === 'confirmed';
  
  // Информация о статусе
  const statusInfo = getStatusInfo(booking.status);

  return (
    <TouchableOpacity style={styles.card} onPress={handleViewDetails}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: booking.propertyImage || 'https://via.placeholder.com/100' }} 
          style={styles.image} 
          resizeMode="cover" 
        />
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: statusInfo.color }
          ]}
        >
          <Text style={styles.statusText}>{statusInfo.text}</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.propertyTitle}>{booking.propertyTitle}</Text>
        
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" style={styles.icon} />
          <Text style={styles.dateText}>
            {formatDate(booking.checkInDate)} — {formatDate(booking.checkOutDate)}
          </Text>
        </View>
        
        <View style={styles.guestsRow}>
          <Ionicons name="people-outline" size={16} color="#666" style={styles.icon} />
          <Text style={styles.guestsText}>
            {booking.guestsCount} {booking.guestsCount === 1 ? 'гость' : 
              booking.guestsCount < 5 ? 'гостя' : 'гостей'}
          </Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Стоимость:</Text>
          <Text style={styles.priceValue}>{booking.totalPrice.toLocaleString()} ₽</Text>
        </View>
      </View>
      
      {canBeCancelled && onCancel && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => onCancel(booking.id)}
        >
          <Ionicons name="close-circle-outline" size={18} color="#F44336" />
          <Text style={styles.cancelText}>Отменить</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
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
  cancelButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default BookingCard; 
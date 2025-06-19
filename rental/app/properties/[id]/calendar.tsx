import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { format, addDays, isBefore, parseISO, isAfter } from 'date-fns';
import { ru } from 'date-fns/locale';
import { bookingService, Booking } from '../../services/bookingService';
import { propertyService, Property } from '../../services/propertyService';

type MarkedDates = {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    selectedColor?: string;
    dotColor?: string;
    disabled?: boolean;
  };
};

export default function CalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  
  // Состояние для модального окна блокировки дат
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockingDates, setBlockingDates] = useState(false);
  
  // Загрузка данных
  const loadData = async () => {
    if (!id) {
      setError('Идентификатор объекта не указан');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Загружаем информацию об объекте
      const propertyData = await propertyService.getPropertyById(id);
      setProperty(propertyData);
      
      // Загружаем бронирования для объекта
      const bookingsData = await bookingService.getBookingsByProperty(id);
      setBookings(bookingsData);
      
      // Подготавливаем данные для календаря
      updateMarkedDates(bookingsData);
    } catch (err) {
      console.error(`Ошибка при загрузке данных для объекта ${id}:`, err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  // Обновление отмеченных дат в календаре
  const updateMarkedDates = (bookings: Booking[]) => {
    const marked: MarkedDates = {};
    
    // Отмечаем даты бронирований
    bookings.forEach(booking => {
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      
      let currentDate = checkIn;
      while (!isAfter(currentDate, checkOut)) {
        const dateString = format(currentDate, 'yyyy-MM-dd');
        
        const color = booking.status === 'confirmed' ? '#34C759' : 
                      booking.status === 'pending' ? '#FFCC00' : 
                      booking.status === 'cancelled' ? '#FF3B30' : '#8E8E93';
        
        marked[dateString] = {
          selected: true,
          selectedColor: color,
        };
        
        currentDate = addDays(currentDate, 1);
      }
    });
    
    setMarkedDates(marked);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Обработка выбора даты
  const handleDateSelect = (date: DateData) => {
    const selectedDate = date.dateString;
    
    // Если дата уже выбрана как начальная, выбираем ее как конечную
    if (startDate && !endDate && !isBefore(parseISO(selectedDate), parseISO(startDate))) {
      setEndDate(selectedDate);
      
      // Обновляем отмеченные даты для выделения диапазона
      const newMarkedDates = { ...markedDates };
      let currentDate = parseISO(startDate);
      const lastDate = parseISO(selectedDate);
      
      while (!isAfter(currentDate, lastDate)) {
        const dateString = format(currentDate, 'yyyy-MM-dd');
        newMarkedDates[dateString] = {
          ...newMarkedDates[dateString],
          selected: true,
          selectedColor: '#007AFF',
        };
        currentDate = addDays(currentDate, 1);
      }
      
      setMarkedDates(newMarkedDates);
    } else {
      // Сбрасываем выбор и начинаем новый
      setStartDate(selectedDate);
      setEndDate(null);
      
      // Сбрасываем отмеченные даты и отмечаем только выбранную
      updateMarkedDates(bookings);
      setMarkedDates(prev => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          selected: true,
          selectedColor: '#007AFF',
        }
      }));
    }
  };

  // Открытие модального окна для блокировки дат
  const openBlockModal = () => {
    if (!startDate) {
      Alert.alert('Выберите дату', 'Пожалуйста, выберите хотя бы начальную дату');
      return;
    }
    
    setBlockModalVisible(true);
  };

  // Блокировка выбранных дат
  const handleBlockDates = async () => {
    if (!startDate) {
      Alert.alert('Ошибка', 'Выберите начальную дату');
      return;
    }
    
    const endDateToUse = endDate || startDate;
    
    try {
      setBlockingDates(true);
      await bookingService.blockDates(id, startDate, endDateToUse, blockReason);
      
      Alert.alert('Успех', 'Даты успешно заблокированы');
      setBlockModalVisible(false);
      setStartDate(null);
      setEndDate(null);
      setBlockReason('');
      
      // Перезагружаем данные
      await loadData();
    } catch (error) {
      console.error('Ошибка при блокировке дат:', error);
      Alert.alert('Ошибка', 'Не удалось заблокировать даты');
    } finally {
      setBlockingDates(false);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(parseISO(dateString), 'd MMMM yyyy', { locale: ru });
  };

  // Отображение загрузки
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Загрузка...' }} />
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Отображение ошибки
  if (error || !property) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Ошибка' }} />
        <Text style={styles.errorText}>{error || 'Объект не найден'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Календарь бронирований' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.subtitle}>Календарь бронирований</Text>
      </View>
      
      <View style={styles.calendarContainer}>
        <Calendar
          markingType="dot"
          markedDates={markedDates}
          onDayPress={handleDateSelect}
          monthFormat="MMMM yyyy"
          hideExtraDays={true}
          firstDay={1}
          enableSwipeMonths={true}
          theme={{
            todayTextColor: '#007AFF',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14,
            arrowColor: '#007AFF',
          }}
        />
      </View>
      
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Обозначения:</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#34C759' }]} />
          <Text style={styles.legendText}>Подтвержденное бронирование</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFCC00' }]} />
          <Text style={styles.legendText}>Ожидающее подтверждения</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>Отмененное бронирование</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#8E8E93' }]} />
          <Text style={styles.legendText}>Заблокированные даты</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Выбранные даты</Text>
        </View>
      </View>
      
      {startDate && (
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionTitle}>Выбранные даты:</Text>
          <Text style={styles.selectionText}>
            С {formatDate(startDate)}
            {endDate ? ` по ${formatDate(endDate)}` : ''}
          </Text>
          
          <TouchableOpacity 
            style={styles.blockButton}
            onPress={openBlockModal}
          >
            <Text style={styles.blockButtonText}>Заблокировать даты</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.bookingsList}>
        <Text style={styles.bookingsTitle}>Предстоящие бронирования</Text>
        
        {bookings.length === 0 ? (
          <Text style={styles.noBookingsText}>Нет предстоящих бронирований</Text>
        ) : (
          bookings.map(booking => (
            <View key={booking.id} style={styles.bookingItem}>
              <View style={[
                styles.bookingStatus,
                booking.status === 'confirmed' ? styles.statusConfirmed :
                booking.status === 'pending' ? styles.statusPending :
                styles.statusCancelled
              ]} />
              <View style={styles.bookingDetails}>
                <Text style={styles.bookingDates}>
                  {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                </Text>
                {booking.userDetails && (
                  <Text style={styles.bookingGuest}>
                    Гость: {booking.userDetails.name}
                  </Text>
                )}
                <Text style={styles.bookingGuests}>
                  Гостей: {booking.guests}
                </Text>
              </View>
              <Text style={styles.bookingPrice}>
                {booking.totalPrice.toLocaleString()} ₽
              </Text>
            </View>
          ))
        )}
      </View>
      
      {/* Модальное окно для блокировки дат */}
      <Modal
        visible={blockModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBlockModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Блокировка дат</Text>
            
            <Text style={styles.modalText}>
              Вы собираетесь заблокировать даты:
            </Text>
            <Text style={styles.modalDates}>
              С {formatDate(startDate)}
              {endDate ? ` по ${formatDate(endDate)}` : ''}
            </Text>
            
            <Text style={styles.inputLabel}>Причина блокировки:</Text>
            <TextInput
              style={styles.input}
              value={blockReason}
              onChangeText={setBlockReason}
              placeholder="Например: Личное использование"
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setBlockModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  (!blockReason || blockingDates) && styles.disabledButton
                ]}
                onPress={handleBlockDates}
                disabled={!blockReason || blockingDates}
              >
                {blockingDates ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Заблокировать</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  calendarContainer: {
    padding: 10,
  },
  legendContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    margin: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
  selectionInfo: {
    padding: 16,
    backgroundColor: '#e8f4ff',
    margin: 16,
    borderRadius: 8,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectionText: {
    fontSize: 14,
    marginBottom: 16,
  },
  blockButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  blockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingsList: {
    padding: 16,
  },
  bookingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noBookingsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  bookingItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  bookingStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusConfirmed: {
    backgroundColor: '#34C759',
  },
  statusPending: {
    backgroundColor: '#FFCC00',
  },
  statusCancelled: {
    backgroundColor: '#FF3B30',
  },
  bookingDetails: {
    flex: 1,
  },
  bookingDates: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingGuest: {
    fontSize: 14,
    marginBottom: 2,
  },
  bookingGuests: {
    fontSize: 14,
    color: '#666',
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalDates: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 
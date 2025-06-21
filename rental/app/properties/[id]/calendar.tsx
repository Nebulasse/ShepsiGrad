import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { bookingService, Booking } from '../../services/bookingService';
import { pricingService } from '../../services/pricingService';
import { propertyService } from '../../services/propertyService';

// Настройка локализации календаря
LocaleConfig.locales['ru'] = {
  monthNames: [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ],
  monthNamesShort: ['Янв.', 'Фев.', 'Март', 'Апр.', 'Май', 'Июнь', 'Июль', 'Авг.', 'Сент.', 'Окт.', 'Нояб.', 'Дек.'],
  dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  today: 'Сегодня'
};
LocaleConfig.defaultLocale = 'ru';

type MarkedDates = {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    dotColor?: string;
    color?: string;
    textColor?: string;
    startingDay?: boolean;
    endingDay?: boolean;
  };
};

type BlockDatesModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

const BlockDatesModal: React.FC<BlockDatesModalProps> = ({ visible, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Блокировка дат</Text>
          
          <Text style={styles.modalLabel}>Причина блокировки:</Text>
          <TextInput
            style={styles.modalInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Например: личное использование, ремонт и т.д."
            multiline
          />
          
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text style={styles.modalCancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.modalConfirmButton, 
                !reason ? styles.modalConfirmButtonDisabled : null
              ]}
              onPress={handleConfirm}
              disabled={!reason}
            >
              <Text style={styles.modalConfirmButtonText}>Подтвердить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

type BulkEditModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (price: number, availability: boolean) => void;
  initialPrice: string;
  initialAvailability: boolean;
};

const BulkEditModal: React.FC<BulkEditModalProps> = ({ 
  visible, 
  onClose, 
  onSave,
  initialPrice,
  initialAvailability
}) => {
  const [price, setPrice] = useState(initialPrice);
  const [availability, setAvailability] = useState(initialAvailability);

  useEffect(() => {
    if (visible) {
      setPrice(initialPrice);
      setAvailability(initialAvailability);
    }
  }, [visible, initialPrice, initialAvailability]);

  const handleSave = () => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректную цену');
      return;
    }
    
    onSave(numPrice, availability);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Массовое редактирование</Text>
          
          <Text style={styles.modalLabel}>Цена за ночь (₽):</Text>
          <TextInput
            style={styles.modalInput}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="Введите цену"
          />
          
          <View style={styles.availabilityContainer}>
            <Text style={styles.modalLabel}>Доступно для бронирования:</Text>
            <TouchableOpacity 
              style={[
                styles.availabilityButton,
                availability ? styles.availabilityButtonActive : null
              ]}
              onPress={() => setAvailability(true)}
            >
              <Text style={availability ? styles.availabilityTextActive : styles.availabilityText}>
                Да
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.availabilityButton,
                !availability ? styles.availabilityButtonActive : null
              ]}
              onPress={() => setAvailability(false)}
            >
              <Text style={!availability ? styles.availabilityTextActive : styles.availabilityText}>
                Нет
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text style={styles.modalCancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalConfirmButton}
              onPress={handleSave}
            >
              <Text style={styles.modalConfirmButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function PropertyCalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [blockStartDate, setBlockStartDate] = useState<string | null>(null);
  const [blockEndDate, setBlockEndDate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockingMode, setBlockingMode] = useState(false);
  const [property, setProperty] = useState(null);
  const [selectionMode, setSelectionMode] = useState('single'); // 'single', 'range', 'multiple'
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedDates, setSelectedDates] = useState([]);
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkAvailability, setBulkAvailability] = useState(true);
  const [isBulkEditModalVisible, setIsBulkEditModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Загрузка информации о недвижимости
        const propertyData = await propertyService.getPropertyById(id);
        setProperty(propertyData);
        
        // Загрузка бронирований
        const bookingsData = await bookingService.getPropertyBookings(id);
        setBookings(bookingsData);
        
        // Загрузка цен и доступности
        const availabilityData = await pricingService.getAvailabilityForProperty(id);
        
        // Формирование объекта markedDates для календаря
        const marked = {};
        
        // Добавление бронирований
        bookingsData.forEach(booking => {
          const startDate = new Date(booking.checkIn);
          const endDate = new Date(booking.checkOut);
          
          let currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            marked[dateString] = {
              selected: true,
              selectedColor: '#FF6B6B',
              disabled: true,
              disableTouchEvent: true,
              marked: true,
              dotColor: '#FF6B6B'
            };
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });
        
        // Добавление цен и доступности
        availabilityData.forEach(item => {
          if (marked[item.date]) {
            // Если дата уже забронирована, не меняем её стиль
            marked[item.date].price = item.price;
          } else {
            marked[item.date] = {
              selected: false,
              selectedColor: item.available ? '#4CAF50' : '#9E9E9E',
              disabled: !item.available,
              price: item.price,
              marked: true,
              dotColor: item.available ? '#4CAF50' : '#9E9E9E'
            };
          }
        });
        
        setMarkedDates(marked);
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных календаря:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить данные календаря');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Обработка выбора даты
  const handleDateSelect = (day) => {
    const dateString = day.dateString;
    
    if (selectionMode === 'single') {
      // Одиночный выбор
      setSelectedDate(dateString);
    } 
    else if (selectionMode === 'range') {
      // Выбор диапазона
      if (!dateRange.start || (dateRange.start && dateRange.end)) {
        // Начинаем новый выбор диапазона
        setDateRange({ start: dateString, end: null });
        
        // Обновляем отметки на календаре
        const newMarkedDates = { ...markedDates };
        newMarkedDates[dateString] = { 
          ...newMarkedDates[dateString],
          startingDay: true, 
          color: '#3498db', 
          textColor: 'white' 
        };
        setMarkedDates(newMarkedDates);
      } else {
        // Завершаем выбор диапазона
        // Проверяем, что конечная дата не раньше начальной
        if (new Date(dateString) < new Date(dateRange.start)) {
          Alert.alert('Ошибка', 'Конечная дата не может быть раньше начальной');
          return;
        }
        
        setDateRange({ ...dateRange, end: dateString });
        
        // Обновляем отметки на календаре для всего диапазона
        const newMarkedDates = { ...markedDates };
        const rangeMarks = generateDateRange(dateRange.start, dateString);
        
        // Объединяем с существующими отметками
        Object.keys(rangeMarks).forEach(date => {
          newMarkedDates[date] = { 
            ...newMarkedDates[date],
            ...rangeMarks[date],
            selected: true
          };
        });
        
        setMarkedDates(newMarkedDates);
        
        // Показываем модальное окно для массового редактирования
        setBulkPrice('');
        setBulkAvailability(true);
        setIsBulkEditModalVisible(true);
      }
    }
    else if (selectionMode === 'multiple') {
      // Множественный выбор
      const newSelectedDates = [...selectedDates];
      const dateIndex = newSelectedDates.indexOf(dateString);
      
      if (dateIndex > -1) {
        // Если дата уже выбрана, удаляем её
        newSelectedDates.splice(dateIndex, 1);
        
        // Обновляем отметки на календаре
        const newMarkedDates = { ...markedDates };
        if (newMarkedDates[dateString]) {
          delete newMarkedDates[dateString].selected;
          delete newMarkedDates[dateString].selectedColor;
        }
        setMarkedDates(newMarkedDates);
      } else {
        // Добавляем новую дату
        newSelectedDates.push(dateString);
        
        // Обновляем отметки на календаре
        const newMarkedDates = { ...markedDates };
        newMarkedDates[dateString] = { 
          ...newMarkedDates[dateString],
          selected: true, 
          selectedColor: '#3498db'
        };
        setMarkedDates(newMarkedDates);
      }
      
      setSelectedDates(newSelectedDates);
      
      // Если выбрано несколько дат, показываем кнопку для массового редактирования
      if (newSelectedDates.length > 1) {
        setBulkPrice('');
        setBulkAvailability(true);
      }
    }
  };
  
  // Сохранение цены для одиночной даты
  const saveDatePrice = async () => {
    if (!selectedDate || !selectedDatePrice) {
      Alert.alert('Ошибка', 'Выберите дату и укажите цену');
      return;
    }
    
    try {
      setIsLoading(true);
      await pricingService.updateDatePrice(id, selectedDate, parseFloat(selectedDatePrice));
      
      // Обновление markedDates
      const updatedMarkedDates = { ...markedDates };
      updatedMarkedDates[selectedDate] = {
        ...updatedMarkedDates[selectedDate],
        price: parseFloat(selectedDatePrice)
      };
      
      setMarkedDates(updatedMarkedDates);
      Alert.alert('Успех', 'Цена успешно обновлена');
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка при обновлении цены:', error);
      Alert.alert('Ошибка', 'Не удалось обновить цену');
      setIsLoading(false);
    }
  };
  
  // Обновление доступности для одиночной даты
  const toggleAvailability = async () => {
    if (!selectedDate) {
      Alert.alert('Ошибка', 'Выберите дату');
      return;
    }
    
    try {
      setIsLoading(true);
      const isCurrentlyAvailable = !(markedDates[selectedDate]?.disabled);
      await pricingService.updateDateAvailability(id, selectedDate, !isCurrentlyAvailable);
      
      // Обновление markedDates
      const updatedMarkedDates = { ...markedDates };
      updatedMarkedDates[selectedDate] = {
        ...updatedMarkedDates[selectedDate],
        disabled: !isCurrentlyAvailable,
        selectedColor: isCurrentlyAvailable ? '#9E9E9E' : '#4CAF50',
        dotColor: isCurrentlyAvailable ? '#9E9E9E' : '#4CAF50'
      };
      
      setMarkedDates(updatedMarkedDates);
      Alert.alert('Успех', `Дата ${isCurrentlyAvailable ? 'недоступна' : 'доступна'} для бронирования`);
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка при обновлении доступности:', error);
      Alert.alert('Ошибка', 'Не удалось обновить доступность');
      setIsLoading(false);
    }
  };

  // Обновление отметок в календаре
  const updateCalendarMarks = (bookings: Booking[]) => {
    const marks: MarkedDates = {};
    
    bookings.forEach(booking => {
      if (booking.status === 'cancelled') return;
      
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const currentDate = new Date(checkIn);
      
      // Для каждого дня в диапазоне бронирования
      while (currentDate <= checkOut) {
        const dateString = currentDate.toISOString().split('T')[0];
        
        const isCheckIn = dateString === booking.checkIn;
        const isCheckOut = dateString === booking.checkOut;
        
        marks[dateString] = {
          marked: true,
          dotColor: getStatusColor(booking.status),
          color: getStatusBackgroundColor(booking.status),
          textColor: getStatusTextColor(booking.status),
          startingDay: isCheckIn,
          endingDay: isCheckOut,
        };
        
        // Переходим к следующему дню
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    setMarkedDates(marks);
  };

  // Определение цвета в зависимости от статуса бронирования
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'completed': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  // Определение цвета фона в зависимости от статуса бронирования
  const getStatusBackgroundColor = (status: string): string => {
    switch (status) {
      case 'confirmed': return '#E8F5E9';
      case 'pending': return '#FFF8E1';
      case 'completed': return '#E3F2FD';
      default: return '#F5F5F5';
    }
  };

  // Определение цвета текста в зависимости от статуса бронирования
  const getStatusTextColor = (status: string): string => {
    return '#333333';
  };

  // Обработчик выбора даты в календаре
  const handleDateSelect = (day: DateData) => {
    const dateString = day.dateString;
    
    if (blockingMode) {
      // Режим блокировки дат
      if (!blockStartDate) {
        setBlockStartDate(dateString);
      } else if (!blockEndDate && new Date(dateString) >= new Date(blockStartDate)) {
        setBlockEndDate(dateString);
        setIsBlockModalVisible(true);
      } else {
        setBlockStartDate(dateString);
        setBlockEndDate(null);
      }
      return;
    }
    
    // Обычный режим - показываем информацию о бронировании на выбранную дату
    setSelectedDate(dateString);
    
    // Находим бронирование для выбранной даты
    const booking = bookings.find(b => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      const selected = new Date(dateString);
      return selected >= checkIn && selected <= checkOut;
    });
    
    setSelectedBooking(booking || null);
  };

  // Блокировка дат
  const handleBlockDates = async () => {
    if (!blockStartDate || !blockEndDate || !blockReason) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите даты и укажите причину блокировки');
      return;
    }
    
    try {
      await bookingService.blockDates(id, blockStartDate, blockEndDate, blockReason);
      
      // Обновляем календарь
      await fetchBookings();
      
      // Сбрасываем состояние
      setBlockStartDate(null);
      setBlockEndDate(null);
      setBlockReason('');
      setIsBlockModalVisible(false);
      setBlockingMode(false);
      
      Alert.alert('Успех', 'Даты успешно заблокированы');
    } catch (error) {
      console.error('Ошибка при блокировке дат:', error);
      Alert.alert('Ошибка', 'Не удалось заблокировать даты');
    }
  };

  // Отмена блокировки
  const cancelBlocking = () => {
    setBlockStartDate(null);
    setBlockEndDate(null);
    setBlockReason('');
    setIsBlockModalVisible(false);
    setBlockingMode(false);
  };

  // Обработка массового обновления цен и доступности
  const handleBulkEdit = async (price: number, availability: boolean) => {
    try {
      setIsUpdating(true);
      let dates = [];
      
      // Собираем даты в зависимости от режима выбора
      if (selectionMode === 'range' && dateRange.start && dateRange.end) {
        // Для диапазона дат
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        
        let currentDate = new Date(start);
        while (currentDate <= end) {
          const dateString = currentDate.toISOString().split('T')[0];
          dates.push(dateString);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } 
      else if (selectionMode === 'multiple' && selectedDates.length > 0) {
        // Для множественного выбора
        dates = selectedDates;
      }
      
      if (dates.length === 0) {
        Alert.alert('Ошибка', 'Не выбраны даты для обновления');
        setIsUpdating(false);
        return;
      }
      
      // Обновляем цены
      await pricingService.updateBulkPrices(id, dates, price);
      
      // Обновляем доступность для каждой даты
      for (const date of dates) {
        await pricingService.updateDateAvailability(id, date, availability);
      }
      
      // Обновляем календарь
      const newMarkedDates = { ...markedDates };
      
      dates.forEach(date => {
        if (newMarkedDates[date]) {
          newMarkedDates[date] = {
            ...newMarkedDates[date],
            price: price,
            disabled: !availability,
            dotColor: availability ? '#4CAF50' : '#9E9E9E'
          };
        } else {
          newMarkedDates[date] = {
            selected: false,
            price: price,
            disabled: !availability,
            marked: true,
            dotColor: availability ? '#4CAF50' : '#9E9E9E'
          };
        }
      });
      
      setMarkedDates(newMarkedDates);
      
      // Сбрасываем выбор
      setDateRange({ start: null, end: null });
      setSelectedDates([]);
      
      Alert.alert('Успешно', 'Цены и доступность обновлены');
    } catch (error) {
      console.error('Ошибка при массовом обновлении:', error);
      Alert.alert('Ошибка', 'Не удалось обновить цены и доступность');
    } finally {
      setIsUpdating(false);
      setIsBulkEditModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Календарь бронирований',
          headerStyle: {
            backgroundColor: '#4D8EFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push(`/properties/${id}/pricing`)}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>Управление ценами</Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D8EFF" />
          <Text style={styles.loadingText}>Загрузка календаря...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle}>{property?.title}</Text>
            <Text style={styles.propertyAddress}>{property?.address}</Text>
          </View>
          
          <View style={styles.selectionModeContainer}>
            <Text style={styles.sectionTitle}>Режим выбора:</Text>
            <View style={styles.selectionButtons}>
              <TouchableOpacity
                style={[
                  styles.selectionButton,
                  selectionMode === 'single' ? styles.selectionButtonActive : null
                ]}
                onPress={() => {
                  setSelectionMode('single');
                  setDateRange({ start: null, end: null });
                  setSelectedDates([]);
                }}
              >
                <Text style={selectionMode === 'single' ? styles.selectionTextActive : styles.selectionText}>
                  Одиночный
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.selectionButton,
                  selectionMode === 'range' ? styles.selectionButtonActive : null
                ]}
                onPress={() => {
                  setSelectionMode('range');
                  setDateRange({ start: null, end: null });
                  setSelectedDates([]);
                }}
              >
                <Text style={selectionMode === 'range' ? styles.selectionTextActive : styles.selectionText}>
                  Диапазон
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.selectionButton,
                  selectionMode === 'multiple' ? styles.selectionButtonActive : null
                ]}
                onPress={() => {
                  setSelectionMode('multiple');
                  setDateRange({ start: null, end: null });
                  setSelectedDates([]);
                }}
              >
                <Text style={selectionMode === 'multiple' ? styles.selectionTextActive : styles.selectionText}>
                  Множественный
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Calendar
            current={new Date().toISOString().split('T')[0]}
            minDate={new Date().toISOString().split('T')[0]}
            maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]}
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            markingType={selectionMode === 'range' ? 'period' : 'custom'}
            theme={{
              selectedDayBackgroundColor: '#007AFF',
              todayTextColor: '#007AFF',
              arrowColor: '#007AFF',
            }}
          />
          
          {selectionMode === 'multiple' && selectedDates.length > 0 && (
            <TouchableOpacity
              style={styles.bulkEditButton}
              onPress={() => setIsBulkEditModalVisible(true)}
            >
              <Text style={styles.bulkEditButtonText}>
                Редактировать {selectedDates.length} {
                  selectedDates.length === 1 ? 'дату' : 
                  selectedDates.length < 5 ? 'даты' : 'дат'
                }
              </Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, blockingMode && styles.actionButtonActive]} 
              onPress={() => setBlockingMode(!blockingMode)}
            >
              <Ionicons name="calendar-outline" size={20} color={blockingMode ? '#FFFFFF' : '#4D8EFF'} />
              <Text style={[styles.actionButtonText, blockingMode && styles.actionButtonTextActive]}>
                {blockingMode ? 'Отменить блокировку' : 'Заблокировать даты'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {selectedDate && selectedBooking && (
            <View style={styles.bookingInfoContainer}>
              <Text style={styles.bookingInfoTitle}>Информация о бронировании</Text>
              
              <View style={styles.bookingInfoRow}>
                <Text style={styles.bookingInfoLabel}>Гость:</Text>
                <Text style={styles.bookingInfoValue}>
                  {selectedBooking.userDetails?.name || 'Нет данных'}
                </Text>
              </View>
              
              <View style={styles.bookingInfoRow}>
                <Text style={styles.bookingInfoLabel}>Даты:</Text>
                <Text style={styles.bookingInfoValue}>
                  {formatDate(selectedBooking.checkIn)} - {formatDate(selectedBooking.checkOut)}
                </Text>
              </View>
              
              <View style={styles.bookingInfoRow}>
                <Text style={styles.bookingInfoLabel}>Гостей:</Text>
                <Text style={styles.bookingInfoValue}>{selectedBooking.guests}</Text>
              </View>
              
              <View style={styles.bookingInfoRow}>
                <Text style={styles.bookingInfoLabel}>Статус:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedBooking.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(selectedBooking.status)}</Text>
                </View>
              </View>
              
              <View style={styles.bookingInfoRow}>
                <Text style={styles.bookingInfoLabel}>Оплата:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(selectedBooking.paymentStatus) }]}>
                  <Text style={styles.statusText}>{getPaymentStatusText(selectedBooking.paymentStatus)}</Text>
                </View>
              </View>
              
              <View style={styles.bookingInfoRow}>
                <Text style={styles.bookingInfoLabel}>Сумма:</Text>
                <Text style={styles.bookingInfoValue}>{selectedBooking.totalPrice} ₽</Text>
              </View>
              
              <View style={styles.bookingActions}>
                <TouchableOpacity 
                  style={[styles.bookingActionButton, styles.confirmButton]}
                  onPress={() => handleConfirmBooking(selectedBooking.id)}
                  disabled={selectedBooking.status !== 'pending'}
                >
                  <Text style={styles.bookingActionButtonText}>Подтвердить</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.bookingActionButton, styles.cancelButton]}
                  onPress={() => handleCancelBooking(selectedBooking.id)}
                  disabled={selectedBooking.status === 'cancelled' || selectedBooking.status === 'completed'}
                >
                  <Text style={styles.bookingActionButtonText}>Отменить</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {blockingMode && blockStartDate && !blockEndDate && (
            <View style={styles.blockingInstructionsContainer}>
              <Text style={styles.blockingInstructionsText}>
                Выберите конечную дату для блокировки
              </Text>
            </View>
          )}
          
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Обозначения:</Text>
            
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#E8F5E9' }]} />
              <Text style={styles.legendText}>Подтвержденное бронирование</Text>
            </View>
            
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFF8E1' }]} />
              <Text style={styles.legendText}>Ожидает подтверждения</Text>
            </View>
            
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#E3F2FD' }]} />
              <Text style={styles.legendText}>Завершенное бронирование</Text>
            </View>
            
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F5F5F5' }]} />
              <Text style={styles.legendText}>Заблокированные даты</Text>
            </View>
          </View>
        </ScrollView>
      )}
      
      {/* Модальное окно для блокировки дат */}
      <BlockDatesModal
        visible={isBlockModalVisible}
        onClose={cancelBlocking}
        onConfirm={handleBlockDates}
      />
      
      {/* Модальное окно для массового редактирования */}
      <BulkEditModal
        visible={isBulkEditModalVisible}
        onClose={() => setIsBulkEditModalVisible(false)}
        onSave={handleBulkEdit}
        initialPrice={bulkPrice}
        initialAvailability={bulkAvailability}
      />
    </View>
  );
}

// Вспомогательные функции

// Форматирование даты
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Получение текста статуса бронирования
function getStatusText(status: string): string {
  switch (status) {
    case 'confirmed': return 'Подтверждено';
    case 'pending': return 'Ожидает';
    case 'cancelled': return 'Отменено';
    case 'completed': return 'Завершено';
    default: return status;
  }
}

// Получение цвета статуса оплаты
function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'paid': return '#4CAF50';
    case 'pending': return '#FFC107';
    case 'refunded': return '#2196F3';
    case 'failed': return '#F44336';
    default: return '#9E9E9E';
  }
}

// Получение текста статуса оплаты
function getPaymentStatusText(status: string): string {
  switch (status) {
    case 'paid': return 'Оплачено';
    case 'pending': return 'Ожидает';
    case 'refunded': return 'Возвращено';
    case 'failed': return 'Ошибка';
    default: return status;
  }
}

// Генерация диапазона дат для отображения в календаре
function generateDateRange(startDate: string, endDate: string): MarkedDates {
  const range: MarkedDates = {};
  const start = new Date(startDate);
  const end = new Date(endDate);
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dateString = currentDate.toISOString().split('T')[0];
    
    range[dateString] = {
      color: '#4D8EFF',
      textColor: '#FFFFFF',
      startingDay: dateString === startDate,
      endingDay: dateString === endDate,
    };
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return range;
}

// Обработчик подтверждения бронирования
async function handleConfirmBooking(bookingId: string) {
  try {
    await bookingService.confirmBooking(bookingId);
    Alert.alert('Успех', 'Бронирование подтверждено');
    // Обновляем данные
    await fetchBookings();
  } catch (error) {
    console.error('Ошибка при подтверждении бронирования:', error);
    Alert.alert('Ошибка', 'Не удалось подтвердить бронирование');
  }
}

// Обработчик отмены бронирования
async function handleCancelBooking(bookingId: string) {
  Alert.alert(
    'Отмена бронирования',
    'Вы уверены, что хотите отменить это бронирование?',
    [
      { text: 'Нет', style: 'cancel' },
      { 
        text: 'Да', 
        onPress: async () => {
          try {
            await bookingService.cancelBooking(bookingId, 'Отменено арендодателем');
            Alert.alert('Успех', 'Бронирование отменено');
            // Обновляем данные
            await fetchBookings();
          } catch (error) {
            console.error('Ошибка при отмене бронирования:', error);
            Alert.alert('Ошибка', 'Не удалось отменить бронирование');
          }
        } 
      }
    ]
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
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
  scrollView: {
    flex: 1,
  },
  propertyInfo: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
  },
  selectionModeContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  selectionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectionText: {
    color: '#333',
  },
  selectionTextActive: {
    color: '#fff',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonActive: {
    backgroundColor: '#4D8EFF',
  },
  actionButtonText: {
    color: '#4D8EFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  actionButtonTextActive: {
    color: '#fff',
  },
  bookingInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bookingInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  bookingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingInfoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  bookingInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  bookingActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  bookingActionButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  blockingInstructionsContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 15,
    margin: 15,
  },
  blockingInstructionsText: {
    color: '#1976D2',
    fontSize: 14,
  },
  legendContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
  },
  modalCancelButtonText: {
    color: '#666',
  },
  modalConfirmButton: {
    backgroundColor: '#4D8EFF',
  },
  modalConfirmButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  bulkEditButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  bulkEditButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  availabilityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginLeft: 8,
  },
  availabilityButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  availabilityText: {
    color: '#333',
  },
  availabilityTextActive: {
    color: '#fff',
  },
  headerButton: {
    padding: 12,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 
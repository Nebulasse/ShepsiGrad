import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { api, createBooking } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import PaymentForm from '../../components/booking/PaymentForm';
import { bookingService } from '../../services/bookingService';

interface Property {
  id: string;
  title: string;
  price: number;
  location: {
    city: string;
    address: string;
  };
  max_guests: number;
}

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState('initial'); // initial, created, paying, confirmed

  // Состояние для формы бронирования
  const [bookingData, setBookingData] = useState({
    checkInDate: new Date(),
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    guests: 1,
    totalPrice: 0,
  });

  // Состояния для отображения выбора дат
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  // Загрузка информации о недвижимости
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        setProperty(response.data);
        
        // Рассчитываем начальную стоимость
        calculateTotalPrice(response.data.price, bookingData.checkInDate, bookingData.checkOutDate);
      } catch (error) {
        console.error('Error fetching property:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить информацию об объекте');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Функция для расчета общей стоимости
  const calculateTotalPrice = (price: number, checkIn: Date, checkOut: Date) => {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = price * diffDays;
    
    setBookingData(prev => ({
      ...prev,
      totalPrice
    }));
  };

  // Обработчики изменения дат
  const handleCheckInChange = (event: any, selectedDate?: Date) => {
    setShowCheckInPicker(false);
    
    if (selectedDate) {
      // Проверяем, что дата заезда не позже даты выезда
      if (selectedDate >= bookingData.checkOutDate) {
        const newCheckOutDate = new Date(selectedDate);
        newCheckOutDate.setDate(selectedDate.getDate() + 1);
        
        setBookingData(prev => ({
          ...prev,
          checkInDate: selectedDate,
          checkOutDate: newCheckOutDate
        }));
        
        if (property) {
          calculateTotalPrice(property.price, selectedDate, newCheckOutDate);
        }
      } else {
        setBookingData(prev => ({
          ...prev,
          checkInDate: selectedDate
        }));
        
        if (property) {
          calculateTotalPrice(property.price, selectedDate, bookingData.checkOutDate);
        }
      }
    }
  };

  const handleCheckOutChange = (event: any, selectedDate?: Date) => {
    setShowCheckOutPicker(false);
    
    if (selectedDate) {
      // Проверяем, что дата выезда не раньше даты заезда
      if (selectedDate <= bookingData.checkInDate) {
        Alert.alert('Ошибка', 'Дата выезда должна быть позже даты заезда');
        return;
      }
      
      setBookingData(prev => ({
        ...prev,
        checkOutDate: selectedDate
      }));
      
      if (property) {
        calculateTotalPrice(property.price, bookingData.checkInDate, selectedDate);
      }
    }
  };

  // Обработчик изменения количества гостей
  const handleGuestsChange = (value: string) => {
    const guests = parseInt(value);
    
    if (isNaN(guests) || guests < 1) {
      setBookingData(prev => ({
        ...prev,
        guests: 1
      }));
      return;
    }
    
    if (property && guests > property.max_guests) {
      Alert.alert('Ошибка', `Максимальное количество гостей: ${property.max_guests}`);
      setBookingData(prev => ({
        ...prev,
        guests: property.max_guests
      }));
      return;
    }
    
    setBookingData(prev => ({
      ...prev,
      guests
    }));
  };

  // Создание бронирования
  const handleCreateBooking = async () => {
    if (!user) {
      Alert.alert('Необходима авторизация', 'Для бронирования необходимо войти в систему');
      router.push('/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const bookingPayload = {
        property_id: property.id,
        check_in_date: bookingData.checkInDate.toISOString(),
        check_out_date: bookingData.checkOutDate.toISOString(),
        guests: bookingData.guests,
        total_price: bookingData.totalPrice,
        user_id: user.id
      };
      
      const newBookingId = await bookingService.createBooking(bookingPayload);
      setBookingId(newBookingId);
      setBookingStatus('created');
      
      Alert.alert('Успех', 'Бронирование создано! Теперь вы можете оплатить его.');
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Ошибка', 'Не удалось создать бронирование');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики для компонента оплаты
  const handlePaymentSuccess = async () => {
    setBookingStatus('confirmed');
    Alert.alert(
      'Бронирование подтверждено',
      'Ваше бронирование успешно оплачено и подтверждено!',
      [
        { 
          text: 'К моим бронированиям', 
          onPress: () => router.push('/bookings') 
        }
      ]
    );
  };

  const handlePaymentCancel = () => {
    setBookingStatus('created');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Объект не найден</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Вернуться назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showPayment && bookingId) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Оплата бронирования',
          headerLeft: () => (
            <TouchableOpacity onPress={() => setShowPayment(false)}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          )
        }} />
        
        <PaymentForm 
          bookingId={bookingId}
          amount={bookingData.totalPrice}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </View>
    );
  }

  if (bookingStatus === 'confirmed') {
    return (
      <View style={styles.container}>
        <Text style={styles.successTitle}>Бронирование подтверждено!</Text>
        <Text style={styles.successText}>
          Ваше бронирование успешно оплачено и подтверждено. 
          Вы можете просмотреть детали в разделе "Мои бронирования".
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Бронирование' }} />
      
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>{property.title}</Text>
        <Text style={styles.propertyLocation}>
          {property.location.city}, {property.location.address}
        </Text>
        <Text style={styles.propertyPrice}>
          {property.price} ₽ / ночь
        </Text>
      </View>
      
      <View style={styles.bookingForm}>
        <Text style={styles.sectionTitle}>Детали бронирования</Text>
        
        {/* Выбор даты заезда */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Дата заезда</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowCheckInPicker(true)}
          >
            <Text style={styles.dateText}>
              {format(bookingData.checkInDate, 'dd MMMM yyyy', { locale: ru })}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          {showCheckInPicker && (
            <DateTimePicker
              value={bookingData.checkInDate}
              mode="date"
              display="default"
              onChange={handleCheckInChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        {/* Выбор даты выезда */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Дата выезда</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowCheckOutPicker(true)}
          >
            <Text style={styles.dateText}>
              {format(bookingData.checkOutDate, 'dd MMMM yyyy', { locale: ru })}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          {showCheckOutPicker && (
            <DateTimePicker
              value={bookingData.checkOutDate}
              mode="date"
              display="default"
              onChange={handleCheckOutChange}
              minimumDate={new Date(bookingData.checkInDate.getTime() + 86400000)} // +1 день
            />
          )}
        </View>
        
        {/* Количество гостей */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Количество гостей</Text>
          <View style={styles.guestsInputContainer}>
            <TouchableOpacity 
              style={styles.guestsButton}
              onPress={() => handleGuestsChange((bookingData.guests - 1).toString())}
              disabled={bookingData.guests <= 1}
            >
              <Ionicons 
                name="remove" 
                size={20} 
                color={bookingData.guests <= 1 ? '#ccc' : '#007AFF'} 
              />
            </TouchableOpacity>
            
            <TextInput
              style={styles.guestsInput}
              value={bookingData.guests.toString()}
              onChangeText={handleGuestsChange}
              keyboardType="number-pad"
            />
            
            <TouchableOpacity 
              style={styles.guestsButton}
              onPress={() => handleGuestsChange((bookingData.guests + 1).toString())}
              disabled={property && bookingData.guests >= property.max_guests}
            >
              <Ionicons 
                name="add" 
                size={20} 
                color={property && bookingData.guests >= property.max_guests ? '#ccc' : '#007AFF'} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.maxGuests}>
            Максимум: {property.max_guests} гостей
          </Text>
        </View>
      </View>
      
      <View style={styles.priceSummary}>
        <Text style={styles.sectionTitle}>Итого</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            {property.price} ₽ x {Math.ceil(
              (bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime()) / 
              (1000 * 60 * 60 * 24)
            )} ночей
          </Text>
          <Text style={styles.priceValue}>{bookingData.totalPrice} ₽</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabelTotal}>Итого к оплате</Text>
          <Text style={styles.priceValueTotal}>{bookingData.totalPrice} ₽</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={handleCreateBooking}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.bookButtonText}>Забронировать</Text>
        )}
      </TouchableOpacity>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#FF3B30',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  propertyInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  propertyLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: '500',
  },
  bookingForm: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
  },
  guestsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  guestsInput: {
    flex: 1,
    height: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  maxGuests: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  priceSummary: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#333',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
  },
}); 
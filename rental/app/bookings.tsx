import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { bookingService, Booking } from './services/bookingService';
import { authService } from './services/authService';

export default function BookingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past' | 'pending' | 'cancelled'>('all');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Проверка авторизации при монтировании компонента
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isInitialized = await authService.initialize();
        setIsAuthenticated(isInitialized);
        if (isInitialized) {
          fetchBookings();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Получение бронирований с сервера
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Ошибка при загрузке бронирований:', error);
      
      // Если ошибка связана с авторизацией, устанавливаем флаг isAuthenticated в false
      if (error instanceof Error && error.message.includes('не авторизован')) {
        setIsAuthenticated(false);
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить бронирования');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик перехода на экран входа
  const handleGoToLogin = () => {
    router.push('/login');
  };

  // Фильтрация бронирований
  const filteredBookings = () => {
    const now = new Date();
    
    switch (activeFilter) {
      case 'upcoming':
        return bookings.filter(booking => 
          new Date(booking.checkIn) >= now && booking.status !== 'cancelled'
        );
      case 'past':
        return bookings.filter(booking => 
          new Date(booking.checkOut) < now || booking.status === 'completed'
        );
      case 'pending':
        return bookings.filter(booking => booking.status === 'pending');
      case 'cancelled':
        return bookings.filter(booking => booking.status === 'cancelled');
      default:
        return bookings;
    }
  };

  // Обработчик подтверждения бронирования
  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await bookingService.confirmBooking(bookingId);
      Alert.alert('Успех', 'Бронирование подтверждено');
      fetchBookings(); // Обновляем список
    } catch (error) {
      console.error('Ошибка при подтверждении бронирования:', error);
      
      // Если ошибка связана с авторизацией, устанавливаем флаг isAuthenticated в false
      if (error instanceof Error && error.message.includes('не авторизован')) {
        setIsAuthenticated(false);
        Alert.alert('Ошибка авторизации', 'Для подтверждения бронирования необходимо войти в аккаунт');
      } else {
        Alert.alert('Ошибка', 'Не удалось подтвердить бронирование');
      }
    }
  };

  // Обработчик отмены бронирования
  const handleCancelBooking = (bookingId: string) => {
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
              fetchBookings(); // Обновляем список
            } catch (error) {
              console.error('Ошибка при отмене бронирования:', error);
              
              // Если ошибка связана с авторизацией, устанавливаем флаг isAuthenticated в false
              if (error instanceof Error && error.message.includes('не авторизован')) {
                setIsAuthenticated(false);
                Alert.alert('Ошибка авторизации', 'Для отмены бронирования необходимо войти в аккаунт');
              } else {
                Alert.alert('Ошибка', 'Не удалось отменить бронирование');
              }
            }
          } 
        }
      ]
    );
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Получение цвета статуса бронирования
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'cancelled': return '#F44336';
      case 'completed': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  // Получение текста статуса бронирования
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено';
      case 'pending': return 'Ожидает';
      case 'cancelled': return 'Отменено';
      case 'completed': return 'Завершено';
      default: return status;
    }
  };

  // Рендер элемента бронирования
  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => router.push(`/properties/${item.propertyId}`)}
    >
      <View style={styles.bookingHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        <Text style={styles.bookingPrice}>{item.totalPrice.toLocaleString()} ₽</Text>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.bookingRow}>
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.bookingText}>
            {formatDate(item.checkIn)} - {formatDate(item.checkOut)}
          </Text>
        </View>
        
        <View style={styles.bookingRow}>
          <Ionicons name="person-outline" size={18} color="#666" />
          <Text style={styles.bookingText}>
            {item.userDetails?.name || 'Гость'} • {item.guests} {item.guests === 1 ? 'гость' : 'гостей'}
          </Text>
        </View>
      </View>

      {item.status === 'pending' && (
        <View style={styles.bookingActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleConfirmBooking(item.id)}
          >
            <Text style={styles.actionButtonText}>Подтвердить</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelBooking(item.id)}
          >
            <Text style={styles.actionButtonText}>Отменить</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  // Если пользователь не авторизован, показываем экран с предложением авторизоваться
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            headerShown: true,
            title: 'Бронирования',
            headerStyle: {
              backgroundColor: '#4D8EFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
        
        <View style={styles.authContainer}>
          <Ionicons name="calendar-outline" size={80} color="#CCCCCC" />
          <Text style={styles.authTitle}>Требуется авторизация</Text>
          <Text style={styles.authMessage}>
            Для просмотра и управления бронированиями необходимо войти в аккаунт арендодателя.
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleGoToLogin}
          >
            <Text style={styles.authButtonText}>Войти в аккаунт</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Бронирования',
          headerStyle: {
            backgroundColor: '#4D8EFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      <View style={styles.filtersContainer}>
        <ScrollableFilters 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D8EFF" />
          <Text style={styles.loadingText}>Загрузка бронирований...</Text>
        </View>
      ) : filteredBookings().length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Нет бронирований</Text>
          <Text style={styles.emptySubtext}>
            {activeFilter !== 'all' 
              ? 'Попробуйте изменить фильтр' 
              : 'Бронирования появятся здесь, когда гости забронируют ваши объекты'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings()}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchBookings}
        />
      )}
    </View>
  );
}

// Компонент с фильтрами
function ScrollableFilters({ 
  activeFilter, 
  setActiveFilter 
}: { 
  activeFilter: string; 
  setActiveFilter: (filter: any) => void;
}) {
  const filters = [
    { id: 'all', label: 'Все' },
    { id: 'upcoming', label: 'Предстоящие' },
    { id: 'pending', label: 'Ожидают' },
    { id: 'past', label: 'Прошедшие' },
    { id: 'cancelled', label: 'Отмененные' }
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.filtersScrollContent}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterButton,
            activeFilter === filter.id && styles.activeFilterButton
          ]}
          onPress={() => setActiveFilter(filter.id)}
        >
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === filter.id && styles.activeFilterButtonText
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filtersScrollContent: {
    paddingHorizontal: 15,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#4D8EFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: '500',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  listContainer: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingDetails: {
    marginBottom: 15,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  authMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  authButton: {
    backgroundColor: '#4D8EFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
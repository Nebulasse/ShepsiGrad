import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import BookingCard from './components/booking/BookingCard';
import CancelBookingModal from './components/booking/CancelBookingModal';
import bookingService from './services/bookingService';
import { Booking, BookingStatus } from './types/Booking';

// Типы фильтров
type BookingFilter = 'upcoming' | 'past' | 'cancelled' | 'all';

export default function BookingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<BookingFilter>('upcoming');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');

  useEffect(() => {
    fetchBookings();
  }, [activeFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Определяем параметры фильтрации на основе выбранного фильтра
      const filters = getFiltersFromActiveFilter(activeFilter);
      const fetchedBookings = await bookingService.getUserBookings(filters);
      setBookings(fetchedBookings);
    } catch (error) {
      console.error('Ошибка при загрузке бронирований:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFiltersFromActiveFilter = (filter: BookingFilter) => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return {
          status: ['pending', 'confirmed'] as BookingStatus[],
          onlyUpcoming: true
        };
      case 'past':
        return {
          status: 'completed' as BookingStatus
        };
      case 'cancelled':
        return {
          status: ['cancelled', 'rejected'] as BookingStatus[]
        };
      case 'all':
      default:
        return {};
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    try {
      await bookingService.cancelBooking(selectedBookingId, reason);
      fetchBookings(); // Обновляем список после отмены
    } catch (error) {
      console.error('Ошибка при отмене бронирования:', error);
    }
  };

  const renderFilterButton = (filter: BookingFilter, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
      onPress={() => setActiveFilter(filter)}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={activeFilter === filter ? '#FFFFFF' : '#666666'}
        style={styles.filterIcon}
      />
      <Text
        style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Мои бронирования',
          headerRight: () => (
            <TouchableOpacity onPress={fetchBookings} style={styles.refreshButton}>
              <Ionicons name="refresh" size={22} color="#0075FF" />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar style="auto" />

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {renderFilterButton('upcoming', 'Предстоящие', 'calendar-outline')}
          {renderFilterButton('past', 'Завершенные', 'checkmark-circle-outline')}
          {renderFilterButton('cancelled', 'Отмененные', 'close-circle-outline')}
          {renderFilterButton('all', 'Все', 'list-outline')}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0075FF" />
          <Text style={styles.loadingText}>Загрузка бронирований...</Text>
        </View>
      ) : bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard 
              booking={item} 
              onCancel={handleCancelBooking}
            />
          )}
          contentContainerStyle={styles.bookingsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Нет бронирований</Text>
          <Text style={styles.emptyText}>
            {activeFilter === 'upcoming' 
              ? 'У вас пока нет предстоящих бронирований. Начните поиск, чтобы забронировать жилье.'
              : activeFilter === 'past' 
                ? 'У вас пока нет завершенных бронирований.'
                : activeFilter === 'cancelled' 
                  ? 'У вас пока нет отмененных бронирований.'
                  : 'У вас пока нет бронирований. Начните поиск, чтобы забронировать жилье.'}
          </Text>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.searchButtonText}>Найти жилье</Text>
          </TouchableOpacity>
        </View>
      )}

      <CancelBookingModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        onCancel={handleConfirmCancel}
        bookingId={selectedBookingId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  refreshButton: {
    padding: 10,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filtersScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#0075FF',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
  },
  activeFilterText: {
    color: '#FFFFFF',
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
  bookingsList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  searchButton: {
    backgroundColor: '#0075FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
}); 
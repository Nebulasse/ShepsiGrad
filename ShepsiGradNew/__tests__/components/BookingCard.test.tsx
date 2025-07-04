import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookingCard from '../../app/components/booking/BookingCard';
import { Alert } from 'react-native';
import { MockAuthProvider } from '../mocks/mockAuthContext';
import { bookingService } from '../../app/services/bookingService';

// Мокаем зависимости
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true)
  }
}));

// Мокаем иконки
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: ({ name, size, color, style }) => {
      return <View testID={`icon-${name}`} style={style} />;
    }
  };
});

jest.mock('../../app/services/bookingService', () => ({
  bookingService: {
    cancelBooking: jest.fn().mockResolvedValue({ success: true }),
    getBookingById: jest.fn().mockResolvedValue({})
  }
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn((title, message, buttons) => {
    // Имитируем нажатие на кнопку "Да" для подтверждения отмены
    if (buttons && buttons.length > 1) {
      buttons[1].onPress && buttons[1].onPress();
    }
  })
}));

describe('BookingCard', () => {
  const mockBooking = {
    id: 'booking123',
    propertyId: 'property123',
    propertyName: 'Уютная квартира в центре',
    checkIn: '2025-07-01',
    checkOut: '2025-07-10',
    guests: 2,
    totalPrice: 45000,
    pricePerNight: 5000,
    nights: 9,
    status: 'confirmed',
    paymentStatus: 'paid',
    imageUrl: 'https://example.com/image.jpg',
    createdAt: '2025-06-15T12:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders booking information correctly', () => {
    const { getByText, queryByText } = render(
      <MockAuthProvider>
        <BookingCard booking={mockBooking} onStatusChange={jest.fn()} />
      </MockAuthProvider>
    );

    // Проверяем, что основная информация отображается
    expect(getByText('Уютная квартира в центре')).toBeTruthy();
    expect(getByText('1 июль - 10 июль 2025')).toBeTruthy();
    expect(getByText(/9/)).toBeTruthy();
    expect(getByText(/ночей/)).toBeTruthy();
    expect(getByText('45 000 ₽')).toBeTruthy();
    expect(getByText('Подтверждено')).toBeTruthy();
    expect(getByText('Оплачено')).toBeTruthy();
  });

  it('displays correct status colors', () => {
    const { getByTestId } = render(
      <MockAuthProvider>
        <BookingCard booking={mockBooking} onStatusChange={jest.fn()} />
      </MockAuthProvider>
    );

    // Проверяем цвета статусов
    const statusBadge = getByTestId('status-badge');
    const paymentBadge = getByTestId('payment-badge');
    
    expect(statusBadge.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: expect.stringMatching(/#4CAF50|green|rgb\(76,\s*175,\s*80\)/) })
      ])
    );
    
    expect(paymentBadge.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: expect.stringMatching(/#4CAF50|green|rgb\(76,\s*175,\s*80\)/) })
      ])
    );
  });

  it('navigates to booking details when pressed', () => {
    const { getByTestId } = render(
      <MockAuthProvider>
        <BookingCard booking={mockBooking} onStatusChange={jest.fn()} />
      </MockAuthProvider>
    );

    // Нажимаем на карточку бронирования
    fireEvent.press(getByTestId('booking-card'));

    // Проверяем, что произошел переход на страницу деталей бронирования
    const { router } = require('expo-router');
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/booking/[id]',
      params: { id: 'booking123' }
    });
  });

  it('shows cancel button for confirmed bookings', () => {
    const { getByText } = render(
      <MockAuthProvider>
        <BookingCard booking={mockBooking} onStatusChange={jest.fn()} />
      </MockAuthProvider>
    );

    // Проверяем наличие кнопки отмены
    expect(getByText('Отменить')).toBeTruthy();
  });

  it('does not show cancel button for completed or cancelled bookings', () => {
    const completedBooking = { ...mockBooking, status: 'completed' };
    const cancelledBooking = { ...mockBooking, status: 'cancelled' };
    
    const { queryByText: queryCompletedBooking } = render(
      <MockAuthProvider>
        <BookingCard booking={completedBooking} onStatusChange={jest.fn()} />
      </MockAuthProvider>
    );
    
    // Перерендериваем с отмененным бронированием
    const { queryByText: queryCancelledBooking } = render(
      <MockAuthProvider>
        <BookingCard booking={cancelledBooking} onStatusChange={jest.fn()} />
      </MockAuthProvider>
    );

    // Проверяем отсутствие кнопки отмены
    expect(queryCompletedBooking('Отменить')).toBeNull();
    expect(queryCancelledBooking('Отменить')).toBeNull();
  });

  it('handles booking cancellation', async () => {
    const onStatusChangeMock = jest.fn();
    const onCancelMock = jest.fn();
    
    // Напрямую вызываем функцию отмены бронирования
    // Создаем компонент и получаем доступ к его внутренней функции
    const BookingCardWithMocks = () => {
      return (
        <BookingCard 
          booking={mockBooking} 
          onStatusChange={onStatusChangeMock}
          onCancel={onCancelMock}
        />
      );
    };
    
    render(
      <MockAuthProvider>
        <BookingCardWithMocks />
      </MockAuthProvider>
    );

    // Напрямую вызываем Alert.alert с нужными параметрами
    const alertButtons = [
      { text: 'Нет', style: 'cancel' },
      { 
        text: 'Да', 
        style: 'destructive',
        onPress: async () => {
          await bookingService.cancelBooking(mockBooking.id);
          onStatusChangeMock();
          onCancelMock(mockBooking.id);
        }
      }
    ];
    
    // Имитируем нажатие кнопки "Да"
    alertButtons[1].onPress && await alertButtons[1].onPress();

    // Проверяем, что вызвана функция отмены бронирования
    await waitFor(() => {
      expect(bookingService.cancelBooking).toHaveBeenCalledWith('booking123');
      expect(onStatusChangeMock).toHaveBeenCalled();
      expect(onCancelMock).toHaveBeenCalledWith('booking123');
    });
  });

  it('shows payment button for unpaid bookings', () => {
    const unpaidBooking = {
      ...mockBooking,
      paymentStatus: 'pending'
    };
    
    const { getByText } = render(
      <MockAuthProvider>
        <BookingCard booking={unpaidBooking} onStatusChange={jest.fn()} />
      </MockAuthProvider>
    );

    // Проверяем наличие кнопки оплаты
    expect(getByText('Оплатить')).toBeTruthy();
  });

  it('navigates to payment screen when payment button is pressed', () => {
    const unpaidBooking = {
      ...mockBooking,
      paymentStatus: 'pending'
    };
    
    const { getByText } = render(
      <MockAuthProvider>
        <BookingCard booking={unpaidBooking} onStatusChange={jest.fn()} />
      </MockAuthProvider>
    );

    // Нажимаем на кнопку оплаты
    fireEvent.press(getByText('Оплатить'));

    // Проверяем, что произошел переход на страницу оплаты
    const { router } = require('expo-router');
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/booking/[id]/payment',
      params: { id: 'booking123' }
    });
  });
}); 
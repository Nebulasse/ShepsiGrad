import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PaymentForm from '../../app/components/booking/PaymentForm';
import axios from 'axios';
import { Alert } from 'react-native';
import { MockAuthProvider, mockUser } from '../mocks/mockAuthContext';

// Мокаем зависимости
jest.mock('axios');
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn().mockReturnValue({ id: 'booking123' }),
  router: {
    back: jest.fn(),
    push: jest.fn()
  }
}));
jest.mock('react-native-webview', () => 'WebView');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

describe('PaymentForm', () => {

  const mockBookingData = {
    id: 'booking123',
    propertyId: 'property123',
    propertyName: 'Test Property',
    checkIn: '2025-07-01',
    checkOut: '2025-07-10',
    guests: 2,
    totalPrice: 1000,
    pricePerNight: 100,
    nights: 9,
    serviceFee: 100,
    cleaningFee: 0,
    status: 'awaiting_payment',
    imageUrl: 'https://example.com/image.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Мокаем успешный ответ от API
    (axios.get as jest.Mock).mockResolvedValue({ data: mockBookingData });
  });

  it('renders loading state initially', () => {
    const { getByText } = render(
      <MockAuthProvider>
        <PaymentForm />
      </MockAuthProvider>
    );

    expect(getByText('Загрузка данных...')).toBeTruthy();
  });

  it('renders booking details after loading', async () => {
    const { getByText, queryByText } = render(
      <MockAuthProvider>
        <PaymentForm />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(queryByText('Загрузка данных...')).toBeNull();
      expect(getByText('Test Property')).toBeTruthy();
      expect(getByText('Оплата бронирования')).toBeTruthy();
      expect(getByText('1000 ₽')).toBeTruthy();
    });
  });

  it('allows selecting payment method', async () => {
    const { getByText } = render(
      <MockAuthProvider>
        <PaymentForm />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Банковская карта')).toBeTruthy();
      expect(getByText('Система быстрых платежей')).toBeTruthy();
    });

    // Выбираем метод оплаты СБП
    fireEvent.press(getByText('Система быстрых платежей'));
  });

  it('handles payment creation', async () => {
    // Мокаем успешное создание платежа
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        id: 'payment123',
        bookingId: 'booking123',
        amount: 1000,
        currency: 'RUB',
        status: 'pending',
        paymentMethod: 'yookassa',
        confirmationUrl: 'https://payment.example.com',
        createdAt: '2025-06-20T12:00:00Z'
      }
    });

    const { getByText } = render(
      <MockAuthProvider>
        <PaymentForm />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Оплатить 1000 ₽')).toBeTruthy();
    });

    // Нажимаем кнопку оплаты
    fireEvent.press(getByText('Оплатить 1000 ₽'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/payments'),
        expect.objectContaining({
          bookingId: 'booking123',
          paymentMethod: 'yookassa'
        }),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      );
    });
  });

  it('handles payment error', async () => {
    // Мокаем ошибку при создании платежа
    (axios.post as jest.Mock).mockRejectedValue(new Error('Payment error'));
    
    const { getByText } = render(
      <MockAuthProvider>
        <PaymentForm />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Оплатить 1000 ₽')).toBeTruthy();
    });

    // Нажимаем кнопку оплаты
    fireEvent.press(getByText('Оплатить 1000 ₽'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Ошибка', 'Не удалось создать платеж');
    });
  });
}); 
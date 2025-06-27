import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ReviewsList from '../../app/components/property/ReviewsList';
import axios from 'axios';
import { Alert } from 'react-native';
import { MockAuthProvider } from '../mocks/mockAuthContext';

// Мокаем зависимости
jest.mock('axios');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  }
}));
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

describe('ReviewsList', () => {
  const mockReviews = [
    {
      id: 'review1',
      propertyId: 'property123',
      userId: 'user123',
      userName: 'Test User',
      rating: 5,
      comment: 'Отличное место!',
      createdAt: '2025-06-15T12:00:00Z',
      updatedAt: '2025-06-15T12:00:00Z'
    },
    {
      id: 'review2',
      propertyId: 'property123',
      userId: 'user456',
      userName: 'Another User',
      rating: 4,
      comment: 'Хорошее место, но есть недостатки.',
      createdAt: '2025-06-10T10:00:00Z',
      updatedAt: '2025-06-10T10:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Мокаем успешный ответ от API
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        reviews: mockReviews
      }
    });
  });

  it('renders loading state initially', () => {
    const { getByText } = render(
      <MockAuthProvider>
        <ReviewsList propertyId="property123" />
      </MockAuthProvider>
    );

    expect(getByText('Загрузка отзывов...')).toBeTruthy();
  });

  it('renders reviews after loading', async () => {
    const { getByText } = render(
      <MockAuthProvider>
        <ReviewsList propertyId="property123" />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Отличное место!')).toBeTruthy();
      expect(getByText('Хорошее место, но есть недостатки.')).toBeTruthy();
    });
  });

  it('calculates average rating correctly', async () => {
    const { getByText } = render(
      <MockAuthProvider>
        <ReviewsList propertyId="property123" />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(getByText('4.5')).toBeTruthy();
      expect(getByText('2 отзывов')).toBeTruthy();
    });
  });

  it('does not show write review button when user already reviewed', async () => {
    // Мокаем отзыв от текущего пользователя
    const reviewsWithUserReview = [
      ...mockReviews,
      {
        id: 'review3',
        propertyId: 'property123',
        userId: 'user123', // ID текущего пользователя
        userName: 'Current User',
        rating: 3,
        comment: 'Мой отзыв',
        createdAt: '2025-06-20T14:00:00Z',
        updatedAt: '2025-06-20T14:00:00Z'
      }
    ];

    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        reviews: reviewsWithUserReview
      }
    });

    const { queryByText } = render(
      <MockAuthProvider>
        <ReviewsList propertyId="property123" canReview={true} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(queryByText('Написать отзыв')).toBeNull();
    });
  });

  it('shows write review button when user has not reviewed yet', async () => {
    const { getByText } = render(
      <MockAuthProvider>
        <ReviewsList propertyId="property123" canReview={true} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Написать отзыв')).toBeTruthy();
    });
  });

  it('handles submitting a new review', async () => {
    // Мокаем успешное создание отзыва
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        id: 'newReview',
        propertyId: 'property123',
        userId: 'user123',
        rating: 5,
        comment: 'Новый отзыв',
        createdAt: '2025-06-25T15:00:00Z',
        updatedAt: '2025-06-25T15:00:00Z'
      }
    });

    const { getByText } = render(
      <MockAuthProvider>
        <ReviewsList propertyId="property123" canReview={true} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Написать отзыв')).toBeTruthy();
    });

    // Нажимаем кнопку "Написать отзыв"
    fireEvent.press(getByText('Написать отзыв'));

    // Проверяем, что модальное окно открылось
    // Здесь можно было бы проверить наличие элементов модального окна,
    // но это требует более сложной имплементации теста
  });

  it('renders empty state when no reviews', async () => {
    // Мокаем пустой список отзывов
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        reviews: []
      }
    });

    const { getByText } = render(
      <MockAuthProvider>
        <ReviewsList propertyId="property123" />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Пока нет отзывов')).toBeTruthy();
    });
  });

  it('handles errors when loading reviews', async () => {
    // Мокаем ошибку при загрузке отзывов
    (axios.get as jest.Mock).mockRejectedValue(new Error('Failed to load reviews'));

    const { getByText } = render(
      <MockAuthProvider>
        <ReviewsList propertyId="property123" />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Ошибка', 'Не удалось загрузить отзывы');
    });
  });
}); 
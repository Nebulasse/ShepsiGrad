import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PropertyCard from '../../app/components/property/PropertyCard';
import { MockAuthProvider } from '../mocks/mockAuthContext';

// Мокаем зависимости
jest.mock('expo-router', () => require('../mocks/mockExpoRouter'));

jest.mock('../../app/services/favoriteService', () => ({
  toggleFavorite: jest.fn().mockResolvedValue({ success: true })
}));

describe('PropertyCard', () => {
  const mockProperty = {
    id: 'property123',
    title: 'Уютная квартира в центре',
    description: 'Просторная квартира с видом на море',
    price: 5000,
    address: 'ул. Приморская, 15',
    city: 'Шепси',
    rating: 4.7,
    reviewsCount: 23,
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    amenities: ['wifi', 'parking', 'pool'],
    isFavorite: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders property information correctly', () => {
    const { getByText, getByTestId } = render(
      <MockAuthProvider>
        <PropertyCard property={mockProperty} />
      </MockAuthProvider>
    );

    // Проверяем, что основная информация отображается
    expect(getByText('Уютная квартира в центре')).toBeTruthy();
    expect(getByText('ул. Приморская, 15, Шепси')).toBeTruthy();
    expect(getByText('5 000 ₽ / ночь')).toBeTruthy();
    expect(getByText('4.7')).toBeTruthy();
    expect(getByText('(23)')).toBeTruthy();
  });

  it('navigates to property details when pressed', () => {
    const { getByTestId } = render(
      <MockAuthProvider>
        <PropertyCard property={mockProperty} />
      </MockAuthProvider>
    );

    // Нажимаем на карточку объекта
    fireEvent.press(getByTestId('property-card'));

    // Проверяем, что произошел переход на страницу деталей объекта
    const { mockRouter } = require('../mocks/mockExpoRouter');
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/property/[id]',
      params: { id: 'property123' }
    });
  });

  it('toggles favorite status when favorite button is pressed', async () => {
    const { getByTestId } = render(
      <MockAuthProvider>
        <PropertyCard property={mockProperty} />
      </MockAuthProvider>
    );

    // Нажимаем на кнопку избранного
    fireEvent.press(getByTestId('favorite-button'));

    // Проверяем, что вызвана функция toggleFavorite
    await waitFor(() => {
      expect(require('../../app/services/favoriteService').toggleFavorite)
        .toHaveBeenCalledWith('property123');
    });
  });

  it('displays amenities icons', () => {
    const { getByTestId } = render(
      <MockAuthProvider>
        <PropertyCard property={mockProperty} />
      </MockAuthProvider>
    );

    // Проверяем, что иконки удобств отображаются
    expect(getByTestId('amenity-wifi')).toBeTruthy();
    expect(getByTestId('amenity-parking')).toBeTruthy();
    expect(getByTestId('amenity-pool')).toBeTruthy();
  });

  it('handles property without images', () => {
    const propertyWithoutImages = {
      ...mockProperty,
      images: []
    };

    const { getByTestId } = render(
      <MockAuthProvider>
        <PropertyCard property={propertyWithoutImages} />
      </MockAuthProvider>
    );

    // Проверяем, что отображается заглушка вместо изображения
    expect(getByTestId('property-placeholder-image')).toBeTruthy();
  });

  it('displays favorite icon with correct state', () => {
    // Тестируем объект, который добавлен в избранное
    const favoriteProperty = {
      ...mockProperty,
      isFavorite: true
    };

    const { getByTestId, rerender } = render(
      <MockAuthProvider>
        <PropertyCard property={favoriteProperty} />
      </MockAuthProvider>
    );

    // Проверяем, что иконка избранного отображается как активная
    expect(getByTestId('favorite-icon-filled')).toBeTruthy();

    // Перерендериваем с объектом, который не в избранном
    rerender(
      <MockAuthProvider>
        <PropertyCard property={mockProperty} />
      </MockAuthProvider>
    );

    // Проверяем, что иконка избранного отображается как неактивная
    expect(getByTestId('favorite-icon-outline')).toBeTruthy();
  });
}); 
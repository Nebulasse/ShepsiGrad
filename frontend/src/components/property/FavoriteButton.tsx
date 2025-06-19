import React, { useState, useEffect } from 'react';
import { favoriteService } from '../../services/favoriteService';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config';
import './FavoriteButton.css';

interface FavoriteButtonProps {
  propertyId: string;
  className?: string;
  onFavoriteChange?: (isFavorite: boolean) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  propertyId, 
  className = '', 
  onFavoriteChange 
}) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Загружаем начальный статус избранного
  useEffect(() => {
    let isMounted = true;
    
    const loadFavoriteStatus = async () => {
      try {
        const status = await favoriteService.checkIsFavorite(propertyId);
        if (isMounted) {
          console.log(`Начальный статус избранного для ${propertyId}: ${status}`);
          setIsFavorite(status);
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса избранного:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFavoriteStatus();
    
    // Очистка при размонтировании
    return () => {
      isMounted = false;
    };
  }, [propertyId]);

  // Обработчик нажатия на кнопку
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Проверяем авторизацию
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(ROUTES.AUTH);
      return;
    }

    // Если загрузка еще идет, не реагируем на клик
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      const newStatus = !isFavorite;
      console.log(`Меняем статус избранного: ${isFavorite} -> ${newStatus}`);
      
      if (isFavorite) {
        // Если был в избранном - удаляем
        await favoriteService.removeFromFavorites(propertyId);
        console.log(`Объект ${propertyId} удален из избранного`);
      } else {
        // Если не был в избранном - добавляем
        await favoriteService.addToFavorites(propertyId);
        console.log(`Объект ${propertyId} добавлен в избранное`);
      }
      
      // Обновляем локальное состояние
      setIsFavorite(newStatus);
      
      // Оповещаем родительский компонент
      if (onFavoriteChange) {
        console.log(`Вызываем callback с новым статусом: ${newStatus}`);
        onFavoriteChange(newStatus);
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса избранного:', error);
      alert('Произошла ошибка при изменении статуса избранного');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`favorite-button ${isFavorite ? 'favorite-active' : ''} ${className}`}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
      title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
      type="button"
    >
      {isLoading ? (
        <span className="loading-indicator">
          <svg className="spinner" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </span>
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )}
    </button>
  );
};

export default FavoriteButton; 
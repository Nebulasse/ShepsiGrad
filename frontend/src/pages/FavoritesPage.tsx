import React, { useState, useEffect, useCallback } from 'react';
import { favoriteService, PaginatedFavorites, Favorite } from '../services/favoriteService';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../config';
import FavoriteButton from '../components/property/FavoriteButton';
import './FavoritesPage.css';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Загрузка списка избранных объектов
  const loadFavorites = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Загружаем избранные объекты, страница ${page}`);
      const response = await favoriteService.getFavorites(page, pagination.limit);
      console.log(`Получено избранных объектов: ${response.data.length}`);
      setFavorites(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Ошибка при загрузке избранных объектов:', err);
      setError(err?.response?.data?.error || 'Не удалось загрузить избранные объекты');
      
      // Если ошибка авторизации, перенаправляем на страницу входа
      if (err?.response?.status === 401) {
        navigate(ROUTES.AUTH);
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, pagination.limit]);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(ROUTES.AUTH);
      return;
    }

    loadFavorites(1);
  }, [loadFavorites, navigate]);

  // Обработчик изменения страницы пагинации
  const handlePageChange = (newPage: number) => {
    loadFavorites(newPage);
  };

  // Обработчик удаления из избранного
  const handleFavoriteChange = useCallback((propertyId: string, isFavorite: boolean) => {
    console.log(`Обработка изменения избранного: ${propertyId}, статус: ${isFavorite}`);
    
    if (!isFavorite) {
      console.log(`Удаляем объект ${propertyId} из локального списка избранного`);
      // Если объект был удален из избранного, обновляем список и общее количество
      setFavorites(prevFavorites => {
        const newFavorites = prevFavorites.filter(fav => fav.property._id !== propertyId);
        console.log(`Осталось избранных объектов: ${newFavorites.length}`);
        return newFavorites;
      });
      
      setPagination(prev => {
        const newTotal = Math.max(0, prev.total - 1);
        const newPages = Math.ceil(newTotal / prev.limit) || 1;
        console.log(`Обновляем пагинацию: total=${newTotal}, pages=${newPages}`);
        return {
          ...prev,
          total: newTotal,
          pages: newPages
        };
      });
      
      // Если это был последний элемент на текущей странице и есть предыдущая страница, 
      // переходим на предыдущую страницу
      setTimeout(() => {
        if (favorites.length === 1 && pagination.page > 1) {
          console.log(`Последний элемент на странице удален, переходим на предыдущую страницу ${pagination.page - 1}`);
          loadFavorites(pagination.page - 1);
        }
      }, 0);
    }
  }, [favorites.length, loadFavorites, pagination.limit, pagination.page]);

  // Генерация кнопок пагинации
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= pagination.pages; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${pagination.page === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
          disabled={pagination.page === i}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="favorites-page">
      <h1 className="page-title">Избранные объекты</h1>

      {isLoading && favorites.length === 0 ? (
        <div className="loading-spinner">Загрузка...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет избранных объектов недвижимости</p>
          <Link to={ROUTES.PROPERTIES} className="button primary">
            Найти объекты
          </Link>
        </div>
      ) : (
        <>
          <div className="property-grid">
            {favorites.map(favorite => (
              <div key={favorite._id} className="property-card">
                <div className="property-image">
                  <img 
                    src={favorite.property.images?.[0] || '/images/placeholder.jpg'} 
                    alt={favorite.property.title} 
                  />
                  <FavoriteButton 
                    propertyId={favorite.property._id} 
                    className="favorite-icon" 
                    onFavoriteChange={(isFav) => handleFavoriteChange(favorite.property._id, isFav)}
                  />
                </div>
                <Link to={`/properties/${favorite.property._id}`} className="property-link">
                  <div className="property-details">
                    <h3 className="property-title">{favorite.property.title}</h3>
                    <p className="property-address">{favorite.property.address}</p>
                    <p className="property-price">
                      {favorite.property.price.toLocaleString()} ₽
                      {favorite.property.priceType === 'monthly' ? ' / месяц' : ' / день'}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button prev"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                &laquo; Назад
              </button>
              
              {renderPagination()}
              
              <button
                className="pagination-button next"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Вперед &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesPage; 
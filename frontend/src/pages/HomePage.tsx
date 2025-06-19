import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/property/PropertyCard';
import { ROUTES } from '../config';
import './HomePage.css';
import FavoriteButton from '../components/property/FavoriteButton';

const HomePage: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [newProperties, setNewProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // Получаем рекомендуемые объекты (например, с высоким рейтингом)
        const featuredResponse = await propertyService.getProperties({ 
          featured: true,
          limit: 10 
        });
        setFeaturedProperties(featuredResponse.properties || []);
        
        // Получаем новые объекты
        const newResponse = await propertyService.getProperties({ 
          sort: 'createdAt',
          order: 'desc',
          limit: 10 
        });
        setNewProperties(newResponse.properties || []);
      } catch (error) {
        console.error('Ошибка при загрузке объектов:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`${ROUTES.PROPERTIES}?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="home-page">
      {/* Заголовок с приветствием и профилем */}
      <div className="home-header">
        <div className="welcome-text">
          <h1>Привет, {user?.full_name || 'Гость'}!</h1>
          <p>Найдите идеальное жилье в Шепси</p>
        </div>
        <Link to={user ? '/profile' : '/auth'} className="profile-icon">
          {user ? (
            <div className="avatar">{user.full_name?.charAt(0) || 'У'}</div>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          )}
        </Link>
      </div>

      {/* Поисковая строка */}
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-bar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Куда вы хотите поехать?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>
      </div>

      {/* Категории */}
      <div className="categories-section">
        <div className="section-header-with-link">
          <h2>Категории</h2>
          <Link to={ROUTES.PROPERTIES} className="see-all-link">Все</Link>
        </div>
        
        <div className="categories-row">
          <Link to={`${ROUTES.PROPERTIES}?type=apartment`} className="category-item">
            <div className="category-icon apartment-icon"></div>
            <span>Квартиры</span>
          </Link>
          <Link to={`${ROUTES.PROPERTIES}?type=house`} className="category-item">
            <div className="category-icon house-icon"></div>
            <span>Дома</span>
          </Link>
          <Link to={`${ROUTES.PROPERTIES}?type=villa`} className="category-item">
            <div className="category-icon villa-icon"></div>
            <span>Виллы</span>
          </Link>
          <Link to={`${ROUTES.PROPERTIES}?type=hotel`} className="category-item">
            <div className="category-icon hotel-icon"></div>
            <span>Отели</span>
          </Link>
        </div>
      </div>
      
      {/* Рекомендуемые объекты */}
      <div className="recommended-section">
        <div className="section-header-with-link">
          <h2>Рекомендуемые</h2>
          <Link to={ROUTES.PROPERTIES} className="see-all-link">Все</Link>
        </div>
        
        {loading ? (
          <div className="loading-spinner">Загрузка...</div>
        ) : (
          <div className="properties-scroll">
            {featuredProperties.map(property => (
              <div key={property._id} className="property-card-mobile">
                <Link to={`/properties/${property._id}`}>
                  <div className="property-image-container">
                    <img src={property.images?.[0] || '/images/placeholder.jpg'} alt={property.title} className="property-image" />
                    <div className="property-type">{property.type === 'apartment' ? 'Апартаменты' : property.type === 'house' ? 'Дом' : property.type}</div>
                    <div className="property-rating-mobile">★ {property.rating || '4.8'}</div>
                    <FavoriteButton 
                      propertyId={property._id} 
                      className="property-favorite-mobile"
                    />
                  </div>
                  <div className="property-info">
                    <h3 className="property-title">{property.title}</h3>
                    <p className="property-location">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="location-icon">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {property.address}
                    </p>
                    <p className="property-price">{property.price} ₽/день</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Популярные объекты (вместо новых объектов) */}
      <div className="popular-section">
        <div className="section-header-with-link">
          <h2>Популярные</h2>
          <Link to={`${ROUTES.PROPERTIES}?sort=popularity&order=desc`} className="see-all-link">Все</Link>
        </div>
        
        {loading ? (
          <div className="loading-spinner">Загрузка...</div>
        ) : (
          <div className="properties-scroll">
            {newProperties.map(property => (
              <div key={property._id} className="property-card-mobile">
                <Link to={`/properties/${property._id}`}>
                  <div className="property-image-container">
                    <img src={property.images?.[0] || '/images/placeholder.jpg'} alt={property.title} className="property-image" />
                    <div className="property-type">{property.type === 'apartment' ? 'Апартаменты' : property.type === 'house' ? 'Дом' : property.type}</div>
                    <div className="property-rating-mobile">★ {property.rating || '4.8'}</div>
                    <FavoriteButton 
                      propertyId={property._id} 
                      className="property-favorite-mobile"
                    />
                  </div>
                  <div className="property-info">
                    <h3 className="property-title">{property.title}</h3>
                    <p className="property-location">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="location-icon">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {property.address}
                    </p>
                    <p className="property-price">{property.price} ₽/день</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 
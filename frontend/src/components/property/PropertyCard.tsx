import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import chatService from '../../services/chatService';
import FavoriteButton from './FavoriteButton';
import './PropertyCard.css';

interface PropertyCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  ownerId: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  description,
  price,
  address,
  image,
  bedrooms,
  bathrooms,
  area,
  ownerId
}) => {
  const navigate = useNavigate();
  const [isChatStarting, setIsChatStarting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  // Получаем текущего пользователя (в реальном приложении это будет из context/redux)
  const currentUserId = localStorage.getItem('userId') || 'demo-user-id';

  const handleStartChat = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!ownerId) return;
    
    try {
      setIsChatStarting(true);
      setChatError(null);
      
      // Создаем новый чат или находим существующий
      const chat = await chatService.createChat([currentUserId, ownerId]);
      
      // Перенаправляем на страницу чата
      navigate(`/chats/${chat.id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      setChatError('Не удалось начать чат');
    } finally {
      setIsChatStarting(false);
    }
  };

  const navigateToDetails = () => {
    navigate(`/properties/${id}`);
  };

  return (
    <div className="property-card" onClick={navigateToDetails}>
      <div className="property-image-container">
        <img 
          src={image || 'https://via.placeholder.com/300x200?text=Нет+фото'} 
          alt={title} 
          className="property-image" 
        />
        <FavoriteButton 
          propertyId={id}
          className="property-favorite-button"
        />
        <div className="property-price">{price.toLocaleString()} ₽/сутки</div>
      </div>
      
      <div className="property-content">
        <h3 className="property-title">{title}</h3>
        <p className="property-address">{address}</p>
        
        <div className="property-features">
          <span className="feature"><i className="icon-bed"></i> {bedrooms} комн.</span>
          <span className="feature"><i className="icon-bath"></i> {bathrooms} ванн.</span>
          <span className="feature"><i className="icon-area"></i> {area} м²</span>
        </div>
        
        <p className="property-description">
          {description.length > 100 
            ? `${description.substring(0, 100)}...` 
            : description
          }
        </p>
        
        <div className="property-actions">
          <Link to={`/properties/${id}`} className="details-button">
            Подробнее
          </Link>
          
          {ownerId !== currentUserId && (
            <button 
              className="chat-button" 
              onClick={handleStartChat}
              disabled={isChatStarting}
            >
              {isChatStarting ? 'Открытие...' : 'Написать'}
            </button>
          )}
        </div>
        
        {chatError && <div className="chat-error">{chatError}</div>}
      </div>
    </div>
  );
};

export default PropertyCard; 
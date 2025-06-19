import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { PropertyDetails } from '../components/property/PropertyDetails';
import { usePropertyDetails } from '../hooks/usePropertyDetails';
import PropertyMap from '../components/property/PropertyMap';
import chatService from '../services/chatService';
import FavoriteButton from '../components/property/FavoriteButton';
import './PropertyDetailsPage.css';

export const PropertyDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { property, loading, error } = usePropertyDetails(id || '');
    const [isChatStarting, setIsChatStarting] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const [chatId, setChatId] = useState<string | null>(null);

    // Получаем текущего пользователя (в реальном приложении это будет из context/redux)
    const currentUserId = localStorage.getItem('userId') || 'demo-user-id';

    const handleStartChat = async () => {
        if (!property || !property.ownerId) return;
        
        try {
            setIsChatStarting(true);
            setChatError(null);
            
            // Создаем новый чат или находим существующий
            const chat = await chatService.createChat([currentUserId, property.ownerId]);
            setChatId(chat.id);
            
            // Перенаправляем на страницу чата
            window.location.href = `/chats/${chat.id}`;
        } catch (err) {
            console.error('Error starting chat:', err);
            setChatError('Не удалось начать чат. Пожалуйста, попробуйте позже.');
        } finally {
            setIsChatStarting(false);
        }
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error" sx={{ my: 4 }}>
                    {error}
                </Typography>
            </Container>
        );
    }

    if (!property) {
        return (
            <Container>
                <Typography sx={{ my: 4 }}>
                    Объект не найден
                </Typography>
            </Container>
        );
    }

    return (
        <div className="property-details-page">
            <div className="property-header">
                <h1>{property.title}</h1>
                <div className="property-address">{property.address}</div>
                <div className="property-details-actions">
                    <div className="property-price">{property.price} ₽ / сутки</div>
                    <FavoriteButton propertyId={property._id} className="property-details-favorite" />
                </div>
            </div>
            
            <div className="property-images">
                {property.images && property.images.length > 0 ? (
                    property.images.map((image, index) => (
                        <img 
                            key={index} 
                            src={image} 
                            alt={`${property.title} - изображение ${index + 1}`} 
                            className="property-image"
                        />
                    ))
                ) : (
                    <div className="no-images">Нет доступных изображений</div>
                )}
            </div>
            
            <div className="property-info">
                <div className="property-description">
                    <h2>Описание</h2>
                    <p>{property.description}</p>
                </div>
                
                <div className="property-details">
                    <h2>Характеристики</h2>
                    <ul>
                        <li><strong>Площадь:</strong> {property.area} м²</li>
                        <li><strong>Комнаты:</strong> {property.rooms}</li>
                        <li><strong>Этаж:</strong> {property.floor}</li>
                        {property.amenities && property.amenities.length > 0 && (
                            <li>
                                <strong>Удобства:</strong>
                                <ul className="amenities-list">
                                    {property.amenities.map((amenity, index) => (
                                        <li key={index}>{amenity}</li>
                                    ))}
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            
            {property.latitude && property.longitude && (
                <div className="property-location">
                    <h2>Расположение</h2>
                    <PropertyMap 
                        latitude={property.latitude} 
                        longitude={property.longitude}
                        title={property.title}
                    />
                </div>
            )}
            
            <div className="property-contact">
                <h2>Связаться с владельцем</h2>
                {property.ownerId !== currentUserId ? (
                    <>
                        <button 
                            className="contact-button" 
                            onClick={handleStartChat}
                            disabled={isChatStarting}
                        >
                            {isChatStarting ? 'Открытие чата...' : 'Написать сообщение'}
                        </button>
                        {chatError && <div className="chat-error">{chatError}</div>}
                    </>
                ) : (
                    <div className="own-property-message">Это ваше объявление</div>
                )}
            </div>
        </div>
    );
};

export default PropertyDetailsPage; 
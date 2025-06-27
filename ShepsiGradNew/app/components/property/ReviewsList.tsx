import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_CONFIG } from '../../config';
import ReviewItem from './ReviewItem';
import WriteReviewModal from './WriteReviewModal';

// Интерфейс для отзыва
export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  reply?: {
    text: string;
    createdAt: string;
  };
}

// Интерфейс для свойств компонента
interface ReviewsListProps {
  propertyId: string;
  propertyName?: string;
  canReview?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ propertyId, propertyName, canReview = false }) => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewStats, setReviewStats] = useState({
    total: 0,
    '5': 0,
    '4': 0,
    '3': 0,
    '2': 0,
    '1': 0
  });
  
  // Загрузка отзывов
  useEffect(() => {
    fetchReviews();
  }, [propertyId]);
  
  // Загрузка отзывов с сервера
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/reviews`);
      
      if (response.data) {
        setReviews(response.data.reviews || []);
        
        // Проверяем, оставил ли пользователь отзыв
        if (user) {
          const hasReviewed = response.data.reviews.some((review: Review) => review.userId === user.id);
          setUserHasReviewed(hasReviewed);
        }
        
        // Рассчитываем среднюю оценку
        if (response.data.reviews && response.data.reviews.length > 0) {
          const total = response.data.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0);
          setAverageRating(total / response.data.reviews.length);
          
          // Рассчитываем статистику оценок
          const stats = {
            total: response.data.reviews.length,
            '5': 0,
            '4': 0,
            '3': 0,
            '2': 0,
            '1': 0
          };
          
          response.data.reviews.forEach((review: Review) => {
            stats[review.rating.toString() as keyof typeof stats]++;
          });
          
          setReviewStats(stats);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке отзывов:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить отзывы');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Обработка отправки нового отзыва
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!token) {
      Alert.alert('Ошибка', 'Необходимо авторизоваться для отправки отзыва');
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_CONFIG.baseUrl}/api/properties/${propertyId}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        // Добавляем новый отзыв в список
        const newReview: Review = {
          ...response.data,
          userName: user?.firstName || user?.lastName || 'Пользователь',
          userAvatar: user?.avatar
        };
        
        setReviews([newReview, ...reviews]);
        setUserHasReviewed(true);
        setShowWriteReview(false);
        
        // Обновляем статистику
        const newTotal = reviewStats.total + 1;
        const newRatingCount = reviewStats[rating.toString() as keyof typeof reviewStats] + 1;
        const newAverage = ((averageRating * reviewStats.total) + rating) / newTotal;
        
        setReviewStats({
          ...reviewStats,
          total: newTotal,
          [rating.toString()]: newRatingCount
        });
        
        setAverageRating(newAverage);
        
        Alert.alert('Успех', 'Ваш отзыв успешно добавлен');
      }
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      Alert.alert('Ошибка', 'Не удалось отправить отзыв');
    }
  };
  
  // Обработка ответа на отзыв
  const handleReplyToReview = async (reviewId: string, replyText: string) => {
    if (!token) {
      Alert.alert('Ошибка', 'Необходимо авторизоваться для ответа на отзыв');
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_CONFIG.baseUrl}/api/reviews/${reviewId}/reply`,
        { text: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        // Обновляем отзыв с ответом
        setReviews(
          reviews.map(review => 
            review.id === reviewId 
              ? { 
                  ...review, 
                  reply: { 
                    text: replyText, 
                    createdAt: new Date().toISOString() 
                  } 
                }
              : review
          )
        );
        
        Alert.alert('Успех', 'Ваш ответ успешно добавлен');
      }
    } catch (error) {
      console.error('Ошибка при отправке ответа на отзыв:', error);
      Alert.alert('Ошибка', 'Не удалось отправить ответ');
    }
  };
  
  // Обработка обновления отзыва
  const handleUpdateReview = async (reviewId: string, rating: number, comment: string) => {
    if (!token) {
      Alert.alert('Ошибка', 'Необходимо авторизоваться для обновления отзыва');
      return;
    }
    
    try {
      const response = await axios.put(
        `${API_CONFIG.baseUrl}/api/reviews/${reviewId}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        // Обновляем отзыв в списке
        setReviews(
          reviews.map(review => 
            review.id === reviewId 
              ? { ...review, rating, comment, updatedAt: new Date().toISOString() }
              : review
          )
        );
        
        Alert.alert('Успех', 'Ваш отзыв успешно обновлен');
      }
    } catch (error) {
      console.error('Ошибка при обновлении отзыва:', error);
      Alert.alert('Ошибка', 'Не удалось обновить отзыв');
    }
  };
  
  // Обработка удаления отзыва
  const handleDeleteReview = async (reviewId: string) => {
    if (!token) {
      Alert.alert('Ошибка', 'Необходимо авторизоваться для удаления отзыва');
      return;
    }
    
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить этот отзыв?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_CONFIG.baseUrl}/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              // Удаляем отзыв из списка
              const updatedReviews = reviews.filter(review => review.id !== reviewId);
              setReviews(updatedReviews);
              
              // Обновляем статистику
              if (updatedReviews.length > 0) {
                const total = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
                setAverageRating(total / updatedReviews.length);
              } else {
                setAverageRating(0);
              }
              
              setUserHasReviewed(false);
              
              Alert.alert('Успех', 'Отзыв успешно удален');
            } catch (error) {
              console.error('Ошибка при удалении отзыва:', error);
              Alert.alert('Ошибка', 'Не удалось удалить отзыв');
            }
          }
        }
      ]
    );
  };
  
  // Обработка обновления списка
  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };
  
  // Рендер элемента рейтинга
  const renderRatingBar = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <View style={styles.ratingBarContainer} key={`rating-${rating}`}>
        <Text style={styles.ratingBarLabel}>{rating}</Text>
        <View style={styles.ratingBarWrapper}>
          <View style={[styles.ratingBar, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </View>
    );
  };
  
  // Рендер заголовка списка
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.ratingOverview}>
          <View style={styles.averageRatingContainer}>
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(averageRating) ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFB800"
                />
              ))}
            </View>
            <Text style={styles.totalReviews}>{reviewStats.total} отзывов</Text>
          </View>
          
          <View style={styles.ratingBarsContainer}>
            {[5, 4, 3, 2, 1].map(rating => (
              renderRatingBar(
                rating,
                reviewStats[rating.toString() as keyof typeof reviewStats],
                reviewStats.total
              )
            ))}
          </View>
        </View>
        
        {canReview && !userHasReviewed && user && (
          <TouchableOpacity
            style={styles.writeReviewButton}
            onPress={() => setShowWriteReview(true)}
          >
            <Text style={styles.writeReviewButtonText}>Написать отзыв</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  // Рендер пустого списка
  const renderEmptyList = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-outline" size={48} color="#CCC" />
        <Text style={styles.emptyText}>Пока нет отзывов</Text>
        {canReview && user && (
          <TouchableOpacity
            style={styles.writeReviewButton}
            onPress={() => setShowWriteReview(true)}
          >
            <Text style={styles.writeReviewButtonText}>Написать первый отзыв</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D8EFF" />
        <Text style={styles.loadingText}>Загрузка отзывов...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        renderItem={({ item }) => (
          <ReviewItem
            review={item}
            onReply={handleReplyToReview}
            onUpdate={handleUpdateReview}
            onDelete={handleDeleteReview}
            isOwner={user?.id === item.userId}
            isPropertyOwner={false} // Заменить на проверку, является ли пользователь владельцем объекта
          />
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
      />
      
      <WriteReviewModal
        visible={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        onSubmit={handleSubmitReview}
        propertyName={propertyName || 'этот объект'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
  },
  ratingOverview: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  totalReviews: {
    fontSize: 12,
    color: '#666',
  },
  ratingBarsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  ratingBarLabel: {
    fontSize: 12,
    color: '#666',
    width: 20,
  },
  ratingBarWrapper: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 3,
  },
  ratingBarCount: {
    fontSize: 12,
    color: '#666',
    width: 20,
    textAlign: 'right',
  },
  writeReviewButton: {
    backgroundColor: '#4D8EFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  writeReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
});

export default ReviewsList; 
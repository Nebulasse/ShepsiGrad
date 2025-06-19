import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review, RatingStats } from '../../types/Review';
import reviewService from '../../services/reviewService';
import ReviewItem from './ReviewItem';

interface ReviewsListProps {
  propertyId: string;
  onWriteReview?: () => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ propertyId, onWriteReview }) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats>({
    average: 0,
    count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    const fetchReviewsData = async () => {
      try {
        setLoading(true);
        const [reviewsData, statsData] = await Promise.all([
          reviewService.getPropertyReviews(propertyId),
          reviewService.getPropertyRatingStats(propertyId)
        ]);
        
        setReviews(reviewsData);
        setRatingStats(statsData);
      } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewsData();
  }, [propertyId]);

  // Расчет процента для прогресс-бара распределения рейтингов
  const getPercentage = (count: number) => {
    if (ratingStats.count === 0) return 0;
    return (count / ratingStats.count) * 100;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0075FF" />
        <Text style={styles.loadingText}>Загрузка отзывов...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Отзывы</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingValue}>{ratingStats.average.toFixed(1)}</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={16}
                color={star <= Math.round(ratingStats.average) ? '#FFC107' : '#E0E0E0'}
                style={styles.starIcon}
              />
            ))}
            <Text style={styles.reviewCount}>({ratingStats.count})</Text>
          </View>
        </View>
      </View>

      {ratingStats.count > 0 && (
        <View style={styles.ratingDistribution}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <View key={rating} style={styles.ratingRow}>
              <Text style={styles.ratingLabel}>{rating}</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${getPercentage(ratingStats.distribution[rating as keyof typeof ratingStats.distribution])}%` }
                  ]} 
                />
              </View>
              <Text style={styles.ratingCount}>
                {ratingStats.distribution[rating as keyof typeof ratingStats.distribution]}
              </Text>
            </View>
          ))}
        </View>
      )}

      {onWriteReview && (
        <TouchableOpacity style={styles.writeReviewButton} onPress={onWriteReview}>
          <Ionicons name="create-outline" size={18} color="#FFF" style={styles.writeReviewIcon} />
          <Text style={styles.writeReviewText}>Написать отзыв</Text>
        </TouchableOpacity>
      )}

      {reviews.length > 0 ? (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReviewItem review={item} />}
          contentContainerStyle={styles.reviewsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Нет отзывов</Text>
          <Text style={styles.emptySubtext}>Будьте первым, кто оставит отзыв об этом объекте</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginHorizontal: 1,
  },
  reviewCount: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  ratingDistribution: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingLabel: {
    width: 20,
    fontSize: 14,
    textAlign: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFC107',
  },
  ratingCount: {
    width: 30,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0075FF',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  writeReviewIcon: {
    marginRight: 8,
  },
  writeReviewText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  reviewsList: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ReviewsList; 
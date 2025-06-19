import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../types/Review';

interface ReviewItemProps {
  review: Review;
  onReply?: (review: Review) => void;
  isOwner?: boolean;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, onReply, isOwner = false }) => {
  // Форматирование даты
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {review.userAvatar ? (
            <Image source={{ uri: review.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{review.userName.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.userMeta}>
            <Text style={styles.userName}>{review.userName}</Text>
            <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name="star"
              size={14}
              color={star <= review.rating ? '#FFC107' : '#E0E0E0'}
              style={styles.starIcon}
            />
          ))}
        </View>
      </View>

      <Text style={styles.reviewContent}>{review.content}</Text>

      {review.photos && review.photos.length > 0 && (
        <FlatList
          data={review.photos}
          keyExtractor={(item, index) => `photo-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity>
              <Image source={{ uri: item }} style={styles.reviewPhoto} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.photosContainer}
        />
      )}

      {review.isVerifiedStay && (
        <View style={styles.verifiedStayContainer}>
          <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
          <Text style={styles.verifiedStayText}>Проверенное проживание</Text>
        </View>
      )}

      {review.replyContent && (
        <View style={styles.replyContainer}>
          <View style={styles.replyHeader}>
            <View style={styles.replyUserInfo}>
              <Ionicons name="person" size={16} color="#0075FF" />
              <Text style={styles.replyUserName}>Владелец</Text>
            </View>
            <Text style={styles.replyDate}>
              {review.replyDate ? formatDate(review.replyDate) : ''}
            </Text>
          </View>
          <Text style={styles.replyContent}>{review.replyContent}</Text>
        </View>
      )}

      {isOwner && !review.replyContent && onReply && (
        <TouchableOpacity style={styles.replyButton} onPress={() => onReply(review)}>
          <Ionicons name="chatbubble-outline" size={16} color="#0075FF" />
          <Text style={styles.replyButtonText}>Ответить</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0075FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginHorizontal: 1,
  },
  reviewContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  photosContainer: {
    marginBottom: 12,
  },
  reviewPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  verifiedStayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verifiedStayText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  replyContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyUserName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0075FF',
    marginLeft: 4,
  },
  replyDate: {
    fontSize: 12,
    color: '#666',
  },
  replyContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  replyButtonText: {
    fontSize: 14,
    color: '#0075FF',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: 8,
  },
});

export default ReviewItem; 
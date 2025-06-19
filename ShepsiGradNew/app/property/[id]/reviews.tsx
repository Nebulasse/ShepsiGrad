import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Text,
  ActivityIndicator 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ReviewsList from '../../components/property/ReviewsList';
import WriteReviewModal from '../../components/property/WriteReviewModal';
import ReplyReviewModal from '../../components/property/ReplyReviewModal';
import { Review } from '../../types/Review';
import reviewService from '../../services/reviewService';

export default function PropertyReviews() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isWriteReviewModalVisible, setIsWriteReviewModalVisible] = useState(false);
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isOwner, setIsOwner] = useState(false); // В реальном приложении проверка владельца

  // Проверка, является ли текущий пользователь владельцем объекта
  useEffect(() => {
    // В реальном приложении здесь будет API запрос
    // Имитация проверки владельца
    const checkIsOwner = async () => {
      // Временно для демонстрации: 50% шанс быть владельцем
      setIsOwner(Math.random() > 0.5);
    };
    
    checkIsOwner();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleWriteReview = () => {
    setIsWriteReviewModalVisible(true);
  };

  const handleReplyToReview = (review: Review) => {
    setSelectedReview(review);
    setIsReplyModalVisible(true);
  };

  const handleReviewSuccess = () => {
    // В реальном приложении здесь будет обновление списка отзывов
    console.log('Отзыв успешно отправлен');
  };

  const handleReplySuccess = () => {
    // В реальном приложении здесь будет обновление списка отзывов
    console.log('Ответ успешно отправлен');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Отзывы',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleWriteReview} style={styles.writeButton}>
              <Ionicons name="create-outline" size={22} color="#0075FF" />
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.content}>
        <ReviewsList 
          propertyId={id as string} 
          onWriteReview={handleWriteReview}
        />
      </View>

      {/* Модальное окно для написания отзыва */}
      <WriteReviewModal
        visible={isWriteReviewModalVisible}
        onClose={() => setIsWriteReviewModalVisible(false)}
        onSuccess={handleReviewSuccess}
        propertyId={id as string}
        userId="current-user-id" // В реальном приложении ID текущего пользователя
        userName="Гость" // В реальном приложении имя текущего пользователя
      />

      {/* Модальное окно для ответа на отзыв */}
      <ReplyReviewModal
        visible={isReplyModalVisible}
        onClose={() => setIsReplyModalVisible(false)}
        onSuccess={handleReplySuccess}
        review={selectedReview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  writeButton: {
    padding: 8,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
}); 
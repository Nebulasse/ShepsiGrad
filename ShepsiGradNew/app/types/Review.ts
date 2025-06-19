// Интерфейс для отзыва
export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  content: string;
  date: string;
  replyContent?: string;
  replyDate?: string;
  photos?: string[];
  isVerifiedStay: boolean;
}

// Интерфейс для обобщенной статистики рейтингов
export interface RatingStats {
  average: number;
  count: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// Default экспорт для избежания предупреждений expo-router
export default Review; 
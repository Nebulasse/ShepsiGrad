import { Review, RatingStats } from '../types/Review';
import { apiClient } from './api';

// Временные тестовые данные отзывов
const REVIEWS: Review[] = [
  {
    id: '1',
    propertyId: '1',
    userId: 'user1',
    userName: 'Анна С.',
    userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    rating: 5,
    content: 'Отличное место! Прекрасный вид на море, чистые и уютные комнаты. Все было именно так, как на фотографиях. Хозяин очень отзывчивый и помог со всеми вопросами. Обязательно вернемся сюда снова.',
    date: '2023-07-15',
    isVerifiedStay: true
  },
  {
    id: '2',
    propertyId: '1',
    userId: 'user2',
    userName: 'Максим П.',
    rating: 4,
    content: 'Очень хорошие апартаменты, но есть несколько замечаний. Кондиционер работал не очень хорошо, а в ванной была небольшая проблема с горячей водой. В целом, все понравилось, особенно расположение и вид с балкона.',
    date: '2023-06-20',
    replyContent: 'Спасибо за отзыв! Мы исправили проблемы с кондиционером и водой. Будем рады видеть вас снова!',
    replyDate: '2023-06-21',
    isVerifiedStay: true
  },
  {
    id: '3',
    propertyId: '1',
    userId: 'user3',
    userName: 'Елена К.',
    userAvatar: 'https://randomuser.me/api/portraits/women/42.jpg',
    rating: 5,
    content: 'Идеальное место для отдыха с семьей. Квартира очень чистая и имеет все необходимое. Пляж в 5 минутах ходьбы. Рядом много магазинов и кафе. Хозяин встретил нас, все показал и рассказал.',
    date: '2023-05-30',
    photos: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=400&auto=format&fit=crop'
    ],
    isVerifiedStay: true
  },
  {
    id: '4',
    propertyId: '2',
    userId: 'user4',
    userName: 'Алексей Д.',
    rating: 3,
    content: 'Квартира соответствует описанию, но было несколько разочарований. Шумные соседи, плохая звукоизоляция. Расположение хорошее, близко к центру.',
    date: '2023-07-05',
    isVerifiedStay: true
  },
  {
    id: '5',
    propertyId: '2',
    userId: 'user5',
    userName: 'Ольга В.',
    userAvatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    rating: 4,
    content: 'Хорошая квартира в центре города. Все рядом - магазины, рестораны, пляж. Немного шумно по вечерам из-за близости к центру, но это было ожидаемо.',
    date: '2023-06-10',
    isVerifiedStay: true
  },
  {
    id: '6',
    propertyId: '3',
    userId: 'user6',
    userName: 'Дмитрий С.',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    content: 'Потрясающий коттедж! Бассейн чистый, территория ухоженная. Идеальное место для отдыха с друзьями. Барбекю-зона - отдельный плюс. Всем рекомендую!',
    date: '2023-07-20',
    photos: [
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=400&auto=format&fit=crop'
    ],
    isVerifiedStay: true
  },
  {
    id: '7',
    propertyId: '3',
    userId: 'user7',
    userName: 'Ирина М.',
    rating: 4,
    content: 'Очень понравился коттедж, особенно бассейн. Единственный минус - далековато от пляжа, нужна машина. В остальном все супер!',
    date: '2023-05-15',
    replyContent: 'Спасибо за ваш отзыв! Да, для удобства гостей рекомендуем арендовать машину или пользоваться такси.',
    replyDate: '2023-05-16',
    isVerifiedStay: true
  }
];

// Сервис для работы с отзывами
const reviewService = {
  // Получить все отзывы для объекта недвижимости
  getPropertyReviews: async (propertyId: string): Promise<Review[]> => {
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.get(`/reviews/property/${propertyId}`);
      // return response.data;
      
      // Имитация запроса с задержкой
      return new Promise((resolve) => {
        setTimeout(() => {
          const filteredReviews = REVIEWS.filter(review => review.propertyId === propertyId);
          resolve(filteredReviews);
        }, 500);
      });
    } catch (error) {
      console.error('Ошибка при получении отзывов:', error);
      throw error;
    }
  },
  
  // Получить статистику рейтингов для объекта
  getPropertyRatingStats: async (propertyId: string): Promise<RatingStats> => {
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.get(`/reviews/property/${propertyId}/stats`);
      // return response.data;
      
      // Имитация запроса с задержкой
      return new Promise((resolve) => {
        setTimeout(() => {
          const filteredReviews = REVIEWS.filter(review => review.propertyId === propertyId);
          
          // Если нет отзывов, возвращаем пустую статистику
          if (filteredReviews.length === 0) {
            resolve({
              average: 0,
              count: 0,
              distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            });
            return;
          }
          
          // Рассчитываем среднюю оценку
          const sum = filteredReviews.reduce((acc, review) => acc + review.rating, 0);
          const average = sum / filteredReviews.length;
          
          // Рассчитываем распределение оценок
          const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          filteredReviews.forEach(review => {
            distribution[review.rating as keyof typeof distribution]++;
          });
          
          resolve({
            average,
            count: filteredReviews.length,
            distribution
          });
        }, 500);
      });
    } catch (error) {
      console.error('Ошибка при получении статистики рейтингов:', error);
      throw error;
    }
  },
  
  // Добавить новый отзыв
  addReview: async (review: Omit<Review, 'id' | 'date'>): Promise<Review> => {
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.post('/reviews', review);
      // return response.data;
      
      // Имитация запроса с задержкой
      return new Promise((resolve) => {
        setTimeout(() => {
          const newReview: Review = {
            ...review,
            id: `${REVIEWS.length + 1}`,
            date: new Date().toISOString().split('T')[0]
          };
          
          // В реальном приложении здесь будет сохранение в базу данных
          REVIEWS.push(newReview);
          
          resolve(newReview);
        }, 800);
      });
    } catch (error) {
      console.error('Ошибка при добавлении отзыва:', error);
      throw error;
    }
  },
  
  // Добавить ответ на отзыв
  addReplyToReview: async (reviewId: string, reply: string): Promise<Review> => {
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.post(`/reviews/${reviewId}/reply`, { content: reply });
      // return response.data;
      
      // Имитация запроса с задержкой
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const reviewIndex = REVIEWS.findIndex(r => r.id === reviewId);
          
          if (reviewIndex === -1) {
            reject(new Error('Отзыв не найден'));
            return;
          }
          
          const updatedReview = {
            ...REVIEWS[reviewIndex],
            replyContent: reply,
            replyDate: new Date().toISOString().split('T')[0]
          };
          
          // В реальном приложении здесь будет обновление в базе данных
          REVIEWS[reviewIndex] = updatedReview;
          
          resolve(updatedReview);
        }, 800);
      });
    } catch (error) {
      console.error('Ошибка при добавлении ответа на отзыв:', error);
      throw error;
    }
  }
};

export default reviewService; 
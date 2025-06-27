import api from './api';

export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  bookingId: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

export interface ReviewFilters {
  status?: string;
  propertyId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  page?: number;
  limit?: number;
}

const reviewService = {
  // Получить все отзывы с фильтрами и пагинацией
  getAllReviews: async (filters: ReviewFilters = {}) => {
    const response = await api.get('/admin/reviews', { params: filters });
    return response.data;
  },

  // Получить отзыв по ID
  getReviewById: async (id: string) => {
    const response = await api.get(`/admin/reviews/${id}`);
    return response.data;
  },

  // Одобрить отзыв
  approveReview: async (id: string) => {
    const response = await api.put(`/admin/reviews/${id}/approve`);
    return response.data;
  },

  // Отклонить отзыв
  rejectReview: async (id: string, reason: string) => {
    const response = await api.put(`/admin/reviews/${id}/reject`, { reason });
    return response.data;
  },

  // Ответить на отзыв от имени администратора
  replyToReview: async (id: string, reply: string) => {
    const response = await api.post(`/admin/reviews/${id}/reply`, { reply });
    return response.data;
  },

  // Получить статистику по отзывам
  getReviewStats: async () => {
    const response = await api.get('/admin/reviews/stats');
    return response.data;
  }
};

export default reviewService; 
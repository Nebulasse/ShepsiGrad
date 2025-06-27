import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'landlord' | 'admin';
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const userService = {
  // Получить всех пользователей с фильтрами и пагинацией
  getAllUsers: async (filters: UserFilters = {}) => {
    const response = await api.get('/admin/users', { params: filters });
    return response.data;
  },

  // Получить пользователя по ID
  getUserById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Заблокировать пользователя
  blockUser: async (id: string, reason: string) => {
    const response = await api.put(`/admin/users/${id}/block`, { reason });
    return response.data;
  },

  // Разблокировать пользователя
  unblockUser: async (id: string) => {
    const response = await api.put(`/admin/users/${id}/unblock`);
    return response.data;
  },

  // Изменить роль пользователя
  changeUserRole: async (id: string, role: string) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Получить бронирования пользователя
  getUserBookings: async (id: string) => {
    const response = await api.get(`/admin/users/${id}/bookings`);
    return response.data;
  },

  // Получить объекты недвижимости пользователя
  getUserProperties: async (id: string) => {
    const response = await api.get(`/admin/users/${id}/properties`);
    return response.data;
  },

  // Получить статистику по пользователям
  getUserStats: async () => {
    const response = await api.get('/admin/users/stats');
    return response.data;
  }
};

export default userService; 
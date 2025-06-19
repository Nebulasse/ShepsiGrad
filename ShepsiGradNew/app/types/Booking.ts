// Интерфейс для объекта бронирования
export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  comments?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  cancellationReason?: string;
}

// Статусы бронирования
export type BookingStatus = 
  | 'pending'     // Ожидает подтверждения хозяином
  | 'confirmed'   // Подтверждено хозяином
  | 'completed'   // Завершено (гость уже выехал)
  | 'cancelled'   // Отменено
  | 'rejected';   // Отклонено хозяином

// Статусы оплаты
export type PaymentStatus = 
  | 'not_paid'      // Не оплачено
  | 'partial'       // Частичная оплата (предоплата)
  | 'paid'          // Полностью оплачено
  | 'refunded'      // Возвращено
  | 'failed';       // Ошибка оплаты

// Методы оплаты
export type PaymentMethod = 
  | 'card'        // Банковская карта
  | 'cash'        // Наличные
  | 'transfer'    // Банковский перевод
  | 'online';     // Онлайн-платеж через платежную систему

// Интерфейс для создания нового бронирования
export interface BookingCreateData {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  comments?: string;
}

// Интерфейс для обновления статуса бронирования
export interface BookingStatusUpdate {
  bookingId: string;
  status: BookingStatus;
  reason?: string;
}

// Интерфейс для параметров фильтрации списка бронирований
export interface BookingFilterParams {
  status?: BookingStatus | BookingStatus[];
  startDate?: string;
  endDate?: string;
  propertyId?: string;
  onlyUpcoming?: boolean;
}

// Default экспорт для избежания предупреждений expo-router
export default Booking; 
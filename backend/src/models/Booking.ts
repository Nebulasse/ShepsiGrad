import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/connection';

interface BookingData {
  id?: string;
  user_id: string;
  property_id: string;
  check_in_date: Date | string;
  check_out_date: Date | string;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  payment_id?: string;
  payment_status?: string;
  created_at?: Date;
  confirmed_at?: Date;
  cancelled_at?: Date;
  completed_at?: Date;
  refunded_at?: Date;
}

export class Booking {
  /**
   * Создание нового бронирования
   * @param bookingData Данные бронирования
   * @returns Созданное бронирование
   */
  static async create(bookingData: BookingData): Promise<BookingData> {
    const id = bookingData.id || uuidv4();
    const created_at = bookingData.created_at || new Date();

    const query = `
      INSERT INTO bookings (
        id, user_id, property_id, check_in_date, check_out_date, 
        guests, total_price, status, payment_id, payment_status, 
        created_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      id,
      bookingData.user_id,
      bookingData.property_id,
      bookingData.check_in_date,
      bookingData.check_out_date,
      bookingData.guests,
      bookingData.total_price,
      bookingData.status,
      bookingData.payment_id || null,
      bookingData.payment_status || null,
      created_at,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Поиск бронирования по ID
   * @param id ID бронирования
   * @returns Найденное бронирование или null
   */
  static async findById(id: string): Promise<BookingData | null> {
    const query = `
      SELECT b.*, p.title as property_title, p.price as property_price
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      WHERE b.id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Поиск бронирований пользователя
   * @param userId ID пользователя
   * @returns Список бронирований пользователя
   */
  static async findByUserId(userId: string): Promise<BookingData[]> {
    const query = `
      SELECT b.*, p.title as property_title, p.price as property_price
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
  }

  /**
   * Поиск бронирований для объекта недвижимости
   * @param propertyId ID объекта недвижимости
   * @returns Список бронирований объекта
   */
  static async findByPropertyId(propertyId: string): Promise<BookingData[]> {
    const query = `
      SELECT b.*, u.first_name, u.last_name, u.email
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.property_id = $1
      ORDER BY b.created_at DESC
    `;

    const result = await db.query(query, [propertyId]);
    return result.rows;
  }

  /**
   * Обновление бронирования
   * @param id ID бронирования
   * @param updateData Данные для обновления
   * @returns Обновленное бронирование
   */
  static async update(id: string, updateData: Partial<BookingData>): Promise<BookingData | null> {
    // Формируем части запроса для обновления
    const updates: string[] = [];
    const values: any[] = [id];
    let counter = 2;

    // Добавляем каждое поле в запрос
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${counter}`);
        values.push(value);
        counter++;
      }
    });

    // Если нет полей для обновления, возвращаем текущее бронирование
    if (updates.length === 0) {
      return this.findById(id);
    }

    const query = `
      UPDATE bookings
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Удаление бронирования
   * @param id ID бронирования
   * @returns true если удаление успешно, иначе false
   */
  static async delete(id: string): Promise<boolean> {
    const query = `
      DELETE FROM bookings
      WHERE id = $1
      RETURNING id
    `;

    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Проверка доступности объекта недвижимости в указанные даты
   * @param propertyId ID объекта недвижимости
   * @param checkInDate Дата заезда
   * @param checkOutDate Дата выезда
   * @param excludeBookingId ID бронирования для исключения (при обновлении)
   * @returns true если объект доступен, иначе false
   */
  static async isPropertyAvailable(
    propertyId: string,
    checkInDate: Date | string,
    checkOutDate: Date | string,
    excludeBookingId?: string
  ): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count
      FROM bookings
      WHERE property_id = $1
      AND status IN ('pending', 'confirmed')
      AND (
        (check_in_date <= $2 AND check_out_date > $2) OR
        (check_in_date < $3 AND check_out_date >= $3) OR
        (check_in_date >= $2 AND check_out_date <= $3)
      )
    `;

    const values = [propertyId, checkInDate, checkOutDate];

    if (excludeBookingId) {
      query += ` AND id != $4`;
      values.push(excludeBookingId);
    }

    const result = await db.query(query, values);
    return parseInt(result.rows[0].count) === 0;
  }
}

export default Booking; 
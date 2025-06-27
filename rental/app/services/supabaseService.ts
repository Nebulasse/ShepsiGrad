import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config';

// Типы данных для арендодателей
export interface Landlord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rating: number;
  is_active: boolean;
  company_name?: string;
  company_registration_number?: string;
  tax_id?: string;
  bank_account?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  preferred_language: string;
  preferred_currency: string;
  notification_settings: any;
}

// Класс для работы с Supabase
class SupabaseService {
  private supabase: SupabaseClient;
  private static instance: SupabaseService;

  private constructor() {
    this.supabase = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
  }

  // Получение экземпляра сервиса (паттерн Singleton)
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // Получение клиента Supabase
  public getClient(): SupabaseClient {
    return this.supabase;
  }

  // Методы для работы с арендодателями
  async getLandlord(id: string): Promise<Landlord | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_CONFIG.tables.landlords)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Ошибка при получении данных арендодателя:', error);
      return null;
    }

    return data as Landlord;
  }

  async getLandlordByEmail(email: string): Promise<Landlord | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_CONFIG.tables.landlords)
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Ошибка при получении данных арендодателя по email:', error);
      return null;
    }

    return data as Landlord;
  }

  async createLandlord(landlordData: Partial<Landlord>): Promise<Landlord | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_CONFIG.tables.landlords)
      .insert([landlordData])
      .select()
      .single();

    if (error) {
      console.error('Ошибка при создании арендодателя:', error);
      return null;
    }

    return data as Landlord;
  }

  async updateLandlord(id: string, landlordData: Partial<Landlord>): Promise<Landlord | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_CONFIG.tables.landlords)
      .update(landlordData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Ошибка при обновлении данных арендодателя:', error);
      return null;
    }

    return data as Landlord;
  }

  async deleteLandlord(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(SUPABASE_CONFIG.tables.landlords)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Ошибка при удалении арендодателя:', error);
      return false;
    }

    return true;
  }

  // Методы для аутентификации
  async signUp(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }

    return data;
  }

  async signIn(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }

    return data;
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      console.error('Ошибка при выходе:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.error('Ошибка при сбросе пароля:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<any> {
    const { data, error } = await this.supabase.auth.getUser();

    if (error) {
      console.error('Ошибка при получении текущего пользователя:', error);
      return null;
    }

    return data?.user;
  }

  async getSession(): Promise<any> {
    const { data, error } = await this.supabase.auth.getSession();

    if (error) {
      console.error('Ошибка при получении сессии:', error);
      return null;
    }

    return data.session;
  }

  // Методы для работы с хранилищем файлов
  async uploadFile(bucket: string, path: string, file: any): Promise<string | null> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) {
      console.error('Ошибка при загрузке файла:', error);
      return null;
    }

    return data.path;
  }

  getFileUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<boolean> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Ошибка при удалении файла:', error);
      return false;
    }

    return true;
  }
}

// Экспортируем экземпляр сервиса
export const supabaseService = SupabaseService.getInstance(); 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Проверка наличия обязательных переменных
if (!supabaseUrl || !supabaseKey) {
  console.warn('SUPABASE_URL или SUPABASE_ANON_KEY не установлены. Используется мок-клиент.');
}

// Создаем реальный клиент Supabase
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient();

export const getSupabaseClient = () => {
  return supabase;
};

// Функция для создания мок-клиента для разработки
function createMockClient() {
  console.warn('Используется мок-клиент Supabase для разработки');
  
  // Хранилище данных в памяти
  const mockStorage = {
    users: [
      {
        id: '1',
        email: 'test@example.com',
        password: '$2a$10$CwTycUXWue0Thq9StjUM0uQxTmrjFAzm0GL7e6pLaGSj0dXWGS9NK', // password: password
        firstName: 'Тест',
        lastName: 'Тестов',
        role: 'user',
        emailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  };
  
  // Мок-клиент с базовыми методами
  return {
    from: (table) => ({
      select: (fields = '*') => ({
        eq: (field, value) => ({
          single: () => {
            const data = mockStorage[table]?.find(item => item[field] === value) || null;
            return { data, error: null };
          }
        }),
        single: () => {
          return { data: mockStorage[table]?.[0] || null, error: null };
        }
      }),
      insert: (items) => ({
        select: () => ({
          single: () => {
            const newItem = { id: Date.now().toString(), ...items[0], createdAt: new Date(), updatedAt: new Date() };
            if (!mockStorage[table]) mockStorage[table] = [];
            mockStorage[table].push(newItem);
            return { data: newItem, error: null };
          }
        })
      }),
      update: (item) => ({
        eq: (field, value) => ({
          select: () => ({
            single: () => {
              const index = mockStorage[table]?.findIndex(i => i[field] === value);
              if (index === -1 || index === undefined) return { data: null, error: { message: 'Not found' } };
              mockStorage[table][index] = { ...mockStorage[table][index], ...item, updatedAt: new Date() };
              return { data: mockStorage[table][index], error: null };
            }
          })
        })
      }),
      delete: () => ({
        eq: (field, value) => {
          const index = mockStorage[table]?.findIndex(i => i[field] === value);
          if (index !== -1 && index !== undefined) {
            mockStorage[table].splice(index, 1);
          }
          return { error: null };
        }
      })
    })
  };
} 
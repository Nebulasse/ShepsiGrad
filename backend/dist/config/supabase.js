"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseClient = exports.supabase = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
// Проверка режима разработки для использования моков
const isDev = process.env.NODE_ENV === 'development';
// Создаем мок-клиент для разработки
exports.supabase = createMockClient();
const getSupabaseClient = () => {
    return exports.supabase;
};
exports.getSupabaseClient = getSupabaseClient;
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
                        var _a;
                        const data = ((_a = mockStorage[table]) === null || _a === void 0 ? void 0 : _a.find(item => item[field] === value)) || null;
                        return { data, error: null };
                    }
                }),
                single: () => {
                    var _a;
                    return { data: ((_a = mockStorage[table]) === null || _a === void 0 ? void 0 : _a[0]) || null, error: null };
                }
            }),
            insert: (items) => ({
                select: () => ({
                    single: () => {
                        const newItem = { id: Date.now().toString(), ...items[0], createdAt: new Date(), updatedAt: new Date() };
                        if (!mockStorage[table])
                            mockStorage[table] = [];
                        mockStorage[table].push(newItem);
                        return { data: newItem, error: null };
                    }
                })
            }),
            update: (item) => ({
                eq: (field, value) => ({
                    select: () => ({
                        single: () => {
                            var _a;
                            const index = (_a = mockStorage[table]) === null || _a === void 0 ? void 0 : _a.findIndex(i => i[field] === value);
                            if (index === -1 || index === undefined)
                                return { data: null, error: { message: 'Not found' } };
                            mockStorage[table][index] = { ...mockStorage[table][index], ...item, updatedAt: new Date() };
                            return { data: mockStorage[table][index], error: null };
                        }
                    })
                })
            }),
            delete: () => ({
                eq: (field, value) => {
                    var _a;
                    const index = (_a = mockStorage[table]) === null || _a === void 0 ? void 0 : _a.findIndex(i => i[field] === value);
                    if (index !== -1 && index !== undefined) {
                        mockStorage[table].splice(index, 1);
                    }
                    return { error: null };
                }
            })
        })
    };
}

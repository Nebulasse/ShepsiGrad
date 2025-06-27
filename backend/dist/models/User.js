"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const supabase_1 = require("../config/supabase");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class User {
    constructor(data) {
        Object.assign(this, data);
    }
    static async findById(id) {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        return data ? new User(data) : null;
    }
    static async findByEmail(email) {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error && error.code !== 'PGRST116')
            throw error;
        return data ? new User(data) : null;
    }
    static async findOne(query) {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('*');
        // Фильтруем результаты вручную, так как Supabase не поддерживает сложные запросы
        if (error)
            throw error;
        if (!data || data.length === 0)
            return null;
        const filtered = data.filter(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
        return filtered.length > 0 ? new User(filtered[0]) : null;
    }
    static async create(userData) {
        if (userData.password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            userData.password = await bcryptjs_1.default.hash(userData.password, salt);
        }
        const { data, error } = await supabase_1.supabase
            .from('users')
            .insert([userData])
            .select()
            .single();
        if (error)
            throw error;
        return new User(data);
    }
    static async update(id, userData) {
        if (userData.password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            userData.password = await bcryptjs_1.default.hash(userData.password, salt);
        }
        const { data, error } = await supabase_1.supabase
            .from('users')
            .update(userData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return new User(data);
    }
    static async delete(id) {
        const { error } = await supabase_1.supabase
            .from('users')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
    }
    static async comparePassword(password, hashedPassword) {
        return bcryptjs_1.default.compare(password, hashedPassword);
    }
    // Метод для преобразования объекта пользователя в публичный формат
    toPublic() {
        return {
            id: this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            role: this.role,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            emailVerified: this.emailVerified,
            status: this.status
        };
    }
}
exports.User = User;

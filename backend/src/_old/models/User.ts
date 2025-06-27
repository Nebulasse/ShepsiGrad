import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';

export interface User {
    id: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'landlord' | 'admin';
    createdAt?: Date;
    updatedAt?: Date;
    emailVerified?: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    status?: string;
}

export class User {
    id: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'landlord' | 'admin';
    createdAt?: Date;
    updatedAt?: Date;
    emailVerified?: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    status?: string;
    
    constructor(data: Partial<User>) {
        Object.assign(this, data);
    }
    
    static async findById(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data ? new User(data) : null;
    }
    
    static async findByEmail(email: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data ? new User(data) : null;
    }
    
    static async findOne(query: Record<string, any>): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*');
        if (error) throw error;
        if (!data || data.length === 0) return null;
        const filtered = data.filter(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
        return filtered.length > 0 ? new User(filtered[0]) : null;
    }
    
    static async create(userData: Partial<User>): Promise<User> {
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();
        if (error) throw error;
        return new User(data);
    }
    
    static async update(id: string, userData: Partial<User>): Promise<User> {
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }
        const { data, error } = await supabase
            .from('users')
            .update(userData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return new User(data);
    }
    
    static async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
    
    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
    
    toPublic(): Partial<User> {
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
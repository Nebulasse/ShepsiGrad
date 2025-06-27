import { Model, Optional } from 'sequelize';
export declare enum UserRole {
    USER = "user",// Обычный пользователь (арендатор)
    LANDLORD = "landlord",// Арендодатель
    ADMIN = "admin"
}
export declare enum UserStatus {
    PENDING = "pending",// Ожидает подтверждения email
    ACTIVE = "active",// Активный пользователь
    BLOCKED = "blocked",// Заблокирован администратором
    DELETED = "deleted"
}
export interface UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
    avatarUrl?: string;
    emailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'status'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
    avatarUrl?: string;
    emailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    lastLoginAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt?: Date;
    validatePassword(password: string): Promise<boolean>;
    getFullName(): string;
    toPublic(): Partial<UserAttributes>;
}
export default User;

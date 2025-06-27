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
export declare class User {
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
    constructor(data: Partial<User>);
    static findById(id: string): Promise<User | null>;
    static findByEmail(email: string): Promise<User | null>;
    static findOne(query: Record<string, any>): Promise<User | null>;
    static create(userData: Partial<User>): Promise<User>;
    static update(id: string, userData: Partial<User>): Promise<User>;
    static delete(id: string): Promise<void>;
    static comparePassword(password: string, hashedPassword: string): Promise<boolean>;
    toPublic(): Partial<User>;
}

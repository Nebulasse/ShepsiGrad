import React, { createContext } from 'react';

// Определение типов, соответствующих реальному AuthContext
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  full_name?: string;
  role: 'user' | 'landlord' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export const mockUser: User = {
  id: 'user123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  avatar: 'https://example.com/avatar.jpg'
};

export const MockAuthContext = createContext<AuthContextType>({
  user: mockUser,
  isLoading: false,
  isAuthenticated: true,
  token: 'mock-token-123456',
  login: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  register: jest.fn().mockResolvedValue(undefined),
  updateProfile: jest.fn().mockResolvedValue(undefined)
});

export const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockAuthContext.Provider
      value={{
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        token: 'mock-token-123456',
        login: jest.fn().mockResolvedValue(undefined),
        logout: jest.fn().mockResolvedValue(undefined),
        register: jest.fn().mockResolvedValue(undefined),
        updateProfile: jest.fn().mockResolvedValue(undefined)
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
};

// Хук для использования мока контекста в тестах
export const useMockAuth = () => {
  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    token: 'mock-token-123456',
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    register: jest.fn().mockResolvedValue(undefined),
    updateProfile: jest.fn().mockResolvedValue(undefined)
  };
}; 
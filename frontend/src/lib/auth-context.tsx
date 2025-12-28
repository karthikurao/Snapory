'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, AuthResponse, User } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, companyName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const profile = await apiClient.getProfile();
          setUser(profile);
        } catch {
          // Token invalid, clear it
          apiClient.logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    setUser({
      userId: response.userId,
      email: response.email,
      name: response.name,
      createdAt: new Date().toISOString(),
    });
  };

  const register = async (email: string, password: string, name: string, companyName?: string) => {
    const response = await apiClient.register(email, password, name, companyName);
    setUser({
      userId: response.userId,
      email: response.email,
      name: response.name,
      companyName,
      createdAt: new Date().toISOString(),
    });
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

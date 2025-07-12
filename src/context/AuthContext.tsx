import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DatabaseService } from '../services/database';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage for session persistence
    const savedUser = localStorage.getItem('skillswap_currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check for default admin account
      if (email === 'admin@skillswap.com' && password === 'admin') {
        const adminUser: User = {
          id: 'admin',
          name: 'Admin User',
          email: 'admin@skillswap.com',
          skillsOffered: [],
          skillsWanted: [],
          availability: [],
          isPublic: false,
          role: 'admin',
          rating: 5.0,
          totalSwaps: 0,
          joinDate: '2024-01-01',
          isActive: true
        };
        
        setUser(adminUser);
        localStorage.setItem('skillswap_currentUser', JSON.stringify(adminUser));
        setIsLoading(false);
        return true;
      }
      
      // Find user in database
      const users = await DatabaseService.getUsers();
      const foundUser = users.find(u => u.email === email);
      
      if (foundUser && foundUser.isActive) {
        // In a real app, you'd verify the password hash
        // For demo purposes, we'll accept any password for registered users
        setUser(foundUser);
        localStorage.setItem('skillswap_currentUser', JSON.stringify(foundUser));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillswap_currentUser');
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check if email already exists
      const users = await DatabaseService.getUsers();
      const emailExists = users.some(u => u.email === userData.email);
      
      if (emailExists) {
        setIsLoading(false);
        return false;
      }
      
      const newUser: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
        name: userData.name || '',
        email: userData.email || '',
        location: userData.location,
        skillsOffered: userData.skillsOffered || [],
        skillsWanted: userData.skillsWanted || [],
        availability: userData.availability || [],
        isPublic: userData.isPublic ?? true,
        role: 'user',
        rating: 5.0,
        totalSwaps: 0,
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true
      };
      
      const createdUser = await DatabaseService.createUser(newUser);
      
      if (createdUser) {
        setUser(createdUser);
        localStorage.setItem('skillswap_currentUser', JSON.stringify(createdUser));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await DatabaseService.updateUser(user.id, userData);
        if (updatedUser) {
          const newUser = { ...user, ...updatedUser };
          setUser(newUser);
          localStorage.setItem('skillswap_currentUser', JSON.stringify(newUser));
        }
      } catch (error) {
        console.error('Update user error:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
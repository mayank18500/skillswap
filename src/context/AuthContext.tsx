import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useApp } from './AppContext';

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
    // Load user from localStorage
    const savedUser = localStorage.getItem('skillswap_currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get all users from localStorage
    const savedUsers = localStorage.getItem('skillswap_users');
    let users: User[] = [];
    
    if (savedUsers) {
      users = JSON.parse(savedUsers);
    }

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
    
    // Find user in registered users
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
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillswap_currentUser');
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists
    const savedUsers = localStorage.getItem('skillswap_users');
    let users: User[] = [];
    
    if (savedUsers) {
      users = JSON.parse(savedUsers);
    }
    
    const emailExists = users.some(u => u.email === userData.email);
    if (emailExists) {
      setIsLoading(false);
      return false;
    }
    
    const newUser: User = {
      id: Date.now().toString(),
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
    
    // Add user to the users list
    const updatedUsers = [...users, newUser];
    localStorage.setItem('skillswap_users', JSON.stringify(updatedUsers));
    
    setUser(newUser);
    localStorage.setItem('skillswap_currentUser', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('skillswap_currentUser', JSON.stringify(updatedUser));
      
      // Update user in the users list
      const savedUsers = localStorage.getItem('skillswap_users');
      if (savedUsers) {
        const users: User[] = JSON.parse(savedUsers);
        const updatedUsers = users.map(u => 
          u.id === user.id ? updatedUser : u
        );
        localStorage.setItem('skillswap_users', JSON.stringify(updatedUsers));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
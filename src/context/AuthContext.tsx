import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DatabaseService } from '../services/database';
import { supabase } from '../supabaseClient';

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

  // Use Supabase's auth state change listener for session management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Fetch the user data from your 'users' table after a successful session
        DatabaseService.getUserById(session.user.id).then(dbUser => {
          if (dbUser) {
            setUser(dbUser);
          }
          setIsLoading(false);
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    return !error;
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
        }
      }
    });

    if (authError) {
      console.error('Registration failed:', authError);
      setIsLoading(false);
      return false;
    }

    if (authData.user) {
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

      const { error: dbError } = await supabase.from('users').insert([{
        ...newUser,
        id: authData.user.id,
      }]);

      if (dbError) {
        console.error('Failed to create user profile:', dbError);
        setIsLoading(false);
        return false;
      }
    }

    setIsLoading(false);
    return true;
  };
  
  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await DatabaseService.updateUser(user.id, userData);
        if (updatedUser) {
          const newUser = { ...user, ...updatedUser };
          setUser(newUser);
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
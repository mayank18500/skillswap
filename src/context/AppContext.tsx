import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SwapRequest, SwapFeedback, AdminMessage } from '../types';

interface AppContextType {
  users: User[];
  swapRequests: SwapRequest[];
  feedback: SwapFeedback[];
  adminMessages: AdminMessage[];
  searchUsers: (skill: string) => User[];
  createSwapRequest: (request: Omit<SwapRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSwapRequest: (id: string, updates: Partial<SwapRequest>) => void;
  addFeedback: (feedback: Omit<SwapFeedback, 'id' | 'createdAt'>) => void;
  banUser: (userId: string) => void;
  addAdminMessage: (message: Omit<AdminMessage, 'id' | 'createdAt'>) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [feedback, setFeedback] = useState<SwapFeedback[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);

  useEffect(() => {
    // Load data from localStorage on app start
    const savedUsers = localStorage.getItem('skillswap_users');
    const savedSwapRequests = localStorage.getItem('skillswap_swapRequests');
    const savedFeedback = localStorage.getItem('skillswap_feedback');
    const savedAdminMessages = localStorage.getItem('skillswap_adminMessages');

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    if (savedSwapRequests) {
      setSwapRequests(JSON.parse(savedSwapRequests));
    }
    if (savedFeedback) {
      setFeedback(JSON.parse(savedFeedback));
    }
    if (savedAdminMessages) {
      setAdminMessages(JSON.parse(savedAdminMessages));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('skillswap_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('skillswap_swapRequests', JSON.stringify(swapRequests));
  }, [swapRequests]);

  useEffect(() => {
    localStorage.setItem('skillswap_feedback', JSON.stringify(feedback));
  }, [feedback]);

  useEffect(() => {
    localStorage.setItem('skillswap_adminMessages', JSON.stringify(adminMessages));
  }, [adminMessages]);

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const searchUsers = (skill: string): User[] => {
    if (!skill.trim()) return users.filter(u => u.isPublic && u.isActive);
    
    const searchTerm = skill.toLowerCase();
    return users.filter(user => 
      user.isPublic && 
      user.isActive &&
      user.skillsOffered.some(s => s.toLowerCase().includes(searchTerm))
    );
  };

  const createSwapRequest = (request: Omit<SwapRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRequest: SwapRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSwapRequests(prev => [...prev, newRequest]);
  };

  const updateSwapRequest = (id: string, updates: Partial<SwapRequest>) => {
    setSwapRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, ...updates, updatedAt: new Date().toISOString() }
        : req
    ));

    // Update user ratings when swap is completed
    if (updates.status === 'completed') {
      const request = swapRequests.find(r => r.id === id);
      if (request) {
        // Increment total swaps for both users
        setUsers(prev => prev.map(user => {
          if (user.id === request.fromUserId || user.id === request.toUserId) {
            return { ...user, totalSwaps: user.totalSwaps + 1 };
          }
          return user;
        }));
      }
    }
  };

  const addFeedback = (feedbackData: Omit<SwapFeedback, 'id' | 'createdAt'>) => {
    const newFeedback: SwapFeedback = {
      ...feedbackData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setFeedback(prev => [...prev, newFeedback]);

    // Update the recipient's rating
    const userFeedbacks = [...feedback, newFeedback].filter(f => f.toUserId === feedbackData.toUserId);
    const averageRating = userFeedbacks.reduce((sum, f) => sum + f.rating, 0) / userFeedbacks.length;
    
    setUsers(prev => prev.map(user => 
      user.id === feedbackData.toUserId 
        ? { ...user, rating: averageRating }
        : user
    ));
  };

  const banUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: false } : user
    ));
  };

  const addAdminMessage = (message: Omit<AdminMessage, 'id' | 'createdAt'>) => {
    const newMessage: AdminMessage = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setAdminMessages(prev => [...prev, newMessage]);
  };

  return (
    <AppContext.Provider value={{
      users,
      swapRequests,
      feedback,
      adminMessages,
      searchUsers,
      createSwapRequest,
      updateSwapRequest,
      addFeedback,
      banUser,
      addAdminMessage,
      addUser,
      updateUser
    }}>
      {children}
    </AppContext.Provider>
  );
};
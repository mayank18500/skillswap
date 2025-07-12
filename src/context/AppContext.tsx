import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SwapRequest, SwapFeedback, AdminMessage } from '../types';
import { DatabaseService } from '../services/database';

interface AppContextType {
  users: User[];
  swapRequests: SwapRequest[];
  feedback: SwapFeedback[];
  adminMessages: AdminMessage[];
  isLoading: boolean;
  searchUsers: (skill: string) => Promise<User[]>;
  createSwapRequest: (request: Omit<SwapRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSwapRequest: (id: string, updates: Partial<SwapRequest>) => Promise<void>;
  addFeedback: (feedback: Omit<SwapFeedback, 'id' | 'createdAt'>) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
  addAdminMessage: (message: Omit<AdminMessage, 'id' | 'createdAt'>) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  refreshData: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, swapRequestsData, feedbackData, adminMessagesData] = await Promise.all([
        DatabaseService.getUsers(),
        DatabaseService.getSwapRequests(),
        DatabaseService.getFeedback(),
        DatabaseService.getAdminMessages()
      ]);

      setUsers(usersData);
      setSwapRequests(swapRequestsData);
      setFeedback(feedbackData);
      setAdminMessages(adminMessagesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  const addUser = async (user: User) => {
    const newUser = await DatabaseService.createUser(user);
    if (newUser) {
      setUsers(prev => [...prev, newUser]);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const updatedUser = await DatabaseService.updateUser(userId, updates);
    if (updatedUser) {
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
    }
  };

  const searchUsers = async (skill: string): Promise<User[]> => {
    return await DatabaseService.searchUsers(skill);
  };

  const createSwapRequest = async (request: Omit<SwapRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRequest = await DatabaseService.createSwapRequest(request);
    if (newRequest) {
      setSwapRequests(prev => [...prev, newRequest]);
    }
  };

  const updateSwapRequest = async (id: string, updates: Partial<SwapRequest>) => {
    const updatedRequest = await DatabaseService.updateSwapRequest(id, updates);
    if (updatedRequest) {
      setSwapRequests(prev => prev.map(req => 
        req.id === id ? updatedRequest : req
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
    }
  };

  const addFeedback = async (feedbackData: Omit<SwapFeedback, 'id' | 'createdAt'>) => {
    const newFeedback = await DatabaseService.createFeedback(feedbackData);
    if (newFeedback) {
      setFeedback(prev => [...prev, newFeedback]);

      // Update the recipient's rating
      const userFeedbacks = [...feedback, newFeedback].filter(f => f.toUserId === feedbackData.toUserId);
      const averageRating = userFeedbacks.reduce((sum, f) => sum + f.rating, 0) / userFeedbacks.length;
      
      setUsers(prev => prev.map(user => 
        user.id === feedbackData.toUserId 
          ? { ...user, rating: averageRating }
          : user
      ));
    }
  };

  const banUser = async (userId: string) => {
    const success = await DatabaseService.updateUser(userId, { isActive: false });
    if (success) {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: false } : user
      ));
    }
  };

  const addAdminMessage = async (message: Omit<AdminMessage, 'id' | 'createdAt'>) => {
    const newMessage = await DatabaseService.createAdminMessage(message);
    if (newMessage) {
      setAdminMessages(prev => [...prev, newMessage]);
    }
  };

  return (
    <AppContext.Provider value={{
      users,
      swapRequests,
      feedback,
      adminMessages,
      isLoading,
      searchUsers,
      createSwapRequest,
      updateSwapRequest,
      addFeedback,
      banUser,
      addAdminMessage,
      addUser,
      updateUser,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};
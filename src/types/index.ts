export interface User {
  id: string;
  name: string;
  email: string;
  location?: string;
  profilePhoto?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
  role: 'user' | 'admin';
  rating: number;
  totalSwaps: number;
  joinDate: string;
  isActive: boolean;
}

export interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  skillOffered: string;
  skillWanted: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  feedback?: SwapFeedback;
}

export interface SwapFeedback {
  id: string;
  swapRequestId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdminMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance';
  createdAt: string;
  isActive: boolean;
}

export interface ActivityReport {
  totalUsers: number;
  activeUsers: number;
  pendingSwaps: number;
  completedSwaps: number;
  averageRating: number;
  topSkills: { skill: string; count: number }[];
  recentActivity: {
    date: string;
    newUsers: number;
    newSwaps: number;
    completedSwaps: number;
  }[];
}
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
  created_at?: string;
  updated_at?: string;
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
  from_user?: User;
  to_user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface SwapFeedback {
  id: string;
  fromUserId: string;
  toUserId: string;
  swapRequestId: string;
  rating: number;
  comment: string;
  createdAt: string;
  from_user?: User;
  to_user?: User;
  created_at?: string;
}

export interface AdminMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance';
  createdAt: string;
  isActive: boolean;
  created_at?: string;
}

export interface ActivityReport {
  date: string;
  newUsers: number;
  newSwaps: number;
  completedSwaps: number;
}
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
  from_user_id: string; 
  to_user_id: string;   
  skill_offered: string;
  skill_wanted: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  from_user?: User;
  to_user?: User;
  feedback?: SwapFeedback;
}

export interface SwapFeedback {
  id: string;
  from_user_id: string; 
  to_user_id: string; 
  swap_request_id: string; 
  rating: number;
  comment: string;
  created_at: string;
  from_user?: User;
  to_user?: User;
}

export interface AdminMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance';
  is_active: boolean; 
  created_at: string; 
}

export interface ActivityReport {
  date: string;
  newUsers: number;
  newSwaps: number;
  completedSwaps: number;
}
import { supabase } from '../supabaseClient';
import { User, SwapRequest, SwapFeedback, AdminMessage } from '../types';

// Database service for all CRUD operations
export class DatabaseService {
  // Users
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  static async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  }

  static async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  }

  // Swap Requests
  static async getSwapRequests(): Promise<SwapRequest[]> {
    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        *,
        from_user:users!from_user_id(id, name, email),
        to_user:users!to_user_id(id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching swap requests:', error);
      return [];
    }

    return data || [];
  }

  static async getSwapRequestById(id: string): Promise<SwapRequest | null> {
    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        *,
        from_user:users!from_user_id(id, name, email),
        to_user:users!to_user_id(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching swap request:', error);
      return null;
    }

    return data;
  }

static async createSwapRequest(request: Omit<SwapRequest, 'id' | 'created_at' | 'updated_at'>): Promise<SwapRequest | null> {
    const { data, error } = await supabase
      .from('swap_requests')
      .insert([request])
      .select()
      .single();

    if (error) {
      console.error('Error creating swap request:', error);
      return null;
    }

    return data;
  }

  static async updateSwapRequest(id: string, updates: Partial<SwapRequest>): Promise<SwapRequest | null> {
    const { data, error } = await supabase
      .from('swap_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating swap request:', error);
      return null;
    }

    return data;
  }

  static async deleteSwapRequest(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('swap_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting swap request:', error);
      return false;
    }

    return true;
  }

  // Feedback
  static async getFeedback(): Promise<SwapFeedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        from_user:users!from_user_id(id, name, email),
        to_user:users!to_user_id(id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return [];
    }

    return data || [];
  }

  static async createFeedback(feedback: Omit<SwapFeedback, 'id' | 'createdAt' | 'created_at'>): Promise<SwapFeedback | null> {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedback])
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      return null;
    }

    return data;
  }

  // Admin Messages
  static async getAdminMessages(): Promise<AdminMessage[]> {
    const { data, error } = await supabase
      .from('admin_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin messages:', error);
      return [];
    }

    return data || [];
  }

  static async createAdminMessage(message: Omit<AdminMessage, 'id' | 'createdAt' | 'created_at'>): Promise<AdminMessage | null> {
    const { data, error } = await supabase
      .from('admin_messages')
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin message:', error);
      return null;
    }

    return data;
  }

  static async updateAdminMessage(id: string, updates: Partial<AdminMessage>): Promise<AdminMessage | null> {
    const { data, error } = await supabase
      .from('admin_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin message:', error);
      return null;
    }

    return data;
  }

  static async deleteAdminMessage(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('admin_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting admin message:', error);
      return false;
    }

    return true;
  }

  // Search and Analytics
  static async searchUsers(skill: string): Promise<User[]> {
    if (!skill.trim()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_public', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_public', true)
      .eq('is_active', true)
      .contains('skills_offered', [skill.toLowerCase()])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data || [];
  }

  static async getAnalytics() {
    const [users, swapRequests, feedback] = await Promise.all([
      this.getUsers(),
      this.getSwapRequests(),
      this.getFeedback()
    ]);

    const regularUsers = users.filter(u => u.role !== 'admin');
    const activeUsers = regularUsers.filter(u => u.isActive).length;
    const pendingSwaps = swapRequests.filter(r => r.status === 'pending').length;
    const completedSwaps = swapRequests.filter(r => r.status === 'completed').length;
    const averageRating = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
      : 5.0;

    const skillCounts = regularUsers.flatMap(u => u.skillsOffered).reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    return {
      totalUsers: regularUsers.length,
      activeUsers,
      pendingSwaps,
      completedSwaps,
      averageRating,
      topSkills
    };
  }
}
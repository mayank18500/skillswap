import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Star, Users, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xlcpkydcyueecugaiucy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsY3BreWRjeXVlZWN1Z2FpdWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMDcxNjcsImV4cCI6MjA2Nzg4MzE2N30.qd8xalX2AL_adL5FWRfRLpn7892rIzAe55saPoexzpI';
export const supabase = createClient(supabaseUrl, supabaseKey);

interface SwapRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  skill_offered: string;
  skill_wanted: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  created_at: string;
}

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [userData, setUserData] = useState({
    totalSwaps: 0,
    rating: 5.0,
    skillsOffered: [] as string[],
    skillsWanted: [] as string[]
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const fetchUserData = async () => {
    try {
      // Fetch user's swap requests
      const { data: swapsData, error: swapsError } = await supabase
        .from('swap_requests')
        .select('*')
        .or(`from_user_id.eq.${user?.id},to_user_id.eq.${user?.id}`);

      if (swapsError) throw swapsError;

      setSwapRequests(swapsData || []);

      // Calculate user stats
      const completedSwaps = swapsData?.filter(req => req.status === 'completed').length || 0;
      
      // Fetch user's skills (assuming you have a 'user_skills' table)
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user?.id);

      if (skillsError) throw skillsError;

      const skillsOffered = skillsData?.filter(s => s.type === 'offered').map(s => s.skill) || [];
      const skillsWanted = skillsData?.filter(s => s.type === 'wanted').map(s => s.skill) || [];

      // Fetch user's average rating (assuming you have a 'feedback' table)
      const { data: ratingData, error: ratingError } = await supabase
        .from('feedback')
        .select('rating')
        .eq('user_id', user?.id);

      if (ratingError) throw ratingError;

      const averageRating = ratingData?.length 
        ? parseFloat((ratingData.reduce((sum, item) => sum + item.rating, 0) / ratingData.length).toFixed(1))
        : 5.0;

      setUserData({
        totalSwaps: completedSwaps,
        rating: averageRating,
        skillsOffered,
        skillsWanted
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const userRequests = swapRequests.filter(req => 
    req.from_user_id === user?.id || req.to_user_id === user?.id
  );

  const pendingRequests = userRequests.filter(req => req.status === 'pending');
  const completedSwaps = userRequests.filter(req => req.status === 'completed');
  const activeSwaps = userRequests.filter(req => req.status === 'accepted');

  const stats = [
    {
      label: 'Total Swaps',
      value: userData.totalSwaps,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Rating',
      value: userData.rating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Pending Requests',
      value: pendingRequests.length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Active Swaps',
      value: activeSwaps.length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
    label: 'Completed Swaps',
    value: completedSwaps.length,
    icon: CheckCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your skill swaps</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Skills</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Skills You Offer</h3>
              <div className="flex flex-wrap gap-2">
                {userData.skillsOffered.length ? (
                  userData.skillsOffered.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Skills You Want</h3>
              <div className="flex flex-wrap gap-2">
                {userData.skillsWanted.length ? (
                  userData.skillsWanted.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills requested yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          
          <div className="space-y-4">
            {userRequests.length > 0 ? (
              userRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${
                    request.status === 'completed' ? 'bg-green-100' :
                    request.status === 'accepted' ? 'bg-blue-100' :
                    request.status === 'pending' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    {request.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {request.from_user_id === user?.id ? 'Outgoing' : 'Incoming'} swap request
                    </p>
                    <p className="text-xs text-gray-500">
                      {request.skill_offered} ↔ {request.skill_wanted}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-sm">Start browsing skills to make your first swap!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, TrendingUp, CheckCircle, Clock, Star, AlertTriangle, MessageSquareText, BarChart2, Briefcase, Loader } from 'lucide-react';
import { DatabaseService } from '../../services/database';

export const AdminDashboard: React.FC = () => {
  const { refreshData, isLoading, swapRequests, users, feedback } = useApp(); // Added feedback from AppContext
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingSwaps: 0,
    completedSwaps: 0,
    averageRating: 0,
    topSkills: [] as { skill: string; count: number }[]
  });

  // Use a dedicated state for analytics to prevent re-calculations
  useEffect(() => {
    const fetchAnalytics = async () => {
      // Use the database service directly to get pre-calculated analytics
      const analyticsData = await DatabaseService.getAnalytics();
      setAnalytics(analyticsData);
    };

    fetchAnalytics();
  }, [users, swapRequests]); // Recalculate if user or swap data changes

  // Client-side calculation for average rating (as a fallback or for real-time updates)
  const calculateAverageRating = () => {
    if (feedback.length === 0) {
      return 5.0;
    }
    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    return totalRating / feedback.length;
  };


  const stats = [
    {
      label: 'Total Users',
      value: analytics.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Active Users',
      value: analytics.activeUsers,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Pending Swaps',
      value: analytics.pendingSwaps,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Completed Swaps',
      value: analytics.completedSwaps,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  // Show a simple loader based on the AppContext loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-16 h-16 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform-wide analytics and key metrics</p>
        </div>
        <button
          onClick={refreshData}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
        >
          Refresh Data
        </button>
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
        {/* Top Skills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Skills Offered</h2>
          <ul className="space-y-3">
            {analytics.topSkills.length > 0 ? (
              analytics.topSkills.map((skill, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-800">{skill.skill}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{skill.count} users</span>
                </li>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageSquareText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No skill data available</p>
              </div>
            )}
          </ul>
        </div>
        
        {/* Overall Ratings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Star className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900">Average User Rating</p>
                  <p className="text-sm text-gray-600">Based on all user feedback</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{calculateAverageRating().toFixed(1)} / 5</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <BarChart2 className="w-6 h-6 text-indigo-500" />
                <div>
                  <p className="font-medium text-gray-900">Total Swaps</p>
                  <p className="text-sm text-gray-600">All-time count of swaps</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{swapRequests.length}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900">Banned Users</p>
                  <p className="text-sm text-gray-600">Inactive accounts due to policy violations</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{users.filter(u => !u.isActive && u.role === 'user').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
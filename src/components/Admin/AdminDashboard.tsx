import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, MessageSquare, TrendingUp, AlertTriangle, Eye, Star } from 'lucide-react';
import { ActivityReport } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { users, swapRequests, feedback } = useApp();

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

  const stats = [
    {
      label: 'Total Users',
      value: regularUsers.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Active Users',
      value: activeUsers,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Pending Swaps',
      value: pendingSwaps,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Completed Swaps',
      value: completedSwaps,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor platform activity and manage the community</p>
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
        {/* Platform Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Health</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Average Rating</p>
                <p className="text-sm text-gray-600">Overall user satisfaction</p>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">User Activity</p>
                <p className="text-sm text-gray-600">Active vs total users</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {regularUsers.length > 0 ? ((activeUsers / regularUsers.length) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-sm text-gray-600">{activeUsers}/{regularUsers.length}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Swap Success Rate</p>
                <p className="text-sm text-gray-600">Completed vs total swaps</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {swapRequests.length > 0 
                    ? ((completedSwaps / swapRequests.length) * 100).toFixed(0)
                    : 0}%
                </p>
                <p className="text-sm text-gray-600">{completedSwaps}/{swapRequests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Skills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Popular Skills</h2>
          
          <div className="space-y-3">
            {topSkills.map((skill, index) => (
              <div key={skill.skill} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{skill.skill}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${(skill.count / Math.max(...topSkills.map(s => s.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{skill.count}</span>
                </div>
              </div>
            ))}
          </div>

          {topSkills.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No skills data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Platform Activity</h2>
        
        <div className="space-y-4">
          {swapRequests.slice(0, 10).map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Swap Request: {request.skillOffered} ↔ {request.skillWanted}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(request.createdAt).toLocaleDateString()} - Status: {request.status}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                request.status === 'completed' ? 'bg-green-100 text-green-800' :
                request.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {request.status}
              </span>
            </div>
          ))}
          
          {swapRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
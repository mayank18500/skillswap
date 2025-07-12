import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, Filter, Calendar, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';

export const SwapManagement: React.FC = () => {
  const { swapRequests, updateSwapRequest, users } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSwap, setSelectedSwap] = useState<string | null>(null);

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const filteredSwaps = swapRequests.filter(swap => 
    statusFilter === 'all' || swap.status === statusFilter
  );

  const handleForceCancel = (swapId: string) => {
    if (window.confirm('Are you sure you want to cancel this swap?')) {
      updateSwapRequest(swapId, { status: 'cancelled' });
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  const statusIcons = {
    pending: Clock,
    accepted: CheckCircle,
    completed: CheckCircle,
    rejected: XCircle,
    cancelled: Ban
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Swap Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage skill swap requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Swaps List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Swap Requests ({filteredSwaps.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredSwaps.map((swap) => {
            const StatusIcon = statusIcons[swap.status as keyof typeof statusIcons];
            
            return (
              <div
                key={swap.id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <StatusIcon className="w-5 h-5 text-gray-600" />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[swap.status as keyof typeof statusColors]}`}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(swap.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {getUserName(swap.fromUserId).charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {getUserName(swap.fromUserId)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          {swap.skillOffered}
                        </span>
                        <span className="text-gray-400">↔</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                          {swap.skillWanted}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">with</span>
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {getUserName(swap.toUserId).charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {getUserName(swap.toUserId)}
                        </span>
                      </div>
                    </div>

                    {swap.message && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700">{swap.message}</p>
                      </div>
                    )}

                    {selectedSwap === swap.id && (
                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <div><strong>Swap ID:</strong> {swap.id}</div>
                        <div><strong>Created:</strong> {new Date(swap.createdAt).toLocaleString()}</div>
                        <div><strong>Updated:</strong> {new Date(swap.updatedAt).toLocaleString()}</div>
                        {swap.feedback && (
                          <div>
                            <strong>Feedback:</strong> {swap.feedback.rating}/5 stars - {swap.feedback.comment}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedSwap(selectedSwap === swap.id ? null : swap.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {(swap.status === 'pending' || swap.status === 'accepted') && (
                      <button
                        onClick={() => handleForceCancel(swap.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center space-x-1"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSwaps.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? 'No swap requests have been created yet'
                : `No ${statusFilter} swap requests found`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
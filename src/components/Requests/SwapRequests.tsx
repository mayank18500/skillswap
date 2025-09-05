import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Check, X, Trash2, MessageCircle, Star, Calendar } from 'lucide-react';
import { SwapRequest as SwapRequestType } from '../../types';

export const SwapRequests: React.FC = () => {
  const { swapRequests, updateSwapRequest, addFeedback, users } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'completed'>('incoming');
  const [feedbackForm, setFeedbackForm] = useState<{
    swapId: string;
    rating: number;
    comment: string;
  } | null>(null);

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.name || 'Unknown User';
  };

  const userRequests = swapRequests.filter(req => 
    req.from_user_id === user?.id || req.to_user_id === user?.id
  );

  const incomingRequests = userRequests.filter(req => 
    req.to_user_id === user?.id && req.status === 'pending'
  );

  const outgoingRequests = userRequests.filter(req => 
    req.from_user_id === user?.id && (req.status === 'pending' || req.status === 'accepted')
  );

  const completedRequests = userRequests.filter(req => 
    req.status === 'completed'
  );

  const handleAccept = (requestId: string) => {
    updateSwapRequest(requestId, { status: 'accepted' });
  };

  const handleReject = (requestId: string) => {
    updateSwapRequest(requestId, { status: 'rejected' });
  };

  const handleCancel = (requestId: string) => {
    updateSwapRequest(requestId, { status: 'cancelled' });
  };

  const handleComplete = (requestId: string) => {
    updateSwapRequest(requestId, { status: 'completed' });
  };

  const handleFeedback = async (swapId: string) => {
    if (feedbackForm && user) {
      const swap = swapRequests.find(req => req.id === swapId);
      if (!swap) return;
      
      const recipientId = swap.from_user_id === user.id ? swap.to_user_id : swap.from_user_id;
      
      await addFeedback({
        from_user_id: user.id,
        to_user_id: recipientId,
        swap_request_id: swapId,
        rating: feedbackForm.rating,
        comment: feedbackForm.comment,
      });
      setFeedbackForm(null);
    }
  };

  const tabs = [
    { id: 'incoming', label: 'Incoming', count: incomingRequests.length },
    { id: 'outgoing', label: 'Outgoing', count: outgoingRequests.length },
    { id: 'completed', label: 'Completed', count: completedRequests.length }
  ];

  const getCurrentRequests = () => {
    switch (activeTab) {
      case 'incoming': return incomingRequests;
      case 'outgoing': return outgoingRequests;
      case 'completed': return completedRequests;
      default: return [];
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Swap Requests</h1>
        <p className="text-gray-600">Manage your skill swap requests and track completed swaps</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {getCurrentRequests().length > 0 ? (
            <div className="space-y-4">
              {getCurrentRequests().map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {getUserName(
                              request.from_user_id === user?.id ? request.to_user_id : request.from_user_id
                            ).charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {activeTab === 'incoming' ? 'From' : 'To'}: {' '}
                            {getUserName(
                              request.from_user_id === user?.id ? request.to_user_id : request.from_user_id
                            )}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                            {request.skill_offered}
                          </span>
                          <span className="text-gray-400">↔</span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                            {request.skill_wanted}
                          </span>
                        </div>
                      </div>

                      {request.message && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">{request.message}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>

                        <div className="flex space-x-2">
                          {activeTab === 'incoming' && request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAccept(request.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                              >
                                <Check className="w-4 h-4" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                              >
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {activeTab === 'outgoing' && request.status === 'pending' && (
                            <button
                              onClick={() => handleCancel(request.id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          )}

                          {request.status === 'accepted' && (
                            <button
                              onClick={() => handleComplete(request.id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              <Check className="w-4 h-4" />
                              <span>Mark Complete</span>
                            </button>
                          )}

                          {activeTab === 'completed' && !request.feedback && (
                            <button
                              onClick={() => setFeedbackForm({ swapId: request.id, rating: 5, comment: '' })}
                              className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                            >
                              <Star className="w-4 h-4" />
                              <span>Leave Feedback</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} requests
              </h3>
              <p className="text-gray-600">
                {activeTab === 'incoming' && "You don't have any incoming requests yet"}
                {activeTab === 'outgoing' && "You haven't sent any requests yet"}
                {activeTab === 'completed' && "You haven't completed any swaps yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Leave Feedback</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                      className={`p-1 ${star <= feedbackForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                  placeholder="Share your experience with this skill swap..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setFeedbackForm(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleFeedback(feedbackForm.swapId)}
                  disabled={!feedbackForm.rating || !feedbackForm.comment}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
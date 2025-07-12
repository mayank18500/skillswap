import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, Star, MessageCircle, Filter, Users, Clock, Eye } from 'lucide-react';
import { User } from '../../types';

interface BrowseSkillsProps {
  setActiveTab: (tab: string) => void;
}

export const BrowseSkills: React.FC<BrowseSkillsProps> = ({ setActiveTab }) => {
  const { searchUsers, createSwapRequest } = useApp();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [swapForm, setSwapForm] = useState({
    skillOffered: '',
    skillWanted: '',
    message: ''
  });

  // Get all users and filter them
  const allUsers = searchUsers('');
  const filteredUsers = useMemo(() => {
    let results = allUsers.filter(u => u.id !== user?.id && u.role !== 'admin');

    // Search by skills offered
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(searchUser => 
        searchUser.skillsOffered.some(skill => 
          skill.toLowerCase().includes(searchLower)
        ) ||
        searchUser.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by location
    if (locationFilter.trim()) {
      const locationLower = locationFilter.toLowerCase();
      results = results.filter(searchUser => 
        searchUser.location?.toLowerCase().includes(locationLower)
      );
    }

    // Filter by rating
    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      results = results.filter(searchUser => searchUser.rating >= minRating);
    }

    // Filter by availability
    if (availabilityFilter !== 'all') {
      results = results.filter(searchUser => 
        searchUser.availability.includes(availabilityFilter)
      );
    }

    return results;
  }, [allUsers, searchTerm, locationFilter, ratingFilter, availabilityFilter, user?.id]);

  // Get unique locations for filter
  const availableLocations = useMemo(() => {
    const locations = allUsers
      .map(u => u.location)
      .filter(Boolean)
      .map(loc => loc!);
    return [...new Set(locations)].sort();
  }, [allUsers]);

  // Get unique availability options
  const availabilityOptions = ['Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings'];

  const handleCreateSwap = () => {
    if (selectedUser && swapForm.skillOffered && swapForm.skillWanted) {
      createSwapRequest({
        fromUserId: user!.id,
        toUserId: selectedUser.id,
        skillOffered: swapForm.skillOffered,
        skillWanted: swapForm.skillWanted,
        message: swapForm.message,
        status: 'pending'
      });
      
      setSelectedUser(null);
      setSwapForm({ skillOffered: '', skillWanted: '', message: '' });
      setActiveTab('requests');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setRatingFilter('all');
    setAvailabilityFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Skills</h1>
        <p className="text-gray-600">Discover amazing people and their skills in our community</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="space-y-4">
          {/* Main Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for skills you want to learn (e.g., React, Photography, Spanish...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {availableLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Any Time</option>
                {availabilityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || locationFilter || ratingFilter !== 'all' || availabilityFilter !== 'all') && (
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Skill: {searchTerm}
                </span>
              )}
              {locationFilter && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Location: {locationFilter}
                </span>
              )}
              {ratingFilter !== 'all' && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  Rating: {ratingFilter}+ stars
                </span>
              )}
              {availabilityFilter !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Available: {availabilityFilter}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} found
              {searchTerm && ` for "${searchTerm}"`}
            </span>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((searchUser) => (
          <div
            key={searchUser.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {searchUser.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{searchUser.name}</h3>
                    {searchUser.location && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{searchUser.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{searchUser.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered</h4>
                  <div className="flex flex-wrap gap-1">
                    {searchUser.skillsOffered.slice(0, 3).map((skill, index) => {
                      const isHighlighted = searchTerm && 
                        skill.toLowerCase().includes(searchTerm.toLowerCase());
                      return (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            isHighlighted 
                              ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300' 
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                    {searchUser.skillsOffered.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{searchUser.skillsOffered.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Looking For</h4>
                  <div className="flex flex-wrap gap-1">
                    {searchUser.skillsWanted.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {searchUser.skillsWanted.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{searchUser.skillsWanted.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {searchUser.availability.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Available</h4>
                    <div className="flex flex-wrap gap-1">
                      {searchUser.availability.map((time, index) => {
                        const isHighlighted = availabilityFilter === time;
                        return (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded-full ${
                              isHighlighted
                                ? 'bg-green-200 text-green-800 ring-2 ring-green-300'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {time}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{searchUser.totalSwaps} swaps completed</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Joined {new Date(searchUser.joinDate).getFullYear()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(searchUser)}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Request Swap</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty States */}
      {filteredUsers.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-4">
            No one is currently offering "{searchTerm}". Try searching for different skills or check your spelling.
          </p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear search and browse all skills
          </button>
        </div>
      )}

      {filteredUsers.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {allUsers.length === 0 
              ? "No users have registered yet. Be the first to join our community!"
              : "Try adjusting your filters to see more results."
            }
          </p>
        </div>
      )}

      {/* Swap Request Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Request Swap with {selectedUser.name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Skill to Offer
                </label>
                <select
                  value={swapForm.skillOffered}
                  onChange={(e) => setSwapForm({...swapForm, skillOffered: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a skill to offer</option>
                  {user?.skillsOffered.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
                {user?.skillsOffered.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    You need to add skills to your profile first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill You Want from {selectedUser.name}
                </label>
                <select
                  value={swapForm.skillWanted}
                  onChange={(e) => setSwapForm({...swapForm, skillWanted: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a skill you want</option>
                  {selectedUser.skillsOffered.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={swapForm.message}
                  onChange={(e) => setSwapForm({...swapForm, message: e.target.value})}
                  placeholder="Introduce yourself and explain why you'd like to make this swap..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSwap}
                  disabled={!swapForm.skillOffered || !swapForm.skillWanted}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
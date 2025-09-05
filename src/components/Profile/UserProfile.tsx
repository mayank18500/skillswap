import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Camera, MapPin, Clock, Eye, EyeOff, Save } from 'lucide-react';
import { AutocompleteInput } from '../UI/AutocompleteInput';
import { SkillsInput } from '../UI/SkillsInput';
import { popularCities, popularSkills } from '../../data/suggestions';

export const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
    availability: user?.availability || [],
    isPublic: user?.isPublic || true
  });

  // Sync internal state with user prop whenever it changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        location: user.location || '',
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
        availability: user.availability || [],
        isPublic: user.isPublic,
      });
    }
  }, [user]);

  const availabilityOptions = ['Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings'];

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const toggleAvailability = (option: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter(a => a !== option)
        : [...prev.availability, option]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user?.name.charAt(0)}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Camera className="w-3 h-3 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-blue-100">Member since {user?.joinDate}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-blue-100">
                    <span className="text-sm">⭐ {user?.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-100">
                    <span className="text-sm">{user?.totalSwaps} swaps</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    {isEditing ? (
                      <AutocompleteInput
                        value={formData.location}
                        onChange={(value) => setFormData({...formData, location: value})}
                        options={popularCities}
                        placeholder="City, State/Country"
                        icon={<MapPin className="w-4 h-4" />}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{user?.location || 'Not specified'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {formData.isPublic ? (
                        <Eye className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">Public Profile</p>
                        <p className="text-sm text-gray-600">
                          Others can find and contact you for skill swaps
                        </p>
                      </div>
                    </div>
                    {isEditing && (
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills and Availability */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills You Offer
                    </label>
                    {isEditing ? (
                      <SkillsInput
                        selected={formData.skillsOffered}
                        onChange={(skills) => setFormData({...formData, skillsOffered: skills})}
                        options={popularSkills}
                        placeholder="Type to search and add skills..."
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user?.skillsOffered.length ? (
                          user.skillsOffered.map((skill, index) => (
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
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills You Want
                    </label>
                    {isEditing ? (
                      <SkillsInput
                        selected={formData.skillsWanted}
                        onChange={(skills) => setFormData({...formData, skillsWanted: skills})}
                        options={popularSkills}
                        placeholder="Type to search and add skills..."
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user?.skillsWanted.length ? (
                          user.skillsWanted.map((skill, index) => (
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
                    )}
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                <div className="flex items-center space-x-2 text-gray-600 mb-3">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">When are you available for skill swaps?</span>
                </div>

                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {availabilityOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleAvailability(option)}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
                          formData.availability.includes(option)
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        } border`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user?.availability.length ? (
                      user.availability.map((time, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium"
                        >
                          {time}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No availability specified</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
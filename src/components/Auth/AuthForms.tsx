import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Shield, Loader} from 'lucide-react';
import { AutocompleteInput } from '../UI/AutocompleteInput';
import { SkillsInput } from '../UI/SkillsInput';
import { popularCities, popularSkills } from '../../data/suggestions';
import { supabase } from '../../supabaseClient';
import { DatabaseService } from '../../services/database';

export const AuthForms: React.FC = () => {
  const { isLoading, login } = useAuth(); // Removed `register` and `updateUser`
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    skillsOffered: [] as string[],
    skillsWanted: [] as string[],
    availability: [] as string[],
    isPublic: true
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availabilityOptions = ['Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings'];

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(formData.email));
  }, [formData.email]);

  useEffect(() => {
    setIsPasswordValid(formData.password.length >= 6);
  }, [formData.password]);

  const registerUser = async (userData: typeof formData) => {
    setIsSubmitting(true); // Use setIsSubmitting instead of undefined setIsLoading
    setError('');
    setSuccessMessage('');

    try {
      // First, create user in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Then, create the user profile in the database
        const newUserProfile = {
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          location: userData.location,
          skillsOffered: userData.skillsOffered,
          skillsWanted: userData.skillsWanted,
          availability: userData.availability,
          isPublic: userData.isPublic,
          role: 'user',
          rating: 5.0,
          totalSwaps: 0,
          joinDate: new Date().toISOString().split('T')[0],
          isActive: true
        };

        await DatabaseService.createUser(newUserProfile);
        setSuccessMessage('Registration successful! Please check your email to verify your account.');
        setFormData({
          name: '',
          email: '',
          password: '',
          location: '',
          skillsOffered: [],
          skillsWanted: [],
          availability: [],
          isPublic: true
        });
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. The email might already be in use or an unexpected error occurred.');
    } finally {
      setIsSubmitting(false); // Use setIsSubmitting instead of undefined setIsLoading
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    if (!isLoginMode) {
      if (!formData.name.trim()) {
        setError('Please enter your name');
        setIsSubmitting(false);
        return;
      }
      if (!isEmailValid) {
        setError('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }
      if (!isPasswordValid) {
        setError('Password must be at least 6 characters');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (isLoginMode) {
        const success = await login(formData.email, formData.password);
        if (!success) {
          setError('Invalid email or password');
        }
      } else {
        // Call the new registration function
        await registerUser(formData);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = (option: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter(a => a !== option)
        : [...prev.availability, option]
    }));
  };

  // Simplified disabled logic
  const isFormValid = isLoginMode || (isEmailValid && isPasswordValid && formData.name.trim());
  const isDisabled = isLoading || isSubmitting || !isFormValid;


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SkillSwap
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isLoginMode ? 'Welcome back!' : 'Join the community'}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {isLoginMode 
              ? 'Sign in to continue your skill sharing journey'
              : 'Connect with others and exchange your skills'
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(true);
                  setError('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  isLoginMode
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isLoginMode
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (Optional)
                  </label>
                  <AutocompleteInput
                    value={formData.location}
                    onChange={(value) => setFormData({...formData, location: value})}
                    options={popularCities}
                    placeholder="City, State/Country"
                    icon={<MapPin className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills You Offer
                  </label>
                  <SkillsInput
                    selected={formData.skillsOffered}
                    onChange={(skills) => setFormData({...formData, skillsOffered: skills})}
                    options={popularSkills}
                    placeholder="Type to search and add skills..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills You Want
                  </label>
                  <SkillsInput
                    selected={formData.skillsWanted}
                    onChange={(skills) => setFormData({...formData, skillsWanted: skills})}
                    options={popularSkills}
                    placeholder="Type to search and add skills..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availabilityOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleAvailability(option)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                          formData.availability.includes(option)
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        } border`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                    Make my profile public (others can find and contact me)
                  </label>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isDisabled}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin mr-2 w-4 h-4" />
                  {isLoginMode ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : isLoginMode ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {isLoginMode && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Accounts:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>User:</strong> alice@example.com / password123</div>
                <div><strong>Admin:</strong> admin@skillswap.com / admin</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
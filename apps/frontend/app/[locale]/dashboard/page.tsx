'use client';

import { useTranslations } from 'next-intl';
import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { EnhancedUserProfile, UserStats } from '@/types/user';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { user, signOut, loading } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState<EnhancedUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile data
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      setError(null);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
      });

      // Fetch user profile from backend
      const profile = (await Promise.race([
        api.get<EnhancedUserProfile>('/api/v1/auth/me'),
        timeoutPromise,
      ])) as EnhancedUserProfile;

      // Mock stats for now - this would come from a dedicated stats endpoint
      const stats: UserStats = {
        total_optimizations: 0,
        free_optimizations_used: 0,
        free_optimizations_limit: 3,
        subscription_status: 'free',
        last_optimization: undefined,
      };

      setUserProfile({ ...profile, stats });
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);

      // If API fails, create basic profile from user data
      if (user) {
        const fallbackProfile: EnhancedUserProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          bio: user.user_metadata?.bio,
          created_at: user.created_at,
          updated_at: user.updated_at,
          stats: {
            total_optimizations: 0,
            free_optimizations_used: 0,
            free_optimizations_limit: 3,
            subscription_status: 'free',
            last_optimization: undefined,
          },
        };
        setUserProfile(fallbackProfile);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? 'Loading session...' : 'Loading profile...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Resume Matcher</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.full_name || user?.email || 'User'}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(userProfile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userProfile?.stats.subscription_status === 'premium' ? 'Premium' : 'Free User'}
                  </p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userProfile?.full_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-gray-600">
              Here's your resume optimization dashboard. Track your progress and manage your
              account.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Optimizations
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {userProfile?.stats.total_optimizations || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Free Optimizations
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {userProfile?.stats.free_optimizations_used || 0}/
                      {userProfile?.stats.free_optimizations_limit || 3}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 ${userProfile?.stats.subscription_status === 'premium' ? 'bg-purple-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}
                  >
                    <svg
                      className={`w-5 h-5 ${userProfile?.stats.subscription_status === 'premium' ? 'text-purple-600' : 'text-gray-600'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Subscription</dt>
                    <dd
                      className={`text-lg font-semibold capitalize ${userProfile?.stats.subscription_status === 'premium' ? 'text-purple-600' : 'text-gray-900'}`}
                    >
                      {userProfile?.stats.subscription_status || 'Free'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Last Optimization
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {userProfile?.stats.last_optimization
                        ? new Date(userProfile.stats.last_optimization).toLocaleDateString()
                        : 'Never'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/upload"
                    className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <h4 className="mt-2 text-sm font-medium text-gray-900">Upload Resume</h4>
                      <p className="text-xs text-gray-500">Start optimizing your resume</p>
                    </div>
                  </Link>

                  <Link
                    href="/optimizations"
                    className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <h4 className="mt-2 text-sm font-medium text-gray-900">View History</h4>
                      <p className="text-xs text-gray-500">See your optimization history</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Progress Overview */}
              {userProfile?.stats.subscription_status === 'free' && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg shadow text-white">
                  <h3 className="text-lg font-medium mb-2">Upgrade to Premium</h3>
                  <p className="mb-4 text-indigo-100">
                    Get unlimited resume optimizations, advanced AI features, and priority support.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-100">
                        You've used {userProfile.stats.free_optimizations_used} of{' '}
                        {userProfile.stats.free_optimizations_limit} free optimizations
                      </p>
                      <div className="mt-2 w-full bg-indigo-400 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all duration-300"
                          style={{
                            width: `${(userProfile.stats.free_optimizations_used / userProfile.stats.free_optimizations_limit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <Link
                      href="/pricing"
                      className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50"
                    >
                      Upgrade Now
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* User Profile Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                <div className="text-center mb-4">
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt={userProfile.full_name || user?.email || 'User'}
                      className="mx-auto h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mx-auto h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-medium">
                        {(userProfile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h4 className="mt-4 text-lg font-medium text-gray-900">
                    {userProfile?.full_name || 'Your Name'}
                  </h4>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  {userProfile?.bio && (
                    <p className="mt-2 text-sm text-gray-600">{userProfile.bio}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Link
                    href="/profile"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Settings
                  </Link>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {userProfile?.created_at
                        ? new Date(userProfile.created_at).toLocaleDateString()
                        : 'Unknown'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userProfile?.stats.subscription_status === 'premium'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {userProfile?.stats.subscription_status === 'premium' ? 'Premium' : 'Free'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Sign In</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : 'First time'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

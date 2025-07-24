"use client";

// GL-0603: Session Status Component
// Sprint 6: JuliaOS Wallet Integration
// Gujarat LandChain × JuliaOS Project

/*
Session Status Component
- Objective: Display session information and provide session management controls
- Features: Session countdown, user info, logout button, session refresh
- Integration: Shows session status in the application header or sidebar
*/

import React, { useState } from 'react';
import { useSession, useSessionCountdown } from '../hooks/useSession';

interface SessionStatusProps {
  variant?: 'compact' | 'full' | 'dropdown';
  showCountdown?: boolean;
  showUserInfo?: boolean;
  className?: string;
}

const SessionStatus: React.FC<SessionStatusProps> = ({
  variant = 'full',
  showCountdown = true,
  showUserInfo = true,
  className = ''
}) => {
  const { isAuthenticated, currentSession, isLoading, timeUntilExpiry, logout, refreshSession } = useSession();
  const countdown = useSessionCountdown();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const handleRefresh = async () => {
    await refreshSession();
  };

  const getSessionStatusColor = () => {
    if (!timeUntilExpiry) return 'text-gray-500';
    if (timeUntilExpiry < 60000) return 'text-red-500'; // Less than 1 minute
    if (timeUntilExpiry < 300000) return 'text-yellow-500'; // Less than 5 minutes
    return 'text-green-500';
  };

  const getSessionStatusIcon = () => {
    if (!timeUntilExpiry) return '🔴';
    if (timeUntilExpiry < 60000) return '⚠️';
    if (timeUntilExpiry < 300000) return '🟡';
    return '🟢';
  };

  // Compact variant for header
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className={getSessionStatusColor()}>
          {getSessionStatusIcon()}
        </span>
        {showCountdown && countdown && (
          <span className={`text-sm font-mono ${getSessionStatusColor()}`}>
            {countdown}
          </span>
        )}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  // Full variant with all information
  if (variant === 'full') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Session Status</h3>
          <span className={getSessionStatusColor()}>
            {getSessionStatusIcon()}
          </span>
        </div>

        {showUserInfo && currentSession && (
          <div className="mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {currentSession.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currentSession.name}</p>
                <p className="text-xs text-gray-500">
                  {currentSession.verified ? '✅ Verified' : '❌ Not Verified'}
                </p>
              </div>
            </div>
          </div>
        )}

        {showCountdown && countdown && (
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Session expires in:</span>
              <span className={`text-sm font-mono font-medium ${getSessionStatusColor()}`}>
                {countdown}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  timeUntilExpiry && timeUntilExpiry < 60000
                    ? 'bg-red-500'
                    : timeUntilExpiry && timeUntilExpiry < 300000
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: timeUntilExpiry
                    ? `${Math.max((timeUntilExpiry / (60 * 60 * 1000)) * 100, 1)}%`
                    : '0%'
                }}
              />
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-3 py-2 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
      >
        <span className={getSessionStatusColor()}>
          {getSessionStatusIcon()}
        </span>
        {showUserInfo && currentSession && (
          <span className="text-sm font-medium text-gray-900">
            {currentSession.name}
          </span>
        )}
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            {showUserInfo && currentSession && (
              <div className="mb-3 pb-3 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {currentSession.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{currentSession.name}</p>
                    <p className="text-xs text-gray-500">
                      {currentSession.verified ? '✅ Verified User' : '❌ Not Verified'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showCountdown && countdown && (
              <div className="mb-3 pb-3 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Session expires:</span>
                  <span className={`text-sm font-mono font-medium ${getSessionStatusColor()}`}>
                    {countdown}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '🔄 Refreshing...' : '🔄 Refresh Session'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionStatus; 
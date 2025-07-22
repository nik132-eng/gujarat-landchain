// GL-0603: Session Refresh Token (JWT) Implementation
// Sprint 6: JuliaOS Wallet Integration
// Gujarat LandChain × JuliaOS Project

/*
JWT Session Management System
- Objective: Secure session management with automatic token refresh
- Features: 60-minute token expiry, automatic refresh, secure storage
- Integration: Foundation for authenticated user sessions and API calls
*/

import React, { createContext, useContext, useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';

// JWT Session Management Context
const SessionContext = createContext();

// JWT Session Provider Component
export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // JWT Configuration
  const JWT_CONFIG = {
    ACCESS_TOKEN_EXPIRY: 60 * 60 * 1000, // 60 minutes in milliseconds
    REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh when 5 minutes remaining
    SECRET_KEY: 'gujarat_landchain_jwt_secret_2025', // In production, use environment variable
    ISSUER: 'gujarat-landchain',
    AUDIENCE: 'juliaos-wallet'
  };

  // Initialize session on component mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Set up token refresh timer
  useEffect(() => {
    if (accessToken && sessionExpiry) {
      const timeUntilRefresh = sessionExpiry - Date.now() - JWT_CONFIG.REFRESH_THRESHOLD;
      
      if (timeUntilRefresh > 0) {
        const refreshTimer = setTimeout(() => {
          refreshAccessToken();
        }, timeUntilRefresh);

        return () => clearTimeout(refreshTimer);
      }
    }
  }, [accessToken, sessionExpiry]);

  // Initialize session from stored tokens
  const initializeSession = async () => {
    try {
      const storedAccessToken = localStorage.getItem('access_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user_data');

      if (storedAccessToken && storedRefreshToken) {
        // Validate stored access token
        const tokenData = validateJWTToken(storedAccessToken);
        
        if (tokenData && tokenData.exp * 1000 > Date.now()) {
          // Token is still valid
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setSessionExpiry(tokenData.exp * 1000);
          setUser(JSON.parse(storedUser || '{}'));
          setIsAuthenticated(true);
        } else {
          // Token expired, try to refresh
          await refreshAccessToken(storedRefreshToken);
        }
      }
    } catch (error) {
      console.error('Session initialization error:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Create JWT token
  const createJWTToken = (payload, expiryTime) => {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const exp = Math.floor((Date.now() + expiryTime) / 1000);

    const tokenPayload = {
      ...payload,
      iss: JWT_CONFIG.ISSUER,
      aud: JWT_CONFIG.AUDIENCE,
      iat: now,
      exp: exp,
      jti: generateTokenId()
    };

    // Create token parts
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(tokenPayload));
    
    // Create signature (simplified for demo - use proper HMAC in production)
    const signature = CryptoJS.HmacSHA256(
      `${encodedHeader}.${encodedPayload}`,
      JWT_CONFIG.SECRET_KEY
    ).toString();

    return `${encodedHeader}.${encodedPayload}.${btoa(signature)}`;
  };

  // Validate JWT token
  const validateJWTToken = (token) => {
    try {
      const [header, payload, signature] = token.split('.');
      
      if (!header || !payload || !signature) {
        throw new Error('Invalid token format');
      }

      // Decode payload
      const decodedPayload = JSON.parse(atob(payload));
      
      // Verify signature (simplified for demo)
      const expectedSignature = CryptoJS.HmacSHA256(
        `${header}.${payload}`,
        JWT_CONFIG.SECRET_KEY
      ).toString();
      
      const actualSignature = atob(signature);
      
      if (expectedSignature !== actualSignature) {
        throw new Error('Invalid token signature');
      }

      // Check expiry
      if (decodedPayload.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }

      return decodedPayload;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  };

  // Generate unique token ID
  const generateTokenId = () => {
    return CryptoJS.lib.WordArray.random(16).toString();
  };

  // Login with user credentials
  const login = async (userData) => {
    try {
      // Create access token (60 minutes)
      const accessTokenPayload = {
        sub: userData.userId,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user',
        verified: userData.verified || false,
        wallet_connected: userData.walletConnected || false
      };

      const newAccessToken = createJWTToken(accessTokenPayload, JWT_CONFIG.ACCESS_TOKEN_EXPIRY);
      
      // Create refresh token (7 days)
      const refreshTokenPayload = {
        sub: userData.userId,
        type: 'refresh',
        device_id: getDeviceId()
      };

      const newRefreshToken = createJWTToken(refreshTokenPayload, JWT_CONFIG.REFRESH_TOKEN_EXPIRY);

      // Store tokens securely
      localStorage.setItem('access_token', newAccessToken);
      localStorage.setItem('refresh_token', newRefreshToken);
      localStorage.setItem('user_data', JSON.stringify(userData));

      // Update state
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setSessionExpiry(Date.now() + JWT_CONFIG.ACCESS_TOKEN_EXPIRY);
      setUser(userData);
      setIsAuthenticated(true);

      console.log('User logged in successfully');
      return { success: true, token: newAccessToken };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async (providedRefreshToken = null) => {
    try {
      const currentRefreshToken = providedRefreshToken || refreshToken;
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      // Validate refresh token
      const refreshTokenData = validateJWTToken(currentRefreshToken);
      
      if (!refreshTokenData || refreshTokenData.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Get current user data
      const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
      
      // Create new access token
      const accessTokenPayload = {
        sub: refreshTokenData.sub,
        name: storedUser.name,
        email: storedUser.email,
        role: storedUser.role || 'user',
        verified: storedUser.verified || false,
        wallet_connected: storedUser.walletConnected || false
      };

      const newAccessToken = createJWTToken(accessTokenPayload, JWT_CONFIG.ACCESS_TOKEN_EXPIRY);

      // Store new access token
      localStorage.setItem('access_token', newAccessToken);

      // Update state
      setAccessToken(newAccessToken);
      setSessionExpiry(Date.now() + JWT_CONFIG.ACCESS_TOKEN_EXPIRY);
      setIsAuthenticated(true);

      console.log('Access token refreshed successfully');
      return { success: true, token: newAccessToken };
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return { success: false, error: error.message };
    }
  };

  // Logout user and clear session
  const logout = () => {
    // Clear tokens from storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('juliaos_wallet');
    localStorage.removeItem('wallet_metadata');

    // Clear state
    setAccessToken(null);
    setRefreshToken(null);
    setSessionExpiry(null);
    setUser(null);
    setIsAuthenticated(false);

    console.log('User logged out successfully');
  };

  // Get device ID for device-specific refresh tokens
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    
    if (!deviceId) {
      deviceId = CryptoJS.lib.WordArray.random(32).toString();
      localStorage.setItem('device_id', deviceId);
    }
    
    return deviceId;
  };

  // Check if token needs refresh
  const needsRefresh = () => {
    if (!sessionExpiry) return false;
    return (sessionExpiry - Date.now()) <= JWT_CONFIG.REFRESH_THRESHOLD;
  };

  // Get authorization header for API calls
  const getAuthHeaders = () => {
    if (!accessToken) return {};
    
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  };

  // Make authenticated API call with automatic token refresh
  const authenticatedFetch = async (url, options = {}) => {
    try {
      // Check if token needs refresh
      if (needsRefresh()) {
        await refreshAccessToken();
      }

      // Make API call with auth headers
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...getAuthHeaders()
        }
      });

      // Handle 401 (Unauthorized) - try to refresh token
      if (response.status === 401) {
        const refreshResult = await refreshAccessToken();
        
        if (refreshResult.success) {
          // Retry request with new token
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              ...getAuthHeaders()
            }
          });
        } else {
          logout();
          throw new Error('Authentication failed');
        }
      }

      return response;
    } catch (error) {
      console.error('Authenticated fetch error:', error);
      throw error;
    }
  };

  // Get session status
  const getSessionStatus = () => {
    if (!isAuthenticated || !sessionExpiry) {
      return { status: 'unauthenticated', timeRemaining: 0 };
    }

    const timeRemaining = sessionExpiry - Date.now();
    
    if (timeRemaining <= 0) {
      return { status: 'expired', timeRemaining: 0 };
    }

    if (timeRemaining <= JWT_CONFIG.REFRESH_THRESHOLD) {
      return { status: 'refreshing', timeRemaining };
    }

    return { status: 'active', timeRemaining };
  };

  // Session context value
  const contextValue = {
    // State
    user,
    accessToken,
    refreshToken,
    sessionExpiry,
    isAuthenticated,
    isLoading,

    // Methods
    login,
    logout,
    refreshAccessToken,
    authenticatedFetch,
    getAuthHeaders,
    getSessionStatus,
    validateJWTToken,

    // Utils
    needsRefresh
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

// Hook to use session context
export const useSession = () => {
  const context = useContext(SessionContext);
  
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  
  return context;
};

// Session Status Component
export const SessionStatus = () => {
  const { getSessionStatus, isAuthenticated, user } = useSession();
  const [status, setStatus] = useState({ status: 'unauthenticated', timeRemaining: 0 });

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getSessionStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000); // Update every second

    return () => clearInterval(interval);
  }, [getSessionStatus]);

  const formatTimeRemaining = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-sm">Not authenticated</span>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'active': return 'text-green-600';
      case 'refreshing': return 'text-yellow-600';
      case 'expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusDot = () => {
    switch (status.status) {
      case 'active': return 'bg-green-400';
      case 'refreshing': return 'bg-yellow-400';
      case 'expired': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusDot()}`}></div>
      <span className="text-sm">
        {user?.name} • Session: {formatTimeRemaining(status.timeRemaining)}
      </span>
    </div>
  );
};

// Protected Route Component
export const ProtectedRoute = ({ children, fallback = null }) => {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access this page.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Auto-logout warning component
export const AutoLogoutWarning = () => {
  const { getSessionStatus, refreshAccessToken, logout } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const checkSession = () => {
      const status = getSessionStatus();
      
      if (status.status === 'refreshing' && status.timeRemaining > 0) {
        setShowWarning(true);
        setTimeRemaining(status.timeRemaining);
      } else {
        setShowWarning(false);
      }
    };

    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, [getSessionStatus]);

  const handleExtendSession = async () => {
    const result = await refreshAccessToken();
    if (result.success) {
      setShowWarning(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">Session Expiring Soon</h3>
          <p className="text-gray-600 mb-4">
            Your session will expire in {Math.floor(timeRemaining / 60000)} minutes. 
            Would you like to extend your session?
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Logout
            </button>
            <button
              onClick={handleExtendSession}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Extend Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionProvider;

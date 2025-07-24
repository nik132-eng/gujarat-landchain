// GL-0603: Session Management React Hook
// Sprint 6: JuliaOS Wallet Integration
// Gujarat LandChain × JuliaOS Project

/*
Session Management Hook
- Objective: React hook for session management with real-time updates
- Features: Session state, automatic refresh, permission checking, logout functionality
- Integration: Provides session data to React components
*/

import { useState, useEffect, useCallback } from 'react';

// User session data interface
export interface UserSession {
  userId: string;
  aadhaarHash: string;
  name: string;
  verified: boolean;
  walletId?: string;
  permissions: string[];
  lastLogin: number;
  sessionId: string;
}

// Session state interface
interface SessionState {
  isAuthenticated: boolean;
  currentSession: UserSession | null;
  isLoading: boolean;
  timeUntilExpiry: number | null;
  hasPermission: (permission: string) => boolean;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateWalletData: (walletId: string) => void;
}

// Mock session data for development
const mockSession: UserSession = {
  userId: 'user_1',
  aadhaarHash: 'aadhaar_hash_123',
  name: 'Rajesh Patel',
  verified: true,
  walletId: 'wallet_123',
  permissions: ['create_listing', 'edit_listing', 'delete_listing', 'view_inquiries', 'respond_inquiries', 'governance_vote', 'view_evidence', 'assign_cases', 'make_decisions'],
  lastLogin: Date.now(),
  sessionId: 'session_123'
};

// Custom hook for session management
export const useSession = (): SessionState => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(mockSession);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    return currentSession?.permissions.includes(permission) || false;
  }, [currentSession]);

  // Update time until expiry
  const updateTimeUntilExpiry = useCallback(() => {
    // Mock: session expires in 1 hour
    const expiry = Date.now() + 60 * 60 * 1000;
    const timeLeft = Math.max(expiry - Date.now(), 0);
    setTimeUntilExpiry(timeLeft);
  }, []);

  // Refresh session manually
  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateTimeUntilExpiry();
    } catch (error) {
      console.error('Session refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [updateTimeUntilExpiry]);

  // Update wallet data in session
  const updateWalletData = useCallback((walletId: string) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, walletId } : null);
    }
  }, [currentSession]);

  // Logout function
  const logout = useCallback(() => {
    setCurrentSession(null);
    setIsAuthenticated(false);
    setTimeUntilExpiry(null);
    // In a real app, you would clear localStorage and redirect
    console.log('User logged out');
  }, []);

  // Effect to update time until expiry
  useEffect(() => {
    updateTimeUntilExpiry();

    // Update every minute
    const interval = setInterval(updateTimeUntilExpiry, 60000);

    return () => clearInterval(interval);
  }, [updateTimeUntilExpiry]);

  // Effect to show warning when session is about to expire
  useEffect(() => {
    if (timeUntilExpiry && timeUntilExpiry < 300000) { // 5 minutes
      // Show warning notification
      if (timeUntilExpiry < 60000) { // 1 minute
        console.warn('Session expires in less than 1 minute');
      } else {
        console.warn(`Session expires in ${Math.floor(timeUntilExpiry / 60000)} minutes`);
      }
    }
  }, [timeUntilExpiry]);

  return {
    isAuthenticated,
    currentSession,
    isLoading,
    timeUntilExpiry,
    hasPermission,
    logout,
    refreshSession,
    updateWalletData
  };
};

// Hook for session expiry countdown
export const useSessionCountdown = () => {
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      // Mock: session expires in 1 hour
      const expiry = Date.now() + 60 * 60 * 1000;
      const timeLeft = Math.max(expiry - Date.now(), 0);
      
      if (timeLeft === 0) {
        setCountdown('');
        return;
      }

      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      
      if (minutes > 0) {
        setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return countdown;
};

// Hook for permission-based component rendering
export const usePermission = (requiredPermission: string) => {
  const { hasPermission, isAuthenticated } = useSession();
  
  return {
    hasPermission: isAuthenticated && hasPermission(requiredPermission),
    isAuthenticated
  };
};

// Hook for wallet integration
export const useWalletSession = () => {
  const { currentSession, updateWalletData } = useSession();
  
  return {
    walletId: currentSession?.walletId,
    hasWallet: !!currentSession?.walletId,
    updateWalletData
  };
}; 
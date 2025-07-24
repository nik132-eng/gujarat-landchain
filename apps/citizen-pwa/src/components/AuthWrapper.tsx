// GL-0603: Authentication Wrapper Component
// Sprint 6: JuliaOS Wallet Integration
// Gujarat LandChain × JuliaOS Project

/*
Authentication Wrapper Component
- Objective: Protect routes and handle authentication flow
- Features: Route protection, authentication checks, redirect handling
- Integration: Wraps protected components and handles auth state
*/

"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from '../hooks/useSession';
import AadhaarAuthentication from '../../frontend/components/AadhaarAuthentication';
import JuliaOSWallet from '../../frontend/components/JuliaOSWallet';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireWallet?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  requireAuth = true,
  requireWallet = false,
  fallback,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, currentSession } = useSession();
  const [currentStep, setCurrentStep] = useState<'auth' | 'wallet' | 'complete'>('auth');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Determine current step based on authentication state
    if (!isAuthenticated) {
      setCurrentStep('auth');
    } else if (requireWallet && !currentSession?.walletId) {
      setCurrentStep('wallet');
    } else {
      setCurrentStep('complete');
    }
    setIsLoading(false);
  }, [isAuthenticated, currentSession?.walletId, requireWallet]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no authentication required, render children directly
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Show authentication step
  if (currentStep === 'auth') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gujarat LandChain
            </h1>
            <p className="text-gray-600">
              Secure land registry powered by blockchain
            </p>
          </div>
          <AadhaarAuthentication />
        </div>
      </div>
    );
  }

  // Show wallet setup step
  if (currentStep === 'wallet') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Setup Your Wallet
            </h1>
            <p className="text-gray-600">
              Create or restore your JuliaOS wallet to continue
            </p>
          </div>
          <JuliaOSWallet />
        </div>
      </div>
    );
  }

  // Show protected content
  if (currentStep === 'complete') {
    return <>{children}</>;
  }

  // Fallback for unexpected states
  return fallback || (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Something went wrong. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

// Higher-order component for route protection
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthWrapperProps, 'children'> = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <AuthWrapper {...options}>
      <Component {...props} />
    </AuthWrapper>
  );

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for conditional rendering based on auth state
export const useAuthGuard = (requireWallet = false) => {
  const { isAuthenticated, currentSession } = useSession();
  
  return {
    canAccess: isAuthenticated && (!requireWallet || !!currentSession?.walletId),
    isAuthenticated,
    hasWallet: !!currentSession?.walletId,
    currentSession
  };
};

export default AuthWrapper; 
// Sprint 6: JuliaOS Wallet Integration - Main Component
// Gujarat LandChain × JuliaOS Project
// Combines GL-0601, GL-0602, GL-0603 implementations

/*
Main Wallet Integration Flow:
1. Aadhaar OTP Authentication (GL-0601)
2. Wallet Create/Restore (GL-0602)  
3. Session Management (GL-0603)
*/

import React, { useState, useEffect } from 'react';
import AadhaarAuthentication from './AadhaarAuthentication';
import JuliaOSWallet from './JuliaOSWallet';
import { SessionProvider, useSession, SessionStatus, ProtectedRoute, AutoLogoutWarning } from '../context/SessionContext';

// Main Wallet Integration App
const WalletIntegrationApp = () => {
  const [currentStep, setCurrentStep] = useState('authentication'); // authentication, wallet, dashboard
  const [authData, setAuthData] = useState(null);
  const { login, isAuthenticated, user } = useSession();

  // Check authentication status on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      // User is already authenticated, skip to appropriate step
      const hasWallet = localStorage.getItem('juliaos_wallet');
      setCurrentStep(hasWallet ? 'dashboard' : 'wallet');
    }
  }, [isAuthenticated, user]);

  // Handle successful Aadhaar authentication
  const handleAuthSuccess = async (userData) => {
    try {
      // Login with session management
      const loginResult = await login({
        userId: userData.userId || 'user_' + Date.now(),
        name: userData.name,
        email: userData.email || '',
        verified: true,
        walletConnected: false
      });

      if (loginResult.success) {
        setAuthData(userData);
        setCurrentStep('wallet');
      } else {
        console.error('Login failed:', loginResult.error);
      }
    } catch (error) {
      console.error('Authentication success handler error:', error);
    }
  };

  // Handle successful wallet setup
  const handleWalletSuccess = (walletData) => {
    // Update user session with wallet connection status
    const updatedUser = {
      ...user,
      walletConnected: true,
      walletId: walletData.id
    };

    // Store updated user data
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    
    setCurrentStep('dashboard');
  };

  // Render authentication step
  const renderAuthenticationStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gujarat LandChain</h1>
          <p className="text-gray-600">Secure blockchain-powered land registry</p>
        </div>
        
        <AadhaarAuthentication onSuccess={handleAuthSuccess} />
      </div>
    </div>
  );

  // Render wallet setup step
  const renderWalletStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Your Wallet</h1>
          <p className="text-gray-600">Create or restore your JuliaOS wallet for blockchain transactions</p>
        </div>
        
        <JuliaOSWallet onSuccess={handleWalletSuccess} />
      </div>
    </div>
  );

  // Render main dashboard
  const renderDashboard = () => (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900">Gujarat LandChain</h1>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <a href="#" className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium">Dashboard</a>
                    <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Properties</a>
                    <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Transactions</a>
                    <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Documents</a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <SessionStatus />
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Welcome Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Welcome back</dt>
                      <dd className="text-lg font-medium text-gray-900">{user?.name || 'User'}</dd>
                    </dl>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✅ Verified & Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Authentication Status</dt>
                        <dd className="text-lg font-medium text-gray-900">Aadhaar Verified</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Wallet Status</dt>
                        <dd className="text-lg font-medium text-gray-900">JuliaOS Connected</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Session Status</dt>
                        <dd className="text-lg font-medium text-gray-900">Active & Secure</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Property Registry</h3>
                  </div>
                  <p className="text-gray-600 mb-4">View and manage your registered properties on the blockchain.</p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">View Properties →</button>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Transfer Property</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Securely transfer property ownership using smart contracts.</p>
                  <button className="text-green-600 hover:text-green-800 font-medium">Start Transfer →</button>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Document Verification</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Verify and validate property documents on the blockchain.</p>
                  <button className="text-purple-600 hover:text-purple-800 font-medium">Verify Documents →</button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by registering your first property.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Auto-logout Warning */}
        <AutoLogoutWarning />
      </div>
    </ProtectedRoute>
  );

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'authentication':
        return renderAuthenticationStep();
      case 'wallet':
        return renderWalletStep();
      case 'dashboard':
        return renderDashboard();
      default:
        return renderAuthenticationStep();
    }
  };

  return renderCurrentStep();
};

// Root App Component with Session Provider
const App = () => {
  return (
    <SessionProvider>
      <WalletIntegrationApp />
    </SessionProvider>
  );
};

export default App;

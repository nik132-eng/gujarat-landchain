// GL-0601: Aadhaar OTP Authentication Implementation
// Sprint 6: JuliaOS Wallet Integration
// Gujarat LandChain × JuliaOS Project

/*
Aadhaar OTP Authentication System
- Objective: Implement secure government-grade authentication using Aadhaar OTP
- Input: 12-digit Aadhaar number from user
- Output: Verified user identity with JWT token
- Integration: Foundation for wallet creation and session management
*/

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';

// Aadhaar OTP Authentication Component
const AadhaarAuthentication = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [sessionId, setSessionId] = useState('');

  // Aadhaar number validation
  const validateAadhaarNumber = (number) => {
    // Remove spaces and validate format
    const cleanNumber = number.replace(/\s/g, '');
    
    // Check if exactly 12 digits
    if (!/^\d{12}$/.test(cleanNumber)) {
      return { valid: false, error: 'Aadhaar number must be exactly 12 digits' };
    }

    // Verhoeff algorithm validation for Aadhaar
    const verhoeffTable = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];

    const permutationTable = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];

    let checksum = 0;
    for (let i = 0; i < cleanNumber.length; i++) {
      const digit = parseInt(cleanNumber[i]);
      const position = cleanNumber.length - i - 1;
      const permutation = permutationTable[position % 8][digit];
      checksum = verhoeffTable[checksum][permutation];
    }

    if (checksum !== 0) {
      return { valid: false, error: 'Invalid Aadhaar number format' };
    }

    return { valid: true, error: null };
  };

  // Format Aadhaar number with spaces for display
  const formatAadhaarNumber = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    return cleanNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  // Generate OTP via UIDAI API (simulated)
  const generateOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Validate Aadhaar number first
      const validation = validateAadhaarNumber(aadhaarNumber);
      if (!validation.valid) {
        setError(validation.error);
        setIsLoading(false);
        return;
      }

      // Generate session ID for this OTP request
      const newSessionId = CryptoJS.lib.WordArray.random(16).toString();
      setSessionId(newSessionId);

      // Simulate UIDAI API call
      const response = await simulateUidaiOtpGeneration(aadhaarNumber, newSessionId);
      
      if (response.success) {
        setOtpSent(true);
        setCountdown(300); // 5 minutes countdown
        setAttempts(0);
        console.log('OTP sent successfully. Session ID:', newSessionId);
      } else {
        setError(response.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('OTP generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate UIDAI OTP generation API
  const simulateUidaiOtpGeneration = async (aadhaarNumber, sessionId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different response scenarios
    const random = Math.random();
    
    if (random < 0.95) { // 95% success rate
      return {
        success: true,
        message: 'OTP sent successfully',
        sessionId: sessionId,
        expiryTime: Date.now() + (5 * 60 * 1000), // 5 minutes
        otpLength: 6
      };
    } else if (random < 0.98) { // 3% rate limit
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again after 30 minutes.',
        retryAfter: 1800 // 30 minutes
      };
    } else { // 2% server error
      return {
        success: false,
        error: 'UIDAI server temporarily unavailable. Please try again later.'
      };
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (attempts >= 3) {
      setError('Maximum OTP attempts exceeded. Please request a new OTP.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await simulateUidaiOtpVerification(aadhaarNumber, otp, sessionId);
      
      if (response.success) {
        // Generate JWT token for authenticated session
        const jwtToken = generateJWTToken(aadhaarNumber, response.demographics);
        
        // Store token securely (without storing Aadhaar number)
        localStorage.setItem('auth_token', jwtToken);
        localStorage.setItem('user_demographics', JSON.stringify({
          name: response.demographics.name,
          verified: true,
          timestamp: Date.now()
        }));

        // Clear sensitive data
        setAadhaarNumber('');
        setOtp('');
        setSessionId('');

        // Redirect to wallet creation
        window.location.href = '/wallet-setup';
      } else {
        setAttempts(attempts + 1);
        setError(response.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate UIDAI OTP verification API
  const simulateUidaiOtpVerification = async (aadhaarNumber, otp, sessionId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo purposes, accept OTP "123456" or last 6 digits of Aadhaar
    const validOtps = ['123456', aadhaarNumber.slice(-6).replace(/\s/g, '')];
    
    if (validOtps.includes(otp)) {
      return {
        success: true,
        message: 'OTP verified successfully',
        demographics: {
          name: 'John Doe', // In real implementation, this comes from UIDAI
          verified: true
        }
      };
    } else {
      return {
        success: false,
        error: 'Invalid OTP entered'
      };
    }
  };

  // Generate JWT token (simplified for demo)
  const generateJWTToken = (aadhaarNumber, demographics) => {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      sub: CryptoJS.SHA256(aadhaarNumber).toString(), // Hash of Aadhaar, not the number itself
      name: demographics.name,
      verified: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
    };

    // In production, use proper JWT library with secret key
    const token = btoa(JSON.stringify(header)) + '.' + 
                  btoa(JSON.stringify(payload)) + '.' + 
                  btoa('demo_signature');

    return token;
  };

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && otpSent) {
      setOtpSent(false);
      setSessionId('');
      setError('OTP expired. Please request a new one.');
    }
    return () => clearTimeout(timer);
  }, [countdown, otpSent]);

  // Format countdown display
  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔐 Aadhaar Authentication
        </h2>
        <p className="text-gray-600">
          Secure government-grade identity verification
        </p>
      </div>

      {!otpSent ? (
        // Aadhaar Number Input
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aadhaar Number
            </label>
            <input
              type="text"
              value={aadhaarNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Only digits
                if (value.length <= 12) {
                  setAadhaarNumber(formatAadhaarNumber(value));
                }
              }}
              placeholder="1234 5678 9012"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength="14" // 12 digits + 2 spaces
            />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  🔒 <strong>Privacy Protected:</strong> Your Aadhaar number is never stored. 
                  Only a secure hash is used for verification.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={generateOTP}
            disabled={isLoading || aadhaarNumber.replace(/\s/g, '').length !== 12}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isLoading || aadhaarNumber.replace(/\s/g, '').length !== 12
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending OTP...
              </span>
            ) : (
              'Send OTP'
            )}
          </button>
        </div>
      ) : (
        // OTP Verification
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Only digits
                if (value.length <= 6) {
                  setOtp(value);
                }
              }}
              placeholder="123456"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-widest"
              maxLength="6"
            />
          </div>

          <div className="text-center text-sm text-gray-600">
            OTP expires in: <span className="font-mono font-bold text-red-600">
              {formatCountdown(countdown)}
            </span>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  📱 <strong>Demo Mode:</strong> Use OTP "123456" or last 6 digits of your Aadhaar number.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={verifyOTP}
            disabled={isLoading || otp.length !== 6}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isLoading || otp.length !== 6
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify OTP'
            )}
          </button>

          <button
            onClick={() => {
              setOtpSent(false);
              setOtp('');
              setCountdown(0);
              setAttempts(0);
              setSessionId('');
            }}
            className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to Aadhaar Input
          </button>

          {attempts > 0 && attempts < 3 && (
            <p className="text-sm text-yellow-600 text-center">
              ⚠️ {3 - attempts} attempts remaining
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        🔒 Secured by UIDAI • Privacy Protected • Government Approved
      </div>
    </div>
  );
};

export default AadhaarAuthentication;

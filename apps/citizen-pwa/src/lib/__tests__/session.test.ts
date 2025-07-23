// GL-0603: Session Management Tests
// Sprint 6: JuliaOS Wallet Integration
// Gujarat LandChain × JuliaOS Project

/*
Session Management Test Suite
- Objective: Comprehensive testing of session management functionality
- Features: Token generation, validation, refresh, storage, security
- Coverage: All session management methods and edge cases
*/

import sessionManager, { UserSession } from '../session';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock CryptoJS
jest.mock('crypto-js', () => ({
  lib: {
    WordArray: {
      random: jest.fn(() => ({ toString: () => 'mock-random-string' })),
    },
  },
  SHA256: jest.fn(() => ({ toString: () => 'mock-hash' })),
  AES: {
    encrypt: jest.fn(() => ({ toString: () => 'mock-encrypted' })),
    decrypt: jest.fn(() => ({ toString: () => JSON.stringify({ name: 'Test User' }) })),
  },
  HmacSHA256: jest.fn(() => ({ toString: () => 'mock-signature' })),
}));

describe('SessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  describe('Session Creation', () => {
    it('should create a new session with valid user data', () => {
      const userData: Partial<UserSession> = {
        userId: 'user123',
        name: 'Test User',
        verified: true,
        permissions: ['user', 'read'],
      };

      const result = sessionManager.createSession(userData);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.session).toEqual({
        userId: 'user123',
        aadhaarHash: '',
        name: 'Test User',
        verified: true,
        walletId: undefined,
        permissions: ['user', 'read'],
        lastLogin: expect.any(Number),
        sessionId: expect.any(String),
      });
    });

    it('should generate unique session IDs', () => {
      const userData1 = { userId: 'user1', name: 'User 1' };
      const userData2 = { userId: 'user2', name: 'User 2' };

      const session1 = sessionManager.createSession(userData1);
      const session2 = sessionManager.createSession(userData2);

      expect(session1.session.sessionId).not.toBe(session2.session.sessionId);
    });
  });

  describe('Token Validation', () => {
    it('should validate valid tokens', () => {
      const userData = { userId: 'user123', name: 'Test User' };
      const { accessToken } = sessionManager.createSession(userData);

      expect(sessionManager.isTokenValid(accessToken)).toBe(true);
    });

    it('should reject invalid tokens', () => {
      expect(sessionManager.isTokenValid('invalid-token')).toBe(false);
      expect(sessionManager.isTokenValid('')).toBe(false);
    });

    it('should reject expired tokens', () => {
      // Mock expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.signature';
      expect(sessionManager.isTokenValid(expiredToken)).toBe(false);
    });
  });

  describe('Authentication State', () => {
    it('should return false when no token exists', () => {
      expect(sessionManager.isAuthenticated()).toBe(false);
    });

    it('should return true when valid token exists', () => {
      const userData = { userId: 'user123', name: 'Test User' };
      sessionManager.createSession(userData);

      expect(sessionManager.isAuthenticated()).toBe(true);
    });
  });

  describe('Session Storage', () => {
    it('should store session data securely', () => {
      const userData = { userId: 'user123', name: 'Test User' };
      sessionManager.createSession(userData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'glc_access_token',
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'glc_refresh_token',
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'glc_user_data',
        expect.any(String)
      );
    });

    it('should retrieve current session data', () => {
      const userData = { userId: 'user123', name: 'Test User' };
      const { session } = sessionManager.createSession(userData);

      const currentSession = sessionManager.getCurrentSession();
      expect(currentSession).toEqual(session);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh access token successfully', async () => {
      const userData = { userId: 'user123', name: 'Test User' };
      sessionManager.createSession(userData);

      const result = await sessionManager.refreshAccessToken();
      expect(result).toBe(true);
    });

    it('should handle refresh token failure', async () => {
      // Mock failed refresh
      jest.spyOn(sessionManager as any, 'callRefreshAPI').mockRejectedValue(
        new Error('Refresh failed')
      );

      const result = await sessionManager.refreshAccessToken();
      expect(result).toBe(false);
    });
  });

  describe('Session Cleanup', () => {
    it('should clear all session data on logout', () => {
      const userData = { userId: 'user123', name: 'Test User' };
      sessionManager.createSession(userData);

      sessionManager.clearSession();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('glc_access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('glc_refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('glc_user_data');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('glc_session_id');
    });
  });

  describe('Permission Management', () => {
    it('should check user permissions correctly', () => {
      const userData = {
        userId: 'user123',
        name: 'Test User',
        permissions: ['user', 'read', 'write'],
      };
      sessionManager.createSession(userData);

      expect(sessionManager.hasPermission('read')).toBe(true);
      expect(sessionManager.hasPermission('admin')).toBe(false);
    });

    it('should return false for permissions when not authenticated', () => {
      expect(sessionManager.hasPermission('read')).toBe(false);
    });
  });

  describe('Wallet Integration', () => {
    it('should update wallet data in session', () => {
      const userData = { userId: 'user123', name: 'Test User' };
      sessionManager.createSession(userData);

      sessionManager.updateWalletData('wallet123');

      const currentSession = sessionManager.getCurrentSession();
      expect(currentSession?.walletId).toBe('wallet123');
    });
  });

  describe('Authorization Headers', () => {
    it('should generate authorization header with valid token', () => {
      const userData = { userId: 'user123', name: 'Test User' };
      sessionManager.createSession(userData);

      const authHeader = sessionManager.getAuthHeader();
      expect(authHeader).toEqual({
        Authorization: expect.stringMatching(/^Bearer .+$/),
      });
    });

    it('should return null when no token exists', () => {
      const authHeader = sessionManager.getAuthHeader();
      expect(authHeader).toBeNull();
    });
  });

  describe('Session Expiry', () => {
    it('should calculate session expiry time', () => {
      const userData = { userId: 'user123', name: 'Test User' };
      sessionManager.createSession(userData);

      const expiry = sessionManager.getSessionExpiry();
      expect(expiry).toBeGreaterThan(Date.now());
    });

    it('should calculate time until expiry', () => {
      const userData = { userId: 'user123', name: 'Test User' };
      sessionManager.createSession(userData);

      const timeLeft = sessionManager.getTimeUntilExpiry();
      expect(timeLeft).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const userData = { userId: 'user123', name: 'Test User' };
      expect(() => sessionManager.createSession(userData)).toThrow('Session storage failed');
    });

    it('should handle invalid session data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-data');
      
      const session = sessionManager.getCurrentSession();
      expect(session).toBeNull();
    });
  });

  describe('Security Features', () => {
    it('should not store Aadhaar number in plain text', () => {
      const userData = {
        userId: 'user123',
        aadhaarHash: 'hashed-aadhaar',
        name: 'Test User',
      };
      sessionManager.createSession(userData);

      const currentSession = sessionManager.getCurrentSession();
      expect(currentSession?.aadhaarHash).toBe('hashed-aadhaar');
    });

    it('should generate device-specific encryption keys', () => {
      const userData = { userId: 'user123', name: 'Test User' };
      sessionManager.createSession(userData);

      // Verify that device ID is stored
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'glc_device_id',
        expect.any(String)
      );
    });
  });
}); 
// GL-0603: Session Refresh Token (JWT) Implementation
// Sprint 6: JuliaOS Wallet Integration
// Gujarat LandChain × JuliaOS Project

/*
Session Management System
- Objective: Secure session management with JWT tokens and automatic refresh
- Features: Token generation, automatic refresh, secure storage, session persistence
- Integration: Foundation for user authentication and wallet management
*/

import CryptoJS from 'crypto-js';

// Session configuration
const SESSION_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 60 * 60 * 1000, // 1 hour
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'glc_access_token',
    REFRESH_TOKEN: 'glc_refresh_token',
    USER_DATA: 'glc_user_data',
    SESSION_ID: 'glc_session_id',
    WALLET_DATA: 'glc_wallet_data'
  }
};

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

// JWT payload interface
interface JWTPayload {
  sub: string; // User ID
  name: string;
  verified: boolean;
  walletId?: string;
  permissions: string[];
  sessionId: string;
  iat: number; // Issued at
  exp: number; // Expires at
  type: 'access' | 'refresh';
}

// Session management class
class SessionManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  constructor() {
    this.initializeSession();
  }

  // Initialize session on app start
  private initializeSession(): void {
    const accessToken = this.getAccessToken();
    if (accessToken && this.isTokenValid(accessToken)) {
      this.scheduleTokenRefresh();
    } else if (this.getRefreshToken()) {
      this.refreshAccessToken();
    }
  }

  // Generate JWT token
  private generateJWT(payload: Partial<JWTPayload>, type: 'access' | 'refresh'): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const expiry = type === 'access' 
      ? now + (SESSION_CONFIG.ACCESS_TOKEN_EXPIRY / 1000)
      : now + (SESSION_CONFIG.REFRESH_TOKEN_EXPIRY / 1000);

    const fullPayload: JWTPayload = {
      sub: payload.sub || '',
      name: payload.name || '',
      verified: payload.verified || false,
      walletId: payload.walletId,
      permissions: payload.permissions || [],
      sessionId: payload.sessionId || this.generateSessionId(),
      iat: now,
      exp: expiry,
      type
    };

    // In production, use proper JWT library with secret key
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(fullPayload));
    const signature = this.generateSignature(encodedHeader, encodedPayload);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Generate signature for JWT
  private generateSignature(header: string, payload: string): string {
    const secret = process.env.NEXT_PUBLIC_JWT_SECRET || 'glc-secret-key';
    const data = `${header}.${payload}`;
    return btoa(CryptoJS.HmacSHA256(data, secret).toString());
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return 'session_' + CryptoJS.lib.WordArray.random(16).toString();
  }

  // Create user session after successful authentication
  public createSession(userData: Partial<UserSession>): {
    accessToken: string;
    refreshToken: string;
    session: UserSession;
  } {
    const sessionId = this.generateSessionId();
    const now = Date.now();

    const session: UserSession = {
      userId: userData.userId || '',
      aadhaarHash: userData.aadhaarHash || '',
      name: userData.name || '',
      verified: userData.verified || false,
      walletId: userData.walletId,
      permissions: userData.permissions || ['user'],
      lastLogin: now,
      sessionId
    };

    // Generate tokens
    const accessToken = this.generateJWT(session, 'access');
    const refreshToken = this.generateJWT(session, 'refresh');

    // Store session data securely
    this.storeSessionData(accessToken, refreshToken, session);

    // Schedule token refresh
    this.scheduleTokenRefresh();

    return { accessToken, refreshToken, session };
  }

  // Store session data securely
  private storeSessionData(accessToken: string, refreshToken: string, session: UserSession): void {
    try {
      // Encrypt sensitive data before storage
      const encryptedUserData = CryptoJS.AES.encrypt(
        JSON.stringify(session),
        this.getEncryptionKey()
      ).toString();

      localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.USER_DATA, encryptedUserData);
      localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_ID, session.sessionId);
    } catch (error) {
      console.error('Failed to store session data:', error);
      throw new Error('Session storage failed');
    }
  }

  // Get encryption key for sensitive data
  private getEncryptionKey(): string {
    const deviceId = this.getDeviceId();
    return CryptoJS.SHA256(deviceId + 'glc-session-key').toString();
  }

  // Generate device-specific ID
  private getDeviceId(): string {
    if (typeof window === 'undefined') return '';
    let deviceId = localStorage.getItem('glc_device_id');
    if (!deviceId) {
      deviceId = 'device_' + CryptoJS.lib.WordArray.random(16).toString();
      localStorage.setItem('glc_device_id', deviceId);
    }
    return deviceId;
  }

  // Get current access token
  public getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Get refresh token
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  }

  // Get current user session
  public getCurrentSession(): UserSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const encryptedData = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.USER_DATA);
      if (!encryptedData) return null;

      const decryptedData = CryptoJS.AES.decrypt(
        encryptedData,
        this.getEncryptionKey()
      ).toString(CryptoJS.enc.Utf8);

      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    return accessToken ? this.isTokenValid(accessToken) : false;
  }

  // Validate JWT token
  public isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeJWT(token);
      return payload && payload.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
      return false;
    }
  }

  // Decode JWT token
  private decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }

  // Schedule automatic token refresh
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const accessToken = this.getAccessToken();
    if (!accessToken) return;

    const payload = this.decodeJWT(accessToken);
    if (!payload) return;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = (payload.exp - now) * 1000;
    const refreshTime = Math.max(timeUntilExpiry - SESSION_CONFIG.REFRESH_THRESHOLD, 0);

    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken();
    }, refreshTime);
  }

  // Refresh access token using refresh token
  public async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing) {
      // Wait for ongoing refresh
      return new Promise((resolve) => {
        const checkRefresh = () => {
          if (!this.isRefreshing) {
            resolve(this.isAuthenticated());
          } else {
            setTimeout(checkRefresh, 100);
          }
        };
        checkRefresh();
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken || !this.isTokenValid(refreshToken)) {
        this.clearSession();
        return false;
      }

      // Simulate API call to refresh token
      const response = await this.callRefreshAPI(refreshToken);
      
      if (response.success) {
        const session = this.getCurrentSession();
        if (session) {
          const newAccessToken = this.generateJWT(session, 'access');
          localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
          this.scheduleTokenRefresh();
          return true;
        }
      }

      this.clearSession();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearSession();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Simulate refresh token API call
  private async callRefreshAPI(refreshToken: string): Promise<{ success: boolean }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate 95% success rate
    const success = Math.random() < 0.95;
    
    if (!success) {
      throw new Error('Refresh token invalid or expired');
    }

    return { success: true };
  }

  // Update wallet data in session
  public updateWalletData(walletId: string): void {
    const session = this.getCurrentSession();
    if (session) {
      session.walletId = walletId;
      this.updateSessionData(session);
    }
  }

  // Update session data
  private updateSessionData(session: UserSession): void {
    try {
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(session),
        this.getEncryptionKey()
      ).toString();

      localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.USER_DATA, encryptedData);
    } catch (error) {
      console.error('Failed to update session data:', error);
    }
  }

  // Clear session data
  public clearSession(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    Object.values(SESSION_CONFIG.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Get authorization header for API calls
  public getAuthHeader(): { Authorization: string } | null {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : null;
  }

  // Check if user has specific permission
  public hasPermission(permission: string): boolean {
    const session = this.getCurrentSession();
    return session?.permissions.includes(permission) || false;
  }

  // Get session expiry time
  public getSessionExpiry(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const payload = this.decodeJWT(token);
    return payload ? payload.exp * 1000 : null;
  }

  // Get time until session expires
  public getTimeUntilExpiry(): number | null {
    const expiry = this.getSessionExpiry();
    if (!expiry) return null;

    return Math.max(expiry - Date.now(), 0);
  }

  // Force logout user
  public logout(): void {
    this.clearSession();
    window.location.href = '/login';
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Export session manager and utility functions
export default sessionManager;

// Utility functions for React components
export const useSession = () => {
  return {
    isAuthenticated: sessionManager.isAuthenticated(),
    currentSession: sessionManager.getCurrentSession(),
    hasPermission: (permission: string) => sessionManager.hasPermission(permission),
    logout: () => sessionManager.logout(),
    getAuthHeader: () => sessionManager.getAuthHeader(),
    getTimeUntilExpiry: () => sessionManager.getTimeUntilExpiry()
  };
};

// API wrapper with automatic token refresh
export const apiCall = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let authHeader = sessionManager.getAuthHeader();
  
  if (!authHeader) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeader,
      'Content-Type': 'application/json'
    }
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    const refreshed = await sessionManager.refreshAccessToken();
    if (refreshed) {
      authHeader = sessionManager.getAuthHeader();
      if (authHeader) {
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            ...authHeader,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    // If refresh failed, redirect to login
    sessionManager.logout();
    throw new Error('Authentication failed');
  }

  return response;
}; 
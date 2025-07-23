'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from '../hooks/useSession';

// Role definitions with permissions
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OFFICIAL = 'official',
  VIEWER = 'viewer'
}

export enum Permission {
  // User management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  
  // Property management
  APPROVE_PROPERTIES = 'approve_properties',
  REJECT_PROPERTIES = 'reject_properties',
  VIEW_PROPERTIES = 'view_properties',
  EDIT_PROPERTIES = 'edit_properties',
  
  // Dispute management
  RESOLVE_DISPUTES = 'resolve_disputes',
  VIEW_DISPUTES = 'view_disputes',
  ESCALATE_DISPUTES = 'escalate_disputes',
  
  // Audit and reporting
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  EXPORT_REPORTS = 'export_reports',
  VIEW_ANALYTICS = 'view_analytics',
  
  // System administration
  MANAGE_SYSTEM = 'manage_system',
  VIEW_SYSTEM_LOGS = 'view_system_logs',
  CONFIGURE_SETTINGS = 'configure_settings'
}

// Role-permission mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.APPROVE_PROPERTIES,
    Permission.REJECT_PROPERTIES,
    Permission.VIEW_PROPERTIES,
    Permission.EDIT_PROPERTIES,
    Permission.RESOLVE_DISPUTES,
    Permission.VIEW_DISPUTES,
    Permission.ESCALATE_DISPUTES,
    Permission.VIEW_AUDIT_LOGS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SYSTEM,
    Permission.VIEW_SYSTEM_LOGS,
    Permission.CONFIGURE_SETTINGS
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.APPROVE_PROPERTIES,
    Permission.REJECT_PROPERTIES,
    Permission.VIEW_PROPERTIES,
    Permission.EDIT_PROPERTIES,
    Permission.RESOLVE_DISPUTES,
    Permission.VIEW_DISPUTES,
    Permission.ESCALATE_DISPUTES,
    Permission.VIEW_AUDIT_LOGS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_SYSTEM_LOGS
  ],
  [UserRole.OFFICIAL]: [
    Permission.VIEW_PROPERTIES,
    Permission.APPROVE_PROPERTIES,
    Permission.REJECT_PROPERTIES,
    Permission.VIEW_DISPUTES,
    Permission.VIEW_AUDIT_LOGS,
    Permission.EXPORT_REPORTS
  ],
  [UserRole.VIEWER]: [
    Permission.VIEW_PROPERTIES,
    Permission.VIEW_DISPUTES,
    Permission.VIEW_AUDIT_LOGS
  ]
};

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  lastLogin: Date;
  permissions: Permission[];
}

// RBAC Context
interface RBACContextType {
  currentUser: User | null;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<boolean>;
  getUsers: () => User[];
  createUser: (userData: Omit<User, 'id' | 'lastLogin'>) => Promise<boolean>;
  deactivateUser: (userId: string) => Promise<boolean>;
}

const RBACContext = createContext<RBACContextType | null>(null);

// Mock users data (will be replaced with real backend)
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@gujarat.gov.in',
    role: UserRole.SUPER_ADMIN,
    department: 'IT Administration',
    isActive: true,
    lastLogin: new Date(),
    permissions: ROLE_PERMISSIONS[UserRole.SUPER_ADMIN]
  },
  {
    id: '2',
    name: 'Revenue Officer',
    email: 'revenue.officer@gujarat.gov.in',
    role: UserRole.ADMIN,
    department: 'Revenue Department',
    isActive: true,
    lastLogin: new Date(Date.now() - 86400000), // 1 day ago
    permissions: ROLE_PERMISSIONS[UserRole.ADMIN]
  },
  {
    id: '3',
    name: 'Land Inspector',
    email: 'land.inspector@gujarat.gov.in',
    role: UserRole.OFFICIAL,
    department: 'Land Records',
    isActive: true,
    lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
    permissions: ROLE_PERMISSIONS[UserRole.OFFICIAL]
  },
  {
    id: '4',
    name: 'Auditor',
    email: 'auditor@gujarat.gov.in',
    role: UserRole.VIEWER,
    department: 'Audit Department',
    isActive: true,
    lastLogin: new Date(Date.now() - 7200000), // 2 hours ago
    permissions: ROLE_PERMISSIONS[UserRole.VIEWER]
  }
];

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const { session } = useSession();

  // Check if user has specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  };

  // Check if user has specific role
  const hasRole = (role: UserRole): boolean => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Replace with real authentication API
      const user = users.find(u => u.email === email && u.isActive);
      if (user) {
        setCurrentUser(user);
        // Update last login
        setUsers(prev => prev.map(u => 
          u.id === user.id 
            ? { ...u, lastLogin: new Date() }
            : u
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
  };

  // Update user role
  const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    try {
      // TODO: Replace with real API call
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, permissions: ROLE_PERMISSIONS[newRole] }
          : user
      ));
      
      // Update current user if it's the same user
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, role: newRole, permissions: ROLE_PERMISSIONS[newRole] } : null);
      }
      
      return true;
    } catch (error) {
      console.error('Update role error:', error);
      return false;
    }
  };

  // Get all users
  const getUsers = (): User[] => {
    return users;
  };

  // Create new user
  const createUser = async (userData: Omit<User, 'id' | 'lastLogin'>): Promise<boolean> => {
    try {
      // TODO: Replace with real API call
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        lastLogin: new Date(),
        permissions: ROLE_PERMISSIONS[userData.role]
      };
      setUsers(prev => [...prev, newUser]);
      return true;
    } catch (error) {
      console.error('Create user error:', error);
      return false;
    }
  };

  // Deactivate user
  const deactivateUser = async (userId: string): Promise<boolean> => {
    try {
      // TODO: Replace with real API call
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isActive: false }
          : user
      ));
      return true;
    } catch (error) {
      console.error('Deactivate user error:', error);
      return false;
    }
  };

  // Initialize user from session
  useEffect(() => {
    if (session?.user?.email) {
      const user = users.find(u => u.email === session.user.email);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [session, users]);

  const value: RBACContextType = {
    currentUser,
    hasPermission,
    hasRole,
    login,
    logout,
    updateUserRole,
    getUsers,
    createUser,
    deactivateUser
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

// Hook to use RBAC context
export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider');
  }
  return context;
};

// Permission gate component
interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { hasPermission } = useRBAC();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Role gate component
interface RoleGateProps {
  role: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({ 
  role, 
  children, 
  fallback = null 
}) => {
  const { hasRole } = useRBAC();
  
  if (!hasRole(role)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Login component
export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useRBAC();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Gujarat LandChain Official Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User management component
export const UserManagement: React.FC = () => {
  const { currentUser, getUsers, updateUserRole, createUser, deactivateUser, hasPermission } = useRBAC();
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: UserRole.VIEWER,
    department: ''
  });

  useEffect(() => {
    setUsers(getUsers());
  }, [getUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createUser({
      ...newUser,
      isActive: true,
      permissions: ROLE_PERMISSIONS[newUser.role]
    });
    
    if (success) {
      setUsers(getUsers());
      setShowCreateForm(false);
      setNewUser({ name: '', email: '', role: UserRole.VIEWER, department: '' });
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      setUsers(getUsers());
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    const success = await deactivateUser(userId);
    if (success) {
      setUsers(getUsers());
    }
  };

  if (!hasPermission(Permission.MANAGE_USERS)) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add User
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Create New User</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Create User
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.department}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleUpdate(user.id, e.target.value as UserRole)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    disabled={user.id === currentUser?.id}
                  >
                    {Object.values(UserRole).map(role => (
                      <option key={role} value={role}>
                        {role.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDeactivateUser(user.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 
'use client';

import React, { useState } from 'react';
import { RBACProvider, useRBAC, LoginForm, UserManagement } from '../components/RBACSystem';
import { BatchApprovalQueue } from '../components/BatchApprovalQueue';
import { AuditLogExport } from '../components/AuditLogExport';
import GovernanceVotingInterface from '../components/GovernanceVotingInterface';
import LandListingInterface from '../components/LandListingInterface';

// Dashboard navigation component
const DashboardNavigation: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const { currentUser, logout, hasPermission } = useRBAC();

  const navigationItems = [
    {
      id: 'overview',
      name: 'Overview',
      icon: '📊',
      permission: null
    },
    {
      id: 'land-listings',
      name: 'Land Listings',
      icon: '🏠',
      permission: 'create_listing'
    },
    {
      id: 'batch-approval',
      name: 'Batch Approval Queue',
      icon: '✅',
      permission: 'view_properties'
    },
    {
      id: 'governance',
      name: 'Governance Voting',
      icon: '🗳️',
      permission: 'view_disputes'
    },
    {
      id: 'audit-logs',
      name: 'Audit Logs',
      icon: '📋',
      permission: 'view_audit_logs'
    },
    {
      id: 'user-management',
      name: 'User Management',
      icon: '👥',
      permission: 'manage_users'
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Gujarat LandChain Official Dashboard
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                if (item.permission && !hasPermission(item.permission)) {
                  return null;
                }
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeTab === item.id
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{currentUser.name}</div>
                  <div className="text-gray-500">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Overview component
const Overview: React.FC = () => {
  const { currentUser } = useRBAC();

  const stats = [
    {
      name: 'Active Land Listings',
      value: '42',
      change: '+15%',
      changeType: 'increase',
      icon: '🏠'
    },
    {
      name: 'Pending Approvals',
      value: '24',
      change: '+12%',
      changeType: 'increase',
      icon: '⏳'
    },
    {
      name: 'Properties Approved',
      value: '156',
      change: '+8%',
      changeType: 'increase',
      icon: '✅'
    },
    {
      name: 'Active Disputes',
      value: '7',
      change: '-3%',
      changeType: 'decrease',
      icon: '⚖️'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {currentUser?.name}!</h2>
        <p className="text-gray-600">Here's what's happening with Gujarat LandChain today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">New land listing created: Agricultural Land in Anand District</p>
              <p className="text-xs text-gray-500">5 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Customer inquiry received for Residential Plot in Vadodara</p>
              <p className="text-xs text-gray-500">12 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Property GJ-24-001-001-001 approved by Revenue Officer</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">New dispute case filed for property GJ-24-001-001-002</p>
              <p className="text-xs text-gray-500">3 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main dashboard content
const DashboardContent: React.FC = () => {
  const { currentUser } = useRBAC();
  const [activeTab, setActiveTab] = useState('overview');

  if (!currentUser) {
    return <LoginForm />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'land-listings':
        return <LandListingInterface />;
      case 'batch-approval':
        return <BatchApprovalQueue />;
      case 'governance':
        return <GovernanceVotingInterface />;
      case 'audit-logs':
        return <AuditLogExport />;
      case 'user-management':
        return <UserManagement />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

// Main page component
export default function DashboardPage() {
  return (
    <RBACProvider>
      <DashboardContent />
    </RBACProvider>
  );
} 
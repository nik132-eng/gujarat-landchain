'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import JuliaOSAgentPanel from '@/components/JuliaOSAgentPanel'
import BatchApprovalQueue from '@/components/BatchApprovalQueue'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import DisputeResolutionPanel from '@/components/DisputeResolutionPanel'

interface DashboardStats {
  totalProperties: number
  pendingApprovals: number
  activeDisputes: number
  totalTransactions: number
  aiValidationAccuracy: number
  swarmConsensusRate: number
}

export default function DashboardPage() {
  const { publicKey } = useWallet()
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    pendingApprovals: 0,
    activeDisputes: 0,
    totalTransactions: 0,
    aiValidationAccuracy: 0,
    swarmConsensusRate: 0
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load dashboard statistics
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      // Simulate API call to get dashboard stats
      const mockStats: DashboardStats = {
        totalProperties: 15420,
        pendingApprovals: 47,
        activeDisputes: 12,
        totalTransactions: 8923,
        aiValidationAccuracy: 94.2,
        swarmConsensusRate: 96.8
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'agents', label: 'JuliaOS Agents', icon: '🤖' },
    { id: 'approvals', label: 'Batch Approvals', icon: '✅' },
    { id: 'disputes', label: 'Dispute Resolution', icon: '⚖️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gujarat-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading official dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Official Dashboard</h1>
              <p className="text-gray-600 mt-1">Gujarat LandChain Administrative Interface</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Connected Wallet:</span> 
                {publicKey ? ` ${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-8)}` : ' Not connected'}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Role:</span> Government Official
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🏘️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Disputes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDisputes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">AI Validation Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aiValidationAccuracy}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🐝</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Swarm Consensus Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.swarmConsensusRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-gujarat-blue-500 text-gujarat-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Property Transfer Completed</p>
                          <p className="text-xs text-gray-600">ULPIN GJ-01-001-2024-001 transferred successfully</p>
                        </div>
                        <span className="text-xs text-gray-500">2 min ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">AI Validation Completed</p>
                          <p className="text-xs text-gray-600">Satellite imagery validated for 15 properties</p>
                        </div>
                        <span className="text-xs text-gray-500">5 min ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New Dispute Filed</p>
                          <p className="text-xs text-gray-600">Dispute #D-2024-012 requires review</p>
                        </div>
                        <span className="text-xs text-gray-500">10 min ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">JuliaOS Agent Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Mint Agent</span>
                        </div>
                        <span className="text-xs text-gray-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Satellite Agent</span>
                        </div>
                        <span className="text-xs text-gray-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Validation Swarm</span>
                        </div>
                        <span className="text-xs text-gray-600">15/15 Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Dispute Agent</span>
                        </div>
                        <span className="text-xs text-gray-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'agents' && (
              <JuliaOSAgentPanel />
            )}

            {activeTab === 'approvals' && (
              <BatchApprovalQueue />
            )}

            {activeTab === 'disputes' && (
              <DisputeResolutionPanel />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard />
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
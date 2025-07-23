'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import JuliaOSAgentPanel from '@/components/JuliaOSAgentPanel'
import BatchApprovalQueue from '@/components/BatchApprovalQueue'
import DisputeResolutionPanel from '@/components/DisputeResolutionPanel'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import RoleBasedAccess from '@/components/RoleBasedAccess'

interface DashboardStats {
  totalProperties: number
  pendingApprovals: number
  activeDisputes: number
  totalTransactions: number
  aiValidationAccuracy: number
  swarmConsensusRate: number
  juliaosAgentsActive: number
  onchainOperations: number
}

export default function DashboardPage() {
  const { publicKey } = useWallet()
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    pendingApprovals: 0,
    activeDisputes: 0,
    totalTransactions: 0,
    aiValidationAccuracy: 0,
    swarmConsensusRate: 0,
    juliaosAgentsActive: 0,
    onchainOperations: 0
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('GOVERNMENT_OFFICIAL')

  useEffect(() => {
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
        swarmConsensusRate: 96.8,
        juliaosAgentsActive: 8,
        onchainOperations: 1247
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', role: 'all' },
    { id: 'agents', label: 'JuliaOS Agents', icon: '🤖', role: 'all' },
    { id: 'approvals', label: 'Batch Approvals', icon: '✅', role: 'GOVERNMENT_OFFICIAL' },
    { id: 'disputes', label: 'Dispute Resolution', icon: '⚖️', role: 'all' },
    { id: 'analytics', label: 'Analytics', icon: '📈', role: 'all' }
  ]

  const filteredTabs = tabs.filter(tab => 
    tab.role === 'all' || tab.role === userRole
  )

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
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

          <div className="card">
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

          <div className="card">
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

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">JuliaOS Agents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.juliaosAgentsActive}</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI & Swarm Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">AI Validation Performance</h3>
              <p className="card-subtitle">Accuracy of JuliaOS agent validation</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Accuracy Rate</span>
                  <span className="text-sm font-bold text-gujarat-blue-600">{stats.aiValidationAccuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gujarat-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.aiValidationAccuracy}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Swarm Consensus Rate</h3>
              <p className="card-subtitle">Multi-agent consensus performance</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Consensus Rate</span>
                  <span className="text-sm font-bold text-gujarat-green-600">{stats.swarmConsensusRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gujarat-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.swarmConsensusRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {filteredTabs.map((tab) => (
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
                  <div className="juliaos-agent-card">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">JuliaOS Agent Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">ULPIN Mint Agent</span>
                        </div>
                        <span className="text-xs text-gray-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Satellite Ingestion Agent</span>
                        </div>
                        <span className="text-xs text-gray-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Validation Swarm</span>
                        </div>
                        <span className="text-xs text-gray-600">Active</span>
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

                  <div className="onchain-activity-card">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Onchain Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">NFT Minted</span>
                        <span className="text-gray-600">2 minutes ago</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Property Transfer</span>
                        <span className="text-gray-600">5 minutes ago</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Dispute Resolution</span>
                        <span className="text-gray-600">12 minutes ago</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Swarm Consensus</span>
                        <span className="text-gray-600">18 minutes ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="swarm-consensus-card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Swarm Consensus Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gujarat-green-600">15</div>
                      <div className="text-sm text-gray-600">Active Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gujarat-blue-600">96.8%</div>
                      <div className="text-sm text-gray-600">Consensus Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gujarat-saffron-600">2,156</div>
                      <div className="text-sm text-gray-600">Validations Today</div>
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
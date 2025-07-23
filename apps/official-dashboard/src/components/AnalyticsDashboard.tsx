'use client'

import { useState, useEffect } from 'react'

interface AnalyticsData {
  totalProperties: number
  pendingApprovals: number
  activeDisputes: number
  totalTransactions: number
  aiValidationAccuracy: number
  swarmConsensusRate: number
  juliaosAgentsActive: number
  onchainOperations: number
  monthlyStats: MonthlyStat[]
  districtStats: DistrictStat[]
  agentPerformance: AgentPerformance[]
}

interface MonthlyStat {
  month: string
  properties: number
  approvals: number
  disputes: number
  transactions: number
}

interface DistrictStat {
  district: string
  properties: number
  pendingApprovals: number
  activeDisputes: number
  aiAccuracy: number
}

interface AgentPerformance {
  agentId: string
  agentName: string
  tasksCompleted: number
  successRate: number
  avgProcessingTime: number
  lastActivity: string
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: AnalyticsData = {
        totalProperties: 15420,
        pendingApprovals: 47,
        activeDisputes: 12,
        totalTransactions: 8923,
        aiValidationAccuracy: 94.2,
        swarmConsensusRate: 96.8,
        juliaosAgentsActive: 8,
        onchainOperations: 1247,
        monthlyStats: [
          { month: 'Jan', properties: 1200, approvals: 85, disputes: 8, transactions: 650 },
          { month: 'Feb', properties: 1350, approvals: 92, disputes: 12, transactions: 720 },
          { month: 'Mar', properties: 1420, approvals: 78, disputes: 15, transactions: 680 },
          { month: 'Apr', properties: 1580, approvals: 105, disputes: 10, transactions: 890 },
          { month: 'May', properties: 1650, approvals: 95, disputes: 18, transactions: 820 },
          { month: 'Jun', properties: 1720, approvals: 110, disputes: 14, transactions: 950 },
          { month: 'Jul', properties: 1800, approvals: 125, disputes: 20, transactions: 1050 },
          { month: 'Aug', properties: 1850, approvals: 115, disputes: 16, transactions: 980 },
          { month: 'Sep', properties: 1920, approvals: 130, disputes: 22, transactions: 1120 },
          { month: 'Oct', properties: 1980, approvals: 140, disputes: 25, transactions: 1200 },
          { month: 'Nov', properties: 2050, approvals: 135, disputes: 28, transactions: 1150 },
          { month: 'Dec', properties: 15420, approvals: 47, disputes: 12, transactions: 8923 }
        ],
        districtStats: [
          { district: 'Ahmedabad', properties: 3200, pendingApprovals: 12, activeDisputes: 3, aiAccuracy: 96.5 },
          { district: 'Surat', properties: 2800, pendingApprovals: 8, activeDisputes: 2, aiAccuracy: 95.8 },
          { district: 'Vadodara', properties: 2100, pendingApprovals: 6, activeDisputes: 1, aiAccuracy: 94.2 },
          { district: 'Rajkot', properties: 1800, pendingApprovals: 5, activeDisputes: 2, aiAccuracy: 93.7 },
          { district: 'Bhavnagar', properties: 1500, pendingApprovals: 4, activeDisputes: 1, aiAccuracy: 92.9 },
          { district: 'Jamnagar', properties: 1200, pendingApprovals: 3, activeDisputes: 1, aiAccuracy: 91.5 },
          { district: 'Anand', properties: 1000, pendingApprovals: 3, activeDisputes: 1, aiAccuracy: 90.8 },
          { district: 'Bharuch', properties: 800, pendingApprovals: 2, activeDisputes: 0, aiAccuracy: 89.3 },
          { district: 'Mehsana', properties: 700, pendingApprovals: 2, activeDisputes: 0, aiAccuracy: 88.7 },
          { district: 'Patan', properties: 520, pendingApprovals: 2, activeDisputes: 1, aiAccuracy: 87.4 }
        ],
        agentPerformance: [
          { agentId: 'mint-agent-001', agentName: 'ULPIN Mint Agent', tasksCompleted: 1247, successRate: 94.2, avgProcessingTime: 2.3, lastActivity: '2 minutes ago' },
          { agentId: 'satellite-agent-001', agentName: 'Sentinel-2 Ingestion Agent', tasksCompleted: 892, successRate: 96.8, avgProcessingTime: 1.8, lastActivity: '30 seconds ago' },
          { agentId: 'validation-swarm-001', agentName: 'YOLOv8 Validation Swarm', tasksCompleted: 2156, successRate: 97.1, avgProcessingTime: 3.2, lastActivity: '1 minute ago' },
          { agentId: 'dispute-agent-001', agentName: 'Legal Document Parser', tasksCompleted: 89, successRate: 91.5, avgProcessingTime: 4.5, lastActivity: '5 minutes ago' }
        ]
      }
      
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gujarat-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return <div className="text-center text-gray-600">No analytics data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="card-title">Analytics Dashboard</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🏘️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalProperties.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{analyticsData.pendingApprovals}</p>
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
              <p className="text-2xl font-bold text-gray-900">{analyticsData.activeDisputes}</p>
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
              <p className="text-2xl font-bold text-gray-900">{analyticsData.juliaosAgentsActive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">AI Validation Performance</h3>
            <p className="card-subtitle">Accuracy of JuliaOS agent validation</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Accuracy Rate</span>
                <span className="text-sm font-bold text-gujarat-blue-600">{analyticsData.aiValidationAccuracy}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gujarat-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${analyticsData.aiValidationAccuracy}%` }}
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
                <span className="text-sm font-bold text-gujarat-green-600">{analyticsData.swarmConsensusRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gujarat-green-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${analyticsData.swarmConsensusRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Monthly Trends</h3>
          <p className="card-subtitle">Property registrations and approvals over time</p>
        </div>
        <div className="h-64 flex items-end justify-between space-x-2">
          {analyticsData.monthlyStats.map((stat, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t" style={{ height: `${(stat.properties / 2000) * 200}px` }}>
                <div className="w-full bg-gujarat-blue-600 rounded-t" style={{ height: '100%' }}></div>
              </div>
              <div className="text-xs text-gray-600 mt-2">{stat.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* District Performance */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">District Performance</h3>
          <p className="card-subtitle">AI accuracy and workload by district</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disputes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Accuracy
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.districtStats.map((district) => (
                <tr key={district.district} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {district.district}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {district.properties.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {district.pendingApprovals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {district.activeDisputes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${district.aiAccuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{district.aiAccuracy}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">JuliaOS Agent Performance</h3>
          <p className="card-subtitle">Individual agent metrics and performance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyticsData.agentPerformance.map((agent) => (
            <div key={agent.agentId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{agent.agentName}</h4>
                <span className="text-xs text-gray-500">{agent.lastActivity}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tasks Completed:</span>
                  <span className="font-medium">{agent.tasksCompleted.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium">{agent.successRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Processing Time:</span>
                  <span className="font-medium">{agent.avgProcessingTime}s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onchain Activity Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Onchain Activity Summary</h3>
          <p className="card-subtitle">Blockchain transactions and operations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gujarat-blue-600 mb-2">
              {analyticsData.totalTransactions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gujarat-green-600 mb-2">
              {analyticsData.onchainOperations.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Onchain Operations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gujarat-saffron-600 mb-2">
              {((analyticsData.onchainOperations / analyticsData.totalTransactions) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Onchain Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'

interface Dispute {
  id: string
  ulpin: string
  propertyTitle: string
  disputeType: 'boundary' | 'ownership' | 'encroachment' | 'documentation'
  status: 'filed' | 'under_review' | 'evidence_collection' | 'ai_analysis' | 'swarm_voting' | 'resolved'
  priority: 'high' | 'medium' | 'low'
  filedDate: string
  parties: string[]
  evidenceCount: number
  aiAnalysisScore: number
  swarmConsensusScore: number
  estimatedResolution: string
  assignedAgent: string
}

export default function DisputeResolutionPanel() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadDisputes()
  }, [])

  const loadDisputes = () => {
    const mockDisputes: Dispute[] = [
      {
        id: 'D-2024-001',
        ulpin: 'GJ-01-001-2024-001',
        propertyTitle: 'Residential Plot - Sector 15',
        disputeType: 'boundary',
        status: 'ai_analysis',
        priority: 'high',
        filedDate: '2024-12-10',
        parties: ['Rajesh Patel', 'Priya Sharma'],
        evidenceCount: 8,
        aiAnalysisScore: 87.3,
        swarmConsensusScore: 92.1,
        estimatedResolution: '2024-12-20',
        assignedAgent: 'dispute-agent-001'
      },
      {
        id: 'D-2024-002',
        ulpin: 'GJ-01-002-2024-002',
        propertyTitle: 'Commercial Building - Ahmedabad',
        disputeType: 'ownership',
        status: 'swarm_voting',
        priority: 'high',
        filedDate: '2024-12-08',
        parties: ['TechCorp Solutions', 'Green Valley Developers'],
        evidenceCount: 12,
        aiAnalysisScore: 94.7,
        swarmConsensusScore: 89.5,
        estimatedResolution: '2024-12-18',
        assignedAgent: 'dispute-agent-002'
      },
      {
        id: 'D-2024-003',
        ulpin: 'GJ-01-003-2024-003',
        propertyTitle: 'Agricultural Land - Vadodara',
        disputeType: 'encroachment',
        status: 'evidence_collection',
        priority: 'medium',
        filedDate: '2024-12-05',
        parties: ['Amit Kumar', 'Local Municipality'],
        evidenceCount: 5,
        aiAnalysisScore: 76.2,
        swarmConsensusScore: 0,
        estimatedResolution: '2024-12-25',
        assignedAgent: 'dispute-agent-003'
      },
      {
        id: 'D-2024-004',
        ulpin: 'GJ-01-004-2024-004',
        propertyTitle: 'IT Park Plot - GIFT City',
        disputeType: 'documentation',
        status: 'resolved',
        priority: 'low',
        filedDate: '2024-11-28',
        parties: ['Innovation Labs', 'GIFT City Authority'],
        evidenceCount: 15,
        aiAnalysisScore: 98.1,
        swarmConsensusScore: 96.8,
        estimatedResolution: '2024-12-15',
        assignedAgent: 'dispute-agent-004'
      }
    ]

    setDisputes(mockDisputes)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed': return 'bg-gray-100 text-gray-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'evidence_collection': return 'bg-yellow-100 text-yellow-800'
      case 'ai_analysis': return 'bg-purple-100 text-purple-800'
      case 'swarm_voting': return 'bg-green-100 text-green-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDisputeTypeIcon = (type: string) => {
    switch (type) {
      case 'boundary': return '🗺️'
      case 'ownership': return '👥'
      case 'encroachment': return '🚧'
      case 'documentation': return '📄'
      default: return '⚖️'
    }
  }

  const triggerAIAnalysis = async (disputeId: string) => {
    console.log(`Triggering JuliaOS AI analysis for dispute: ${disputeId}`)
    
    // Simulate AI analysis
    setDisputes(prev => prev.map(dispute => 
      dispute.id === disputeId 
        ? { ...dispute, status: 'ai_analysis' }
        : dispute
    ))

    // Simulate analysis completion
    setTimeout(() => {
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { 
              ...dispute, 
              status: 'swarm_voting',
              aiAnalysisScore: Math.min(100, dispute.aiAnalysisScore + Math.random() * 10)
            }
          : dispute
      ))
    }, 3000)
  }

  const triggerSwarmVoting = async (disputeId: string) => {
    console.log(`Triggering JuliaOS swarm voting for dispute: ${disputeId}`)
    
    // Simulate swarm voting
    setTimeout(() => {
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { 
              ...dispute, 
              status: 'resolved',
              swarmConsensusScore: Math.min(100, dispute.aiAnalysisScore + Math.random() * 5)
            }
          : dispute
      ))
    }, 4000)
  }

  const filteredDisputes = disputes.filter(dispute => {
    if (filter === 'all') return true
    return dispute.status === filter
  })

  return (
    <div className="space-y-6">
      {/* JuliaOS Dispute Resolution Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⚖️</span>
          JuliaOS Dispute Resolution System
          <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
            AI-Powered
          </span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{disputes.length}</div>
            <div className="text-sm text-gray-600">Total Disputes</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {disputes.filter(d => d.status === 'ai_analysis' || d.status === 'swarm_voting').length}
            </div>
            <div className="text-sm text-gray-600">Under AI Review</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {disputes.filter(d => d.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(disputes.reduce((acc, d) => acc + d.aiAnalysisScore, 0) / disputes.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg AI Score</div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Disputes</option>
            <option value="filed">Filed</option>
            <option value="under_review">Under Review</option>
            <option value="evidence_collection">Evidence Collection</option>
            <option value="ai_analysis">AI Analysis</option>
            <option value="swarm_voting">Swarm Voting</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => (
          <div key={dispute.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{getDisputeTypeIcon(dispute.disputeType)}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{dispute.propertyTitle}</h4>
                    <p className="text-sm text-gray-600">ULPIN: {dispute.ulpin}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                    {dispute.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                    {dispute.priority} Priority
                  </span>
                  <span className="text-gray-600">Filed: {new Date(dispute.filedDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Dispute ID</div>
                <div className="font-mono text-sm font-medium">{dispute.id}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Parties Involved</div>
                <div className="text-sm text-gray-900">
                  {dispute.parties.join(' vs ')}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Evidence Count</div>
                <div className="text-sm text-gray-900">{dispute.evidenceCount} documents</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">AI Analysis Score</div>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${dispute.aiAnalysisScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{dispute.aiAnalysisScore}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Swarm Consensus</div>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${dispute.swarmConsensusScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{dispute.swarmConsensusScore}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Assigned Agent:</span> {dispute.assignedAgent}
                <br />
                <span className="font-medium">Estimated Resolution:</span> {dispute.estimatedResolution}
              </div>
              
              <div className="flex space-x-2">
                {dispute.status === 'evidence_collection' && (
                  <button
                    onClick={() => triggerAIAnalysis(dispute.id)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm"
                  >
                    Start AI Analysis
                  </button>
                )}
                
                {dispute.status === 'ai_analysis' && (
                  <button
                    onClick={() => triggerSwarmVoting(dispute.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    Trigger Swarm Voting
                  </button>
                )}
                
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* JuliaOS Integration Info */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          JuliaOS Dispute Resolution Integration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">AI Document Analysis</h4>
            <p className="text-gray-300 text-sm">
              JuliaOS agents analyze legal documents, satellite imagery, and evidence bundles 
              using advanced NLP and computer vision to extract relevant information for dispute resolution.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Swarm Consensus Voting</h4>
            <p className="text-gray-300 text-sm">
              Multiple AI agents form a swarm to vote on dispute outcomes, ensuring 
              democratic and transparent resolution with ⅔ majority consensus requirement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
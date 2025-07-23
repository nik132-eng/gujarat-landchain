'use client'

import { useState, useEffect } from 'react'

interface DisputeCase {
  id: string
  title: string
  propertyUlpin: string
  parties: string[]
  disputeType: 'boundary' | 'ownership' | 'encroachment' | 'documentation'
  status: 'pending' | 'under_review' | 'ai_analysis' | 'swarm_voting' | 'resolved'
  priority: 'high' | 'medium' | 'low'
  submittedDate: string
  aiAnalysisScore: number
  swarmConsensusScore: number
  evidenceBundle: string[]
  aiRecommendation: string
  swarmVotes: SwarmVote[]
  resolution?: string
  onchainTransaction?: string
}

interface SwarmVote {
  agentId: string
  agentType: 'satellite' | 'legal' | 'survey' | 'drone'
  vote: 'approve' | 'reject' | 'abstain'
  confidence: number
  reasoning: string
  timestamp: string
}

export default function DisputeResolutionPanel() {
  const [disputes, setDisputes] = useState<DisputeCase[]>([])
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadDisputes()
  }, [])

  const loadDisputes = () => {
    const mockDisputes: DisputeCase[] = [
      {
        id: 'DISPUTE-001',
        title: 'Property Boundary Dispute - Village Bavla',
        propertyUlpin: 'GJ01AA1234567890',
        parties: ['Rajesh Patel', 'Priya Sharma'],
        disputeType: 'boundary',
        status: 'swarm_voting',
        priority: 'high',
        submittedDate: '2024-12-15',
        aiAnalysisScore: 87.5,
        swarmConsensusScore: 92.3,
        evidenceBundle: ['Survey Report', 'Satellite Image', 'Historical Documents', 'Witness Statements'],
        aiRecommendation: 'Based on satellite imagery analysis and historical records, the boundary should be adjusted 2.5 meters eastward. AI confidence: 87.5%',
        swarmVotes: [
          {
            agentId: 'satellite-agent-001',
            agentType: 'satellite',
            vote: 'approve',
            confidence: 94.2,
            reasoning: 'Satellite imagery confirms boundary alignment with historical records',
            timestamp: '2024-12-15T10:30:00Z'
          },
          {
            agentId: 'legal-agent-001',
            agentType: 'legal',
            vote: 'approve',
            confidence: 89.7,
            reasoning: 'Documentation supports the proposed boundary adjustment',
            timestamp: '2024-12-15T10:32:00Z'
          },
          {
            agentId: 'survey-agent-001',
            agentType: 'survey',
            vote: 'approve',
            confidence: 91.3,
            reasoning: 'Ground survey measurements validate the boundary coordinates',
            timestamp: '2024-12-15T10:35:00Z'
          },
          {
            agentId: 'drone-agent-001',
            agentType: 'drone',
            vote: 'approve',
            confidence: 93.8,
            reasoning: 'Aerial photography confirms no encroachment issues',
            timestamp: '2024-12-15T10:38:00Z'
          }
        ],
        onchainTransaction: '0x1234567890abcdef...'
      },
      {
        id: 'DISPUTE-002',
        title: 'Land Transfer Verification - Gandhinagar',
        propertyUlpin: 'GJ01BB9876543210',
        parties: ['Amit Kumar', 'TechCorp Solutions'],
        disputeType: 'ownership',
        status: 'ai_analysis',
        priority: 'medium',
        submittedDate: '2024-12-14',
        aiAnalysisScore: 78.9,
        swarmConsensusScore: 0,
        evidenceBundle: ['Transfer Deed', 'Property Tax Receipts', 'KYC Documents'],
        aiRecommendation: 'Documentation appears incomplete. Additional verification required for ownership transfer. AI confidence: 78.9%',
        swarmVotes: []
      },
      {
        id: 'DISPUTE-003',
        title: 'Survey Number Discrepancy - Surat District',
        propertyUlpin: 'GJ24CC5555666677',
        parties: ['Green Valley Developers', 'Local Farmers Association'],
        disputeType: 'documentation',
        status: 'resolved',
        priority: 'low',
        submittedDate: '2024-12-10',
        aiAnalysisScore: 95.2,
        swarmConsensusScore: 97.8,
        evidenceBundle: ['Survey Records', 'Land Use Certificates', 'Historical Maps'],
        aiRecommendation: 'Survey number discrepancy resolved. Historical records confirm correct numbering. AI confidence: 95.2%',
        swarmVotes: [
          {
            agentId: 'satellite-agent-001',
            agentType: 'satellite',
            vote: 'approve',
            confidence: 96.5,
            reasoning: 'Satellite imagery matches historical survey records',
            timestamp: '2024-12-12T14:20:00Z'
          },
          {
            agentId: 'legal-agent-001',
            agentType: 'legal',
            vote: 'approve',
            confidence: 98.1,
            reasoning: 'Legal documentation confirms survey number accuracy',
            timestamp: '2024-12-12T14:22:00Z'
          }
        ],
        resolution: 'Survey number discrepancy resolved in favor of Green Valley Developers. Historical records confirmed correct numbering.',
        onchainTransaction: '0xabcdef1234567890...'
      }
    ]

    setDisputes(mockDisputes)
  }

  const handleAIAnalysis = async (disputeId: string) => {
    setIsProcessing(true)
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { 
              ...dispute, 
              status: 'ai_analysis',
              aiAnalysisScore: Math.floor(Math.random() * 20) + 80
            }
          : dispute
      ))
      
      alert('AI analysis completed successfully')
    } catch (error) {
      console.error('Error in AI analysis:', error)
      alert('Error in AI analysis')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSwarmVoting = async (disputeId: string) => {
    setIsProcessing(true)
    try {
      // Simulate swarm voting
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockVotes: SwarmVote[] = [
        {
          agentId: 'satellite-agent-001',
          agentType: 'satellite',
          vote: 'approve',
          confidence: Math.floor(Math.random() * 15) + 85,
          reasoning: 'Satellite imagery analysis supports resolution',
          timestamp: new Date().toISOString()
        },
        {
          agentId: 'legal-agent-001',
          agentType: 'legal',
          vote: 'approve',
          confidence: Math.floor(Math.random() * 15) + 85,
          reasoning: 'Legal documentation validates the claim',
          timestamp: new Date().toISOString()
        },
        {
          agentId: 'survey-agent-001',
          agentType: 'survey',
          vote: 'approve',
          confidence: Math.floor(Math.random() * 15) + 85,
          reasoning: 'Ground survey confirms measurements',
          timestamp: new Date().toISOString()
        }
      ]
      
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { 
              ...dispute, 
              status: 'swarm_voting',
              swarmVotes: mockVotes,
              swarmConsensusScore: Math.floor(Math.random() * 15) + 85
            }
          : dispute
      ))
      
      alert('Swarm voting completed successfully')
    } catch (error) {
      console.error('Error in swarm voting:', error)
      alert('Error in swarm voting')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleResolveDispute = async (disputeId: string, resolution: string) => {
    setIsProcessing(true)
    try {
      // Simulate dispute resolution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { 
              ...dispute, 
              status: 'resolved',
              resolution,
              onchainTransaction: `0x${Math.random().toString(16).substring(2, 18)}...`
            }
          : dispute
      ))
      
      alert('Dispute resolved successfully')
    } catch (error) {
      console.error('Error resolving dispute:', error)
      alert('Error resolving dispute')
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
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
      case 'ownership': return '🏠'
      case 'encroachment': return '⚠️'
      case 'documentation': return '📄'
      default: return '⚖️'
    }
  }

  const filteredDisputes = disputes.filter(dispute => {
    if (filter === 'all') return true
    return dispute.status === filter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">Dispute Resolution Panel</h3>
            <p className="card-subtitle">AI-powered dispute resolution with swarm consensus</p>
          </div>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Disputes</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="ai_analysis">AI Analysis</option>
              <option value="swarm_voting">Swarm Voting</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDisputes.map((dispute) => (
          <div key={dispute.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getDisputeTypeIcon(dispute.disputeType)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{dispute.title}</h4>
                  <p className="text-sm text-gray-600">ULPIN: {dispute.propertyUlpin}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`status-badge ${getStatusColor(dispute.status)}`}>
                  {dispute.status.replace('_', ' ')}
                </span>
                <span className={`status-badge ${getPriorityColor(dispute.priority)} ml-2`}>
                  {dispute.priority}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Parties:</span>
                <p className="text-sm text-gray-900">{dispute.parties.join(' vs ')}</p>
              </div>
              
              <div className="flex space-x-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">AI Score:</span>
                  <p className="text-sm text-gray-900">{dispute.aiAnalysisScore}%</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Swarm Score:</span>
                  <p className="text-sm text-gray-900">{dispute.swarmConsensusScore}%</p>
                </div>
              </div>

              {dispute.aiRecommendation && (
                <div>
                  <span className="text-sm font-medium text-gray-700">AI Recommendation:</span>
                  <p className="text-sm text-gray-900 mt-1">{dispute.aiRecommendation}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedDispute(dispute)}
                className="btn-secondary text-sm py-1 px-3"
              >
                View Details
              </button>
              
              {dispute.status === 'pending' && (
                <button
                  onClick={() => handleAIAnalysis(dispute.id)}
                  disabled={isProcessing}
                  className="btn-primary text-sm py-1 px-3"
                >
                  {isProcessing ? 'Processing...' : 'Start AI Analysis'}
                </button>
              )}
              
              {dispute.status === 'ai_analysis' && (
                <button
                  onClick={() => handleSwarmVoting(dispute.id)}
                  disabled={isProcessing}
                  className="btn-success text-sm py-1 px-3"
                >
                  {isProcessing ? 'Processing...' : 'Start Swarm Voting'}
                </button>
              )}
              
              {dispute.status === 'swarm_voting' && (
                <button
                  onClick={() => handleResolveDispute(dispute.id, 'Dispute resolved based on AI analysis and swarm consensus')}
                  disabled={isProcessing}
                  className="btn-warning text-sm py-1 px-3"
                >
                  {isProcessing ? 'Processing...' : 'Resolve Dispute'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Dispute Details */}
      {selectedDispute && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Dispute Details: {selectedDispute.title}</h3>
            <button
              onClick={() => setSelectedDispute(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evidence Bundle */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Evidence Bundle</h4>
              <div className="space-y-2">
                {selectedDispute.evidenceBundle.map((evidence, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <span>📄</span>
                    <span className="text-gray-700">{evidence}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Swarm Votes */}
            {selectedDispute.swarmVotes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Swarm Votes</h4>
                <div className="space-y-3">
                  {selectedDispute.swarmVotes.map((vote, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {vote.agentType.charAt(0).toUpperCase() + vote.agentType.slice(1)} Agent
                        </span>
                        <span className={`status-badge ${
                          vote.vote === 'approve' ? 'status-success' :
                          vote.vote === 'reject' ? 'status-error' :
                          'status-warning'
                        }`}>
                          {vote.vote}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Confidence: {vote.confidence}%
                      </div>
                      <div className="text-sm text-gray-700">
                        {vote.reasoning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedDispute.resolution && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Resolution</h4>
              <p className="text-gray-700">{selectedDispute.resolution}</p>
              {selectedDispute.onchainTransaction && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Onchain Transaction:</span>
                  <p className="text-sm font-mono text-gray-700">{selectedDispute.onchainTransaction}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
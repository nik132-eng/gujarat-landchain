'use client'

import { useState, useEffect } from 'react'

interface ApprovalItem {
  id: string
  ulpin: string
  propertyTitle: string
  applicant: string
  applicationType: 'registration' | 'transfer' | 'modification' | 'dispute_resolution'
  submittedDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  aiValidationScore: number
  swarmConsensusScore: number
  documents: string[]
  selected: boolean
  juliaosAgentValidation: boolean
  swarmConsensusReached: boolean
  onchainTransaction?: string
}

export default function BatchApprovalQueue() {
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('submittedDate')
  const [showJuliaOSValidation, setShowJuliaOSValidation] = useState(true)

  useEffect(() => {
    loadApprovalQueue()
  }, [])

  const loadApprovalQueue = () => {
    const mockItems: ApprovalItem[] = [
      {
        id: '1',
        ulpin: 'GJ-01-001-2024-001',
        propertyTitle: 'Residential Plot - Sector 15',
        applicant: 'Rajesh Patel',
        applicationType: 'registration',
        submittedDate: '2024-12-15',
        priority: 'high',
        status: 'pending',
        aiValidationScore: 94.2,
        swarmConsensusScore: 96.8,
        documents: ['Survey Report', 'Satellite Image', 'KYC Documents'],
        selected: false,
        juliaosAgentValidation: true,
        swarmConsensusReached: true,
        onchainTransaction: '0x1234567890abcdef...'
      },
      {
        id: '2',
        ulpin: 'GJ-01-002-2024-002',
        propertyTitle: 'Commercial Building - Ahmedabad',
        applicant: 'Priya Sharma',
        applicationType: 'transfer',
        submittedDate: '2024-12-14',
        priority: 'medium',
        status: 'pending',
        aiValidationScore: 91.5,
        swarmConsensusScore: 93.2,
        documents: ['Transfer Deed', 'Property Tax Receipt', 'NOC'],
        selected: false,
        juliaosAgentValidation: true,
        swarmConsensusReached: true,
        onchainTransaction: '0xabcdef1234567890...'
      },
      {
        id: '3',
        ulpin: 'GJ-01-003-2024-003',
        propertyTitle: 'Agricultural Land - Vadodara',
        applicant: 'Amit Kumar',
        applicationType: 'modification',
        submittedDate: '2024-12-13',
        priority: 'low',
        status: 'under_review',
        aiValidationScore: 88.7,
        swarmConsensusScore: 90.1,
        documents: ['Modification Request', 'Land Use Certificate'],
        selected: false,
        juliaosAgentValidation: false,
        swarmConsensusReached: false
      },
      {
        id: '4',
        ulpin: 'GJ-01-004-2024-004',
        propertyTitle: 'IT Park Plot - GIFT City',
        applicant: 'TechCorp Solutions',
        applicationType: 'registration',
        submittedDate: '2024-12-12',
        priority: 'high',
        status: 'pending',
        aiValidationScore: 97.3,
        swarmConsensusScore: 98.5,
        documents: ['Corporate Registration', 'Land Allotment Letter'],
        selected: false,
        juliaosAgentValidation: true,
        swarmConsensusReached: true,
        onchainTransaction: '0x7890abcdef123456...'
      },
      {
        id: '5',
        ulpin: 'GJ-01-005-2024-005',
        propertyTitle: 'Residential Complex - Surat',
        applicant: 'Green Valley Developers',
        applicationType: 'dispute_resolution',
        submittedDate: '2024-12-11',
        priority: 'high',
        status: 'pending',
        aiValidationScore: 85.2,
        swarmConsensusScore: 87.9,
        documents: ['Dispute Petition', 'Evidence Bundle', 'Legal Opinion'],
        selected: false,
        juliaosAgentValidation: true,
        swarmConsensusReached: false
      }
    ]

    setApprovalItems(mockItems)
  }

  const handleSelectItem = (itemId: string) => {
    setApprovalItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ))
    
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    const allIds = approvalItems.map(item => item.id)
    if (selectedItems.length === allIds.length) {
      setSelectedItems([])
      setApprovalItems(prev => prev.map(item => ({ ...item, selected: false })))
    } else {
      setSelectedItems(allIds)
      setApprovalItems(prev => prev.map(item => ({ ...item, selected: true })))
    }
  }

  const handleBatchAction = async (action: 'approve' | 'reject' | 'review') => {
    if (selectedItems.length === 0) {
      alert('Please select items to process')
      return
    }

    setIsProcessing(true)

    try {
      // Simulate batch processing with JuliaOS integration
      console.log(`Processing ${action} for items:`, selectedItems)
      
      // Simulate JuliaOS agent processing time
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Update status for selected items
      setApprovalItems(prev => prev.map(item => 
        selectedItems.includes(item.id) 
          ? { 
              ...item, 
              status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'under_review',
              onchainTransaction: action === 'approve' ? `0x${Math.random().toString(16).substring(2, 18)}...` : undefined
            }
          : item
      ))
      
      setSelectedItems([])
      
      // Show success message
      alert(`Successfully processed ${selectedItems.length} items with JuliaOS integration`)
      
    } catch (error) {
      console.error('Error processing batch action:', error)
      alert('Error processing batch action')
    } finally {
      setIsProcessing(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getApplicationTypeIcon = (type: string) => {
    switch (type) {
      case 'registration': return '📝'
      case 'transfer': return '🔄'
      case 'modification': return '✏️'
      case 'dispute_resolution': return '⚖️'
      default: return '📄'
    }
  }

  const filteredItems = approvalItems.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'submittedDate':
        return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'aiValidationScore':
        return b.aiValidationScore - a.aiValidationScore
      case 'swarmConsensusScore':
        return b.swarmConsensusScore - a.swarmConsensusScore
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Batch Actions Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="card-title">Batch Approval Queue</h3>
            <p className="card-subtitle">
              {selectedItems.length} of {approvalItems.length} items selected
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => handleBatchAction('approve')}
              disabled={selectedItems.length === 0 || isProcessing}
              className="btn-success disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Approve (${selectedItems.length})`}
            </button>
            <button
              onClick={() => handleBatchAction('reject')}
              disabled={selectedItems.length === 0 || isProcessing}
              className="btn-danger disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Reject (${selectedItems.length})`}
            </button>
            <button
              onClick={() => handleBatchAction('review')}
              disabled={selectedItems.length === 0 || isProcessing}
              className="btn-warning disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Mark for Review (${selectedItems.length})`}
            </button>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Items</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="submittedDate">Submission Date</option>
              <option value="priority">Priority</option>
              <option value="aiValidationScore">AI Validation Score</option>
              <option value="swarmConsensusScore">Swarm Consensus Score</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Show JuliaOS Validation:</label>
            <input
              type="checkbox"
              checked={showJuliaOSValidation}
              onChange={(e) => setShowJuliaOSValidation(e.target.checked)}
              className="rounded border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Approval Items Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === approvalItems.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {showJuliaOSValidation && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AI Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Swarm Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      JuliaOS Status
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleSelectItem(item.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.propertyTitle}</div>
                      <div className="text-sm text-gray-500">{item.ulpin}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.applicant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{getApplicationTypeIcon(item.applicationType)}</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {item.applicationType.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  {showJuliaOSValidation && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${item.aiValidationScore}%` }}
                            ></div>
                          </div>
                          <span>{item.aiValidationScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${item.swarmConsensusScore}%` }}
                            ></div>
                          </div>
                          <span>{item.swarmConsensusScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${item.juliaosAgentValidation ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-gray-600">Agent</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${item.swarmConsensusReached ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-gray-600">Swarm</span>
                          </div>
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.submittedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                    <button className="text-red-600 hover:text-red-900">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents Preview */}
      {selectedItems.length > 0 && (
        <div className="card">
          <h4 className="card-title mb-4">
            Documents for Selected Items ({selectedItems.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedItems.map(itemId => {
              const item = approvalItems.find(i => i.id === itemId)
              if (!item) return null
              
              return (
                <div key={itemId} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{item.propertyTitle}</h5>
                  <div className="space-y-1">
                    {item.documents.map((doc, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📄</span>
                        {doc}
                      </div>
                    ))}
                  </div>
                  {item.onchainTransaction && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">Onchain TX:</div>
                      <div className="text-xs font-mono text-gray-700 truncate">
                        {item.onchainTransaction}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 
// GL-0703: Governance Vote UI for Officials Implementation
// Sprint 7: Dispute Resolution Agent
// Gujarat LandChain × Governance Interface

/*
Governance Voting Interface for Officials
- Objective: Administrative interface for dispute resolution and land registry decisions
- Features: Vote submission, activity logs, role-based access, real-time updates
- Integration: Evidence bundles, dispute cases, and resolution tracking
*/

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from '../hooks/useSession';

// Types and Interfaces
interface DisputeCase {
  caseId: string;
  propertyUlpin: string;
  disputeType: 'ownership' | 'boundary' | 'encroachment' | 'document' | 'survey';
  status: 'pending' | 'under_review' | 'voting' | 'resolved' | 'appealed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  parties: {
    petitioner: string;
    respondent: string;
  };
  evidenceBundleId?: string;
  summary: string;
  assignedOfficials: string[];
  requiredVotes: number;
  currentVotes: number;
  deadline: string;
}

interface Vote {
  voteId: string;
  caseId: string;
  officialId: string;
  officialName: string;
  vote: 'approve' | 'reject' | 'abstain' | 'request_more_info';
  reasoning: string;
  timestamp: string;
  evidenceReviewed: string[];
}

interface ActivityLog {
  logId: string;
  caseId: string;
  action: string;
  officialId: string;
  officialName: string;
  timestamp: string;
  details: string;
  metadata?: Record<string, any>;
}

interface OfficialRole {
  roleId: string;
  name: string;
  permissions: string[];
  votingWeight: number;
  canAssignCases: boolean;
  canViewEvidence: boolean;
  canMakeDecisions: boolean;
}

const GovernanceVotingInterface: React.FC = () => {
  const { currentSession, hasPermission } = useSession();
  
  // State management
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<DisputeCase | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    disputeType: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteData, setVoteData] = useState({
    vote: 'approve' as Vote['vote'],
    reasoning: '',
    evidenceReviewed: [] as string[]
  });

  // Check permissions
  const canVote = hasPermission('governance_vote');
  const canViewEvidence = hasPermission('view_evidence');
  const canAssignCases = hasPermission('assign_cases');
  const canMakeDecisions = hasPermission('make_decisions');

  // Load disputes data
  const loadDisputes = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setDisputes(generateMockDisputes());
    } catch (error) {
      console.error('Failed to load disputes:', error);
      setDisputes(generateMockDisputes());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load votes for selected case
  const loadVotes = useCallback(async (caseId: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setVotes(generateMockVotes(caseId));
    } catch (error) {
      console.error('Failed to load votes:', error);
      setVotes(generateMockVotes(caseId));
    }
  }, []);

  // Load activity logs
  const loadActivityLogs = useCallback(async (caseId: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setActivityLogs(generateMockActivityLogs(caseId));
    } catch (error) {
      console.error('Failed to load activity logs:', error);
      setActivityLogs(generateMockActivityLogs(caseId));
    }
  }, []);

  // Handle quick vote (approve/reject without modal)
  const handleQuickVote = async (dispute: DisputeCase, vote: 'approve' | 'reject') => {
    console.log('Quick vote clicked:', vote, 'for case:', dispute.caseId);
    
    if (!currentSession) {
      alert('Please log in to vote');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new vote
      const newVote: Vote = {
        voteId: `VOTE-${Date.now()}`,
        caseId: dispute.caseId,
        officialId: currentSession.userId,
        officialName: currentSession.name,
        vote: vote,
        reasoning: `Quick ${vote} vote submitted`,
        timestamp: new Date().toISOString(),
        evidenceReviewed: []
      };

      // Add vote to the list
      setVotes(prev => [...prev, newVote]);

      // Create activity log entry
      const newActivityLog: ActivityLog = {
        logId: `LOG-${Date.now()}`,
        caseId: dispute.caseId,
        action: 'Quick vote submitted',
        officialId: currentSession.userId,
        officialName: currentSession.name,
        timestamp: new Date().toISOString(),
        details: `Quick ${vote} vote submitted for case ${dispute.caseId}`
      };

      // Add activity log
      setActivityLogs(prev => [...prev, newActivityLog]);

      // Update dispute status if needed
      const updatedVotes = [...votes, newVote];
      if (updatedVotes.length >= dispute.requiredVotes) {
        setDisputes(prev => prev.map(d => 
          d.caseId === dispute.caseId 
            ? { ...d, status: 'resolved', currentVotes: updatedVotes.length }
            : d
        ));
      } else {
        setDisputes(prev => prev.map(d => 
          d.caseId === dispute.caseId 
            ? { ...d, currentVotes: updatedVotes.length }
            : d
        ));
      }
      
      // Show success message
      alert(`Vote submitted successfully: ${vote}`);
    } catch (error) {
      console.error('Failed to submit quick vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle evidence bundle view
  const handleViewEvidence = (evidenceBundleId: string) => {
    console.log('View evidence clicked for bundle:', evidenceBundleId);
    // In a real app, this would open the evidence bundle
    alert(`Opening evidence bundle: ${evidenceBundleId}\n\nThis would typically open a modal or navigate to an evidence viewer.`);
  };

  // Submit vote
  const submitVote = async () => {
    if (!selectedCase || !voteData.reasoning.trim()) {
      alert('Please provide reasoning for your vote');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new vote
      const newVote: Vote = {
        voteId: `VOTE-${Date.now()}`,
        caseId: selectedCase.caseId,
        officialId: currentSession?.userId || 'OFF-001',
        officialName: currentSession?.name || 'Current User',
        vote: voteData.vote,
        reasoning: voteData.reasoning,
        timestamp: new Date().toISOString(),
        evidenceReviewed: voteData.evidenceReviewed
      };

      // Add vote to the list
      setVotes(prev => [...prev, newVote]);

      // Create activity log entry
      const newActivityLog: ActivityLog = {
        logId: `LOG-${Date.now()}`,
        caseId: selectedCase.caseId,
        action: 'Vote submitted',
        officialId: currentSession?.userId || 'OFF-001',
        officialName: currentSession?.name || 'Current User',
        timestamp: new Date().toISOString(),
        details: `Vote submitted: ${voteData.vote} with reasoning: ${voteData.reasoning}`
      };

      // Add activity log
      setActivityLogs(prev => [...prev, newActivityLog]);

      // Update dispute status if needed
      const updatedVotes = [...votes, newVote];
      if (updatedVotes.length >= selectedCase.requiredVotes) {
        setDisputes(prev => prev.map(d => 
          d.caseId === selectedCase.caseId 
            ? { ...d, status: 'resolved', currentVotes: updatedVotes.length }
            : d
        ));
      } else {
        setDisputes(prev => prev.map(d => 
          d.caseId === selectedCase.caseId 
            ? { ...d, currentVotes: updatedVotes.length }
            : d
        ));
      }

      // Reset form and close modal
      setShowVoteModal(false);
      setVoteData({ vote: 'approve', reasoning: '', evidenceReviewed: [] });
      
      // Show success message
      alert('Vote submitted successfully');
    } catch (error) {
      console.error('Failed to submit vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle case selection
  const handleCaseSelect = useCallback(async (case_: DisputeCase) => {
    setSelectedCase(case_);
    await loadVotes(case_.caseId);
    await loadActivityLogs(case_.caseId);
  }, [loadVotes, loadActivityLogs]);

  // Filter disputes
  const filteredDisputes = disputes.filter(dispute => {
    const matchesStatus = filter.status === 'all' || dispute.status === filter.status;
    const matchesPriority = filter.priority === 'all' || dispute.priority === filter.priority;
    const matchesType = filter.disputeType === 'all' || dispute.disputeType === filter.disputeType;
    const matchesSearch = dispute.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.propertyUlpin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesType && matchesSearch;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'voting': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'appealed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get vote progress
  const getVoteProgress = (case_: DisputeCase) => {
    const progress = (case_.currentVotes / case_.requiredVotes) * 100;
    return Math.min(progress, 100);
  };

  // Check if user has already voted
  const hasUserVoted = (caseId: string) => {
    return votes.some(vote => vote.officialId === currentSession?.userId);
  };

  // Load data on component mount
  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  if (!canVote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the governance voting interface.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Governance Voting Interface</h1>
              <p className="text-sm text-gray-600">Dispute Resolution & Land Registry Decisions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-medium">{currentSession?.name}</span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Disputes List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Active Disputes</h2>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search cases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="voting">Voting</option>
                    <option value="resolved">Resolved</option>
                    <option value="appealed">Appealed</option>
                  </select>

                  <select
                    value={filter.priority}
                    onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select
                    value={filter.disputeType}
                    onChange={(e) => setFilter({ ...filter, disputeType: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="ownership">Ownership</option>
                    <option value="boundary">Boundary</option>
                    <option value="encroachment">Encroachment</option>
                    <option value="document">Document</option>
                    <option value="survey">Survey</option>
                  </select>
                </div>

                {/* Disputes List */}
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading disputes...</p>
                    </div>
                  ) : filteredDisputes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No disputes found matching your criteria.</p>
                    </div>
                  ) : (
                    filteredDisputes.map((dispute) => (
                      <div
                        key={dispute.caseId}
                        onClick={() => handleCaseSelect(dispute)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedCase?.caseId === dispute.caseId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{ userSelect: 'none' }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{dispute.caseId}</h3>
                            <p className="text-sm text-gray-600">ULPIN: {dispute.propertyUlpin}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                              {dispute.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                              {dispute.priority}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{dispute.summary}</p>

                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div>
                            <span>Parties: {dispute.parties.petitioner} vs {dispute.parties.respondent}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span>Votes: {dispute.currentVotes}/{dispute.requiredVotes}</span>
                            <span>Deadline: {new Date(dispute.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Vote Progress Bar */}
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getVoteProgress(dispute)}%` }}
                            ></div>
                          </div>
                        </div>

                        {hasUserVoted(dispute.caseId) && (
                          <div className="mt-2 text-xs text-green-600">
                            ✓ You have voted on this case
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-700">ACTIONS</span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleCaseSelect(dispute)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                              >
                                View
                              </button>
                              {!hasUserVoted(dispute.caseId) && dispute.status === 'voting' && (
                                <>
                                  <button
                                    onClick={() => handleQuickVote(dispute, 'approve')}
                                    className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleQuickVote(dispute, 'reject')}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Case Details Panel */}
          <div className="lg:col-span-1">
            {selectedCase ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h3>
                  
                  {/* Case Information */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Case ID</label>
                      <p className="text-sm text-gray-900">{selectedCase.caseId}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Property ULPIN</label>
                      <p className="text-sm text-gray-900">{selectedCase.propertyUlpin}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Dispute Type</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedCase.disputeType.replace('_', ' ')}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Summary</label>
                      <p className="text-sm text-gray-900">{selectedCase.summary}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Parties</label>
                      <div className="text-sm text-gray-900">
                        <p>Petitioner: {selectedCase.parties.petitioner}</p>
                        <p>Respondent: {selectedCase.parties.respondent}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vote Button */}
                  {!hasUserVoted(selectedCase.caseId) && selectedCase.status === 'voting' && (
                    <button
                      onClick={() => setShowVoteModal(true)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Submit Vote
                    </button>
                  )}

                  {/* Evidence Bundle Link */}
                  {selectedCase.evidenceBundleId && canViewEvidence && (
                    <button 
                      onClick={() => handleViewEvidence(selectedCase.evidenceBundleId!)}
                      className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      View Evidence Bundle
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Select a case to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Votes and Activity Logs */}
        {selectedCase && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Votes Panel */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Votes ({votes.length})</h3>
                
                <div className="space-y-3">
                  {votes.map((vote) => (
                    <div key={vote.voteId} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{vote.officialName}</p>
                          <p className="text-sm text-gray-600">{new Date(vote.timestamp).toLocaleString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vote.vote === 'approve' ? 'bg-green-100 text-green-800' :
                          vote.vote === 'reject' ? 'bg-red-100 text-red-800' :
                          vote.vote === 'abstain' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vote.vote.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{vote.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Logs Panel */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
                
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div key={log.logId} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-600">
                          {log.officialName} • {new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.details && (
                          <p className="text-xs text-gray-700 mt-1">{log.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vote Modal */}
      {showVoteModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Vote</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vote</label>
                <select
                  value={voteData.vote}
                  onChange={(e) => setVoteData({ ...voteData, vote: e.target.value as Vote['vote'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="abstain">Abstain</option>
                  <option value="request_more_info">Request More Info</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reasoning</label>
                <textarea
                  value={voteData.reasoning}
                  onChange={(e) => setVoteData({ ...voteData, reasoning: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide detailed reasoning for your vote..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowVoteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitVote}
                disabled={isLoading || !voteData.reasoning.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Vote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock data generators
const generateMockDisputes = (): DisputeCase[] => [
  {
    caseId: 'DIS-2024-001',
    propertyUlpin: 'GJ24AB1234567890',
    disputeType: 'ownership',
    status: 'voting',
    priority: 'high',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    parties: {
      petitioner: 'Rajesh Patel',
      respondent: 'Suresh Mehta'
    },
    evidenceBundleId: 'EB-2024-001',
    summary: 'Dispute over ownership of agricultural land in Ahmedabad district. Petitioner claims ancestral rights while respondent holds current registration.',
    assignedOfficials: ['OFF-001', 'OFF-002', 'OFF-003'],
    requiredVotes: 3,
    currentVotes: 1,
    deadline: '2024-01-25T23:59:59Z'
  },
  {
    caseId: 'DIS-2024-002',
    propertyUlpin: 'GJ24CD9876543210',
    disputeType: 'boundary',
    status: 'under_review',
    priority: 'medium',
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-19T16:45:00Z',
    parties: {
      petitioner: 'Lakshmi Devi',
      respondent: 'Municipal Corporation'
    },
    evidenceBundleId: 'EB-2024-002',
    summary: 'Boundary dispute between residential property and municipal land. Petitioner alleges encroachment by local authorities.',
    assignedOfficials: ['OFF-004', 'OFF-005'],
    requiredVotes: 2,
    currentVotes: 0,
    deadline: '2024-01-30T23:59:59Z'
  }
];

const generateMockVotes = (caseId: string): Vote[] => [
  {
    voteId: 'VOTE-001',
    caseId,
    officialId: 'OFF-001',
    officialName: 'Dr. Priya Sharma',
    vote: 'approve',
    reasoning: 'Based on the evidence bundle and legal documents, the petitioner has demonstrated clear ancestral rights. The survey records support their claim.',
    timestamp: '2024-01-20T15:30:00Z',
    evidenceReviewed: ['EB-2024-001', 'LEGAL-001', 'SURVEY-001']
  }
];

const generateMockActivityLogs = (caseId: string): ActivityLog[] => [
  {
    logId: 'LOG-001',
    caseId,
    action: 'Case assigned for review',
    officialId: 'OFF-001',
    officialName: 'Dr. Priya Sharma',
    timestamp: '2024-01-15T10:30:00Z',
    details: 'Case assigned to review committee'
  },
  {
    logId: 'LOG-002',
    caseId,
    action: 'Evidence bundle generated',
    officialId: 'SYSTEM',
    officialName: 'System',
    timestamp: '2024-01-16T14:20:00Z',
    details: 'Evidence bundle EB-2024-001 created with blockchain, satellite, and legal evidence'
  },
  {
    logId: 'LOG-003',
    caseId,
    action: 'Vote submitted',
    officialId: 'OFF-001',
    officialName: 'Dr. Priya Sharma',
    timestamp: '2024-01-20T15:30:00Z',
    details: 'Vote submitted: Approve with detailed reasoning'
  }
];

export default GovernanceVotingInterface; 
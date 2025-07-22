// GL-0703: Governance Vote UI for Officials Implementation
// Sprint 7: Dispute Resolution Agent
// Gujarat LandChain × Governance Interface

/*
Governance Voting Interface for Government Officials
- Objective: Role-based interface for dispute resolution voting
- Features: Evidence review, multi-signature voting, case management
- Users: District Collector, Tehsildar, Patwari, Legal Advisor, Technical Expert
- Integration: Evidence bundles, wallet authentication, audit trails
*/

import React, { useState, useEffect, useContext } from 'react';
import { useSession } from '../context/SessionContext';

// Governance role definitions
const GOVERNANCE_ROLES = {
  'DISTRICT_COLLECTOR': {
    name: 'District Collector',
    level: 5,
    permissions: ['final_approval', 'case_assignment', 'policy_override'],
    badge_color: 'purple'
  },
  'TEHSILDAR': {
    name: 'Tehsildar',
    level: 4,
    permissions: ['regional_approval', 'case_review', 'evidence_validation'],
    badge_color: 'blue'
  },
  'PATWARI': {
    name: 'Patwari',
    level: 3,
    permissions: ['local_verification', 'field_inspection', 'data_entry'],
    badge_color: 'green'
  },
  'LEGAL_ADVISOR': {
    name: 'Legal Advisor',
    level: 3,
    permissions: ['legal_review', 'document_validation', 'compliance_check'],
    badge_color: 'orange'
  },
  'TECHNICAL_EXPERT': {
    name: 'Technical Expert',
    level: 2,
    permissions: ['satellite_analysis', 'drone_validation', 'technical_review'],
    badge_color: 'cyan'
  }
};

// Case status definitions
const CASE_STATUS = {
  'PENDING_ASSIGNMENT': 'Pending Assignment',
  'UNDER_REVIEW': 'Under Review',
  'EVIDENCE_COLLECTION': 'Evidence Collection',
  'VOTING_IN_PROGRESS': 'Voting in Progress',
  'CONSENSUS_REACHED': 'Consensus Reached',
  'RESOLVED': 'Resolved',
  'ESCALATED': 'Escalated',
  'DISMISSED': 'Dismissed'
};

// Vote types
const VOTE_TYPES = {
  'APPROVE': { label: 'Approve', color: 'green', icon: '✅' },
  'REJECT': { label: 'Reject', color: 'red', icon: '❌' },
  'NEEDS_MORE_INFO': { label: 'Needs More Info', color: 'yellow', icon: '📝' },
  'ABSTAIN': { label: 'Abstain', color: 'gray', icon: '⚫' }
};

const GovernanceVotingInterface = () => {
  const { user, authenticatedFetch } = useSession();
  const [userRole, setUserRole] = useState(null);
  const [activeCases, setActiveCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [evidenceBundle, setEvidenceBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voteHistory, setVoteHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Initialize user role and load data
  useEffect(() => {
    if (user) {
      // Determine user role (in real implementation, fetch from backend)
      const role = user.governanceRole || 'PATWARI'; // Default for demo
      setUserRole(role);
      loadActiveCases();
      loadNotifications();
    }
  }, [user]);

  const loadActiveCases = async () => {
    setIsLoading(true);
    try {
      // Mock API call to load active cases
      const mockCases = [
        {
          id: 'CASE_2025_001',
          title: 'Property Boundary Dispute - Village Bavla',
          property_ulpin: 'GJ01AA1234567890',
          status: 'UNDER_REVIEW',
          priority: 'HIGH',
          created_date: '2025-07-25',
          assigned_officials: ['DISTRICT_COLLECTOR', 'TEHSILDAR', 'PATWARI'],
          evidence_completeness: 85,
          votes_cast: 2,
          total_required_votes: 3,
          estimated_resolution: '2025-08-05'
        },
        {
          id: 'CASE_2025_002', 
          title: 'Land Transfer Verification - Gandhinagar',
          property_ulpin: 'GJ01BB9876543210',
          status: 'EVIDENCE_COLLECTION',
          priority: 'MEDIUM',
          created_date: '2025-07-28',
          assigned_officials: ['TEHSILDAR', 'LEGAL_ADVISOR'],
          evidence_completeness: 60,
          votes_cast: 0,
          total_required_votes: 2,
          estimated_resolution: '2025-08-10'
        },
        {
          id: 'CASE_2025_003',
          title: 'Survey Number Discrepancy - Surat District',
          property_ulpin: 'GJ24CC5555666677',
          status: 'VOTING_IN_PROGRESS',
          priority: 'LOW',
          created_date: '2025-07-20',
          assigned_officials: ['PATWARI', 'TECHNICAL_EXPERT'],
          evidence_completeness: 95,
          votes_cast: 1,
          total_required_votes: 2,
          estimated_resolution: '2025-08-02'
        }
      ];

      setActiveCases(mockCases);
    } catch (error) {
      console.error('Failed to load active cases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    // Mock notifications
    const mockNotifications = [
      {
        id: 'notif_1',
        type: 'NEW_CASE',
        message: 'New case assigned: Property Boundary Dispute - Village Bavla',
        timestamp: '2025-07-31T10:30:00Z',
        read: false
      },
      {
        id: 'notif_2',
        type: 'VOTE_REQUIRED',
        message: 'Your vote is required for Case CASE_2025_003',
        timestamp: '2025-07-31T09:15:00Z',
        read: false
      }
    ];

    setNotifications(mockNotifications);
  };

  const loadEvidenceBundle = async (caseId) => {
    setIsLoading(true);
    try {
      // Mock evidence bundle data
      const mockEvidenceBundle = {
        bundle_id: `bundle_${caseId}`,
        case_id: caseId,
        completeness_score: 85,
        confidence_rating: 'HIGH',
        evidence_sources: {
          blockchain: 3,
          satellite: 2,
          drone: 1,
          legal: 2,
          government: 1
        },
        summary: {
          total_transactions: 5,
          ownership_history: 'Clear title transfer from A to B',
          satellite_analysis: 'No unauthorized construction detected',
          legal_status: 'Valid property deed on record'
        },
        timeline: [
          { date: '2024-01-15', event: 'Property purchased by current owner' },
          { date: '2024-06-20', event: 'Boundary dispute filed by neighbor' },
          { date: '2025-07-25', event: 'Case opened for resolution' }
        ]
      };

      setEvidenceBundle(mockEvidenceBundle);
    } catch (error) {
      console.error('Failed to load evidence bundle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCase = (caseData) => {
    setSelectedCase(caseData);
    loadEvidenceBundle(caseData.id);
  };

  const castVote = async (voteType, reasoning) => {
    if (!selectedCase || !userRole) return;

    setIsLoading(true);
    try {
      // Prepare vote data
      const voteData = {
        case_id: selectedCase.id,
        voter_role: userRole,
        voter_address: user.walletAddress, // From session
        vote_type: voteType,
        reasoning: reasoning,
        timestamp: new Date().toISOString(),
        evidence_bundle_hash: evidenceBundle?.bundle_id
      };

      // In real implementation, this would be a blockchain transaction
      console.log('Casting vote:', voteData);

      // Mock API call to submit vote
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      // Update case status locally
      const updatedCase = {
        ...selectedCase,
        votes_cast: selectedCase.votes_cast + 1
      };
      
      setSelectedCase(updatedCase);
      
      // Update cases list
      setActiveCases(cases => 
        cases.map(c => c.id === selectedCase.id ? updatedCase : c)
      );

      alert(`Vote cast successfully: ${VOTE_TYPES[voteType].label}`);
      
    } catch (error) {
      console.error('Failed to cast vote:', error);
      alert('Failed to cast vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UNDER_REVIEW': return 'text-blue-600 bg-blue-100';
      case 'VOTING_IN_PROGRESS': return 'text-purple-600 bg-purple-100';
      case 'RESOLVED': return 'text-green-600 bg-green-100';
      case 'EVIDENCE_COLLECTION': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Render role badge
  const renderRoleBadge = () => {
    if (!userRole || !GOVERNANCE_ROLES[userRole]) return null;
    
    const role = GOVERNANCE_ROLES[userRole];
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${role.badge_color}-100 text-${role.badge_color}-800`}>
        <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
        {role.name}
      </div>
    );
  };

  // Render case list
  const renderCaseList = () => (
    <div className="space-y-4">
      {activeCases.map(caseData => (
        <div
          key={caseData.id}
          onClick={() => selectCase(caseData)}
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
            selectedCase?.id === caseData.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">{caseData.title}</h3>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(caseData.priority)}`}>
                {caseData.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseData.status)}`}>
                {CASE_STATUS[caseData.status]}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">ULPIN:</span> {caseData.property_ulpin}
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-500">
              Created: {new Date(caseData.created_date).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-gray-600">
                Evidence: {caseData.evidence_completeness}%
              </div>
              <div className="text-gray-600">
                Votes: {caseData.votes_cast}/{caseData.total_required_votes}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render evidence viewer
  const renderEvidenceViewer = () => {
    if (!evidenceBundle) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence Summary</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Completeness Score</span>
              <div className="text-2xl font-bold text-green-600">{evidenceBundle.completeness_score}%</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Confidence Rating</span>
              <div className="text-2xl font-bold text-blue-600">{evidenceBundle.confidence_rating}</div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {Object.entries(evidenceBundle.evidence_sources).map(([source, count]) => (
              <div key={source} className="text-center">
                <div className="text-lg font-semibold text-gray-800">{count}</div>
                <div className="text-xs text-gray-500 capitalize">{source}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Key Findings:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {evidenceBundle.summary.ownership_history}</li>
              <li>• {evidenceBundle.summary.satellite_analysis}</li>
              <li>• {evidenceBundle.summary.legal_status}</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Timeline</h3>
          <div className="space-y-3">
            {evidenceBundle.timeline.map((event, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{event.event}</div>
                  <div className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render voting interface
  const renderVotingInterface = () => {
    if (!selectedCase) return null;

    const [selectedVote, setSelectedVote] = useState('');
    const [reasoning, setReasoning] = useState('');

    const handleVoteSubmission = () => {
      if (!selectedVote) {
        alert('Please select a vote option');
        return;
      }
      if (!reasoning.trim()) {
        alert('Please provide reasoning for your vote');
        return;
      }
      
      castVote(selectedVote, reasoning);
      setSelectedVote('');
      setReasoning('');
    };

    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cast Your Vote</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vote Decision
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(VOTE_TYPES).map(([voteType, config]) => (
                <button
                  key={voteType}
                  onClick={() => setSelectedVote(voteType)}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    selectedVote === voteType
                      ? `border-${config.color}-500 bg-${config.color}-50 text-${config.color}-700`
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reasoning (Required)
            </label>
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide detailed reasoning for your vote decision..."
            />
          </div>

          <button
            onClick={handleVoteSubmission}
            disabled={isLoading || !selectedVote || !reasoning.trim()}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isLoading || !selectedVote || !reasoning.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Submitting Vote...' : 'Submit Vote'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Gujarat LandChain Governance</h1>
              {renderRoleBadge()}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5l-5-5h5V3h-5m5 5l5-5l-5-5"/>
                  </svg>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Welcome, {user?.name}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Case List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Active Cases</h2>
                <span className="text-sm text-gray-500">{activeCases.length} cases</span>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading cases...</p>
                </div>
              ) : (
                renderCaseList()
              )}
            </div>
          </div>

          {/* Evidence and Voting */}
          <div className="lg:col-span-2">
            {selectedCase ? (
              <div className="space-y-6">
                {/* Case Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{selectedCase.title}</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Case ID:</span>
                      <div className="text-gray-900">{selectedCase.id}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Property ULPIN:</span>
                      <div className="text-gray-900 font-mono">{selectedCase.property_ulpin}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Status:</span>
                      <div className="text-gray-900">{CASE_STATUS[selectedCase.status]}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Priority:</span>
                      <div className="text-gray-900">{selectedCase.priority}</div>
                    </div>
                  </div>
                </div>

                {/* Evidence Viewer */}
                {renderEvidenceViewer()}

                {/* Voting Interface */}
                {renderVotingInterface()}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Case</h3>
                <p className="text-gray-500">Choose a case from the list to view evidence and cast your vote.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GovernanceVotingInterface;

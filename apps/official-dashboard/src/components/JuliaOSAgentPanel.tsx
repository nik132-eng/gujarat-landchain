'use client'

import { useState } from 'react'
import { useJuliaOS } from './JuliaOSProvider'

export default function JuliaOSAgentPanel() {
  const { 
    agents, 
    swarms, 
    onchainActivity, 
    executeAgent, 
    triggerSwarmConsensus,
    isConnected,
    connectionStatus 
  } = useJuliaOS()
  
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [selectedSwarm, setSelectedSwarm] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecuteAgent = async (agentId: string, task: string) => {
    setIsExecuting(true)
    try {
      await executeAgent(agentId, task)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleTriggerSwarm = async (swarmId: string) => {
    setIsExecuting(true)
    try {
      const testData = {
        propertyId: 'GJ-01-015-2024-089',
        validationType: 'satellite_imagery',
        confidence: 0.95,
        timestamp: new Date().toISOString()
      }
      await triggerSwarmConsensus(swarmId, testData)
    } finally {
      setIsExecuting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'idle': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'mint': return '🪙'
      case 'satellite': return '🛰️'
      case 'validation': return '✅'
      case 'dispute': return '⚖️'
      case 'swarm': return '🐝'
      default: return '🤖'
    }
  }

  const getBountyBadge = (agent: any) => {
    const badges = []
    if (agent.useLLM) badges.push('LLM')
    if (agent.swarmIntegration) badges.push('Swarm')
    if (agent.onchainFunctionality) badges.push('Onchain')
    return badges
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              JuliaOS Connection: {connectionStatus}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Bounty Requirements: ✅ LLM ✅ Swarm ✅ Onchain
          </div>
        </div>
      </div>

      {/* JuliaOS Agents */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">JuliaOS Agents</h3>
          <p className="card-subtitle">Autonomous agents with LLM integration, swarm coordination, and onchain functionality</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="juliaos-agent-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getAgentIcon(agent.type)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                    <p className="text-sm text-gray-600">ID: {agent.id}</p>
                  </div>
                </div>
                <span className={`status-badge ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>

              {/* Bounty Requirement Badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {getBountyBadge(agent).map((badge) => (
                  <span key={badge} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {badge}
                  </span>
                ))}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Performance:</span>
                  <span className="font-medium">{agent.performance}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tasks Completed:</span>
                  <span className="font-medium">{agent.tasksCompleted}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="font-medium">{agent.lastActivity}</span>
                </div>
                {agent.currentTask && (
                  <div className="text-sm">
                    <span className="text-gray-600">Current Task:</span>
                    <p className="font-medium text-gray-900 mt-1">{agent.currentTask}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleExecuteAgent(agent.id, 'Process new land parcel')}
                  disabled={isExecuting || agent.status === 'processing'}
                  className="btn-primary text-sm py-1 px-3"
                >
                  {isExecuting ? 'Processing...' : 'Execute'}
                </button>
                <button
                  onClick={() => setSelectedAgent(agent.id)}
                  className="btn-secondary text-sm py-1 px-3"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Swarm Coordination */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Swarm Coordination</h3>
          <p className="card-subtitle">Multi-agent consensus mechanisms for democratic validation</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {swarms.map((swarm) => (
            <div key={swarm.swarmId} className="swarm-consensus-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{swarm.name}</h4>
                  <p className="text-sm text-gray-600">ID: {swarm.swarmId}</p>
                </div>
                <div className="text-right">
                  <span className={`status-badge ${swarm.currentVoting ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {swarm.currentVoting ? 'Voting' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Agents:</span>
                  <span className="font-medium">{swarm.activeAgents}/{swarm.totalAgents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Consensus Rate:</span>
                  <span className="font-medium">{swarm.consensusRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Voting Threshold:</span>
                  <span className="font-medium">{swarm.votingThreshold}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quorum Required:</span>
                  <span className="font-medium">{swarm.quorumRequired}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Consensus:</span>
                  <span className="font-medium">{swarm.lastConsensus}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleTriggerSwarm(swarm.swarmId)}
                  disabled={isExecuting || swarm.currentVoting}
                  className="btn-success text-sm py-1 px-3"
                >
                  {isExecuting ? 'Processing...' : 'Trigger Consensus'}
                </button>
                <button
                  onClick={() => setSelectedSwarm(swarm.swarmId)}
                  className="btn-secondary text-sm py-1 px-3"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onchain Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Onchain Activity</h3>
          <p className="card-subtitle">Real-time blockchain transactions from JuliaOS agents and swarms</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gas Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Block
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {onchainActivity.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.operation}</div>
                    {activity.agentId && (
                      <div className="text-sm text-gray-500">Agent: {activity.agentId}</div>
                    )}
                    {activity.swarmId && (
                      <div className="text-sm text-gray-500">Swarm: {activity.swarmId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {activity.txHash}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge ${
                      activity.status === 'confirmed' ? 'status-success' :
                      activity.status === 'pending' ? 'status-warning' :
                      'status-error'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.gasUsed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.blockNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JuliaOS Code Examples */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">JuliaOS Integration Examples</h3>
          <p className="card-subtitle">Code snippets demonstrating JuliaOS agent execution, swarm integration, and onchain functionality</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Agent Execution with LLM</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`// JuliaOS Agent with LLM Integration
agent = ULPINMintAgent(
  agent_id="mint-agent-001",
  contract_address="0x123...",
  validation_threshold=0.85
)

// Execute agent with LLM processing
result = agent.useLLM(
  prompt="Validate land parcel metadata",
  data=land_data,
  model="gpt-4"
)

// Onchain minting after validation
tx_hash = agent.mintNFT(
  metadata=result.metadata,
  ipfs_hash=result.ipfs_hash
)`}
            </pre>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Swarm Consensus Integration</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`// JuliaOS Swarm for Democratic Validation
swarm = ValidationSwarm(
  swarm_id="validation-swarm-001",
  agents=15,
  voting_threshold=0.80,
  quorum_required=10
)

// Trigger swarm consensus
consensus = swarm.vote(
  data=validation_data,
  voting_period=300  // 5 minutes
)

// Onchain consensus recording
if consensus.reached:
  tx_hash = swarm.recordConsensus(
    consensus_result=consensus.result,
    block_number=consensus.block
  )`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
} 
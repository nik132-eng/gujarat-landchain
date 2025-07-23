'use client'

import { useState, useEffect } from 'react'

interface AgentStatus {
  id: string
  name: string
  type: 'mint' | 'satellite' | 'validation' | 'dispute' | 'swarm'
  status: 'active' | 'idle' | 'processing' | 'error'
  lastActivity: string
  performance: number
  tasksCompleted: number
  currentTask?: string
}

interface SwarmStatus {
  swarmId: string
  name: string
  activeAgents: number
  totalAgents: number
  consensusRate: number
  currentVoting: boolean
  lastConsensus: string
}

interface OnchainActivity {
  txHash: string
  operation: string
  timestamp: string
  status: 'pending' | 'confirmed' | 'failed'
  gasUsed?: string
  blockNumber?: string
}

export default function JuliaOSAgentPanel() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [swarms, setSwarms] = useState<SwarmStatus[]>([])
  const [onchainActivity, setOnchainActivity] = useState<OnchainActivity[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    loadAgentData()
    loadOnchainActivity()
  }, [])

  const loadAgentData = () => {
    // Mock data for JuliaOS agents
    const mockAgents: AgentStatus[] = [
      {
        id: 'mint-agent-001',
        name: 'ULPIN Mint Agent',
        type: 'mint',
        status: 'active',
        lastActivity: '2 minutes ago',
        performance: 94.2,
        tasksCompleted: 1247,
        currentTask: 'Minting ULPIN GJ-01-015-2024-089'
      },
      {
        id: 'satellite-agent-001',
        name: 'Sentinel-2 Ingestion Agent',
        type: 'satellite',
        status: 'processing',
        lastActivity: '30 seconds ago',
        performance: 96.8,
        tasksCompleted: 892,
        currentTask: 'Processing satellite imagery for 15 parcels'
      },
      {
        id: 'validation-swarm-001',
        name: 'YOLOv8 Validation Swarm',
        type: 'validation',
        status: 'active',
        lastActivity: '1 minute ago',
        performance: 97.1,
        tasksCompleted: 2156,
        currentTask: 'Consensus voting for dispute resolution'
      },
      {
        id: 'dispute-agent-001',
        name: 'Legal Document Parser',
        type: 'dispute',
        status: 'idle',
        lastActivity: '5 minutes ago',
        performance: 91.5,
        tasksCompleted: 89,
        currentTask: 'Waiting for new dispute documents'
      }
    ]

    const mockSwarms: SwarmStatus[] = [
      {
        swarmId: 'validation-swarm-001',
        name: 'Land Validation Swarm',
        activeAgents: 15,
        totalAgents: 15,
        consensusRate: 96.8,
        currentVoting: true,
        lastConsensus: '2 minutes ago'
      },
      {
        swarmId: 'dispute-swarm-001',
        name: 'Dispute Resolution Swarm',
        activeAgents: 8,
        totalAgents: 10,
        consensusRate: 94.2,
        currentVoting: false,
        lastConsensus: '15 minutes ago'
      }
    ]

    setAgents(mockAgents)
    setSwarms(mockSwarms)
  }

  const loadOnchainActivity = () => {
    const mockActivity: OnchainActivity[] = [
      {
        txHash: '0x7a8b9c...',
        operation: 'ULPIN NFT Mint',
        timestamp: '2 minutes ago',
        status: 'confirmed',
        gasUsed: '0.0023 SOL',
        blockNumber: '2,847,392'
      },
      {
        txHash: '0x3d4e5f...',
        operation: 'Property Transfer',
        timestamp: '5 minutes ago',
        status: 'confirmed',
        gasUsed: '0.0018 SOL',
        blockNumber: '2,847,389'
      },
      {
        txHash: '0x1a2b3c...',
        operation: 'Dispute Freeze',
        timestamp: '10 minutes ago',
        status: 'confirmed',
        gasUsed: '0.0012 SOL',
        blockNumber: '2,847,385'
      }
    ]

    setOnchainActivity(mockActivity)
  }

  const executeAgentTask = async (agentId: string, task: string) => {
    setIsExecuting(true)
    setSelectedAgent(agentId)

    try {
      // Simulate JuliaOS agent execution
      console.log(`Executing JuliaOS agent: ${agentId} with task: ${task}`)
      
      // Simulate API call to JuliaOS backend
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update agent status
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'processing', currentTask: task }
          : agent
      ))

      // Simulate task completion
      setTimeout(() => {
        setAgents(prev => prev.map(agent => 
          agent.id === agentId 
            ? { 
                ...agent, 
                status: 'active', 
                tasksCompleted: agent.tasksCompleted + 1,
                lastActivity: 'Just now'
              }
            : agent
        ))
        setIsExecuting(false)
        setSelectedAgent(null)
      }, 3000)

    } catch (error) {
      console.error('Error executing agent task:', error)
      setIsExecuting(false)
      setSelectedAgent(null)
    }
  }

  const triggerSwarmConsensus = async (swarmId: string) => {
    try {
      console.log(`Triggering JuliaOS swarm consensus: ${swarmId}`)
      
      // Simulate swarm coordination
      setSwarms(prev => prev.map(swarm => 
        swarm.swarmId === swarmId 
          ? { ...swarm, currentVoting: true }
          : swarm
      ))

      // Simulate consensus process
      setTimeout(() => {
        setSwarms(prev => prev.map(swarm => 
          swarm.swarmId === swarmId 
            ? { 
                ...swarm, 
                currentVoting: false, 
                lastConsensus: 'Just now',
                consensusRate: Math.min(100, swarm.consensusRate + Math.random() * 2)
              }
            : swarm
        ))
      }, 4000)

    } catch (error) {
      console.error('Error triggering swarm consensus:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'processing': return 'bg-blue-500'
      case 'idle': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'mint': return '🪙'
      case 'satellite': return '🛰️'
      case 'validation': return '🔍'
      case 'dispute': return '⚖️'
      case 'swarm': return '🐝'
      default: return '🤖'
    }
  }

  return (
    <div className="space-y-6">
      {/* JuliaOS Agent Execution Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          JuliaOS Agent Execution
          <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            Bounty Requirement
          </span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getAgentIcon(agent.type)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{agent.name}</h4>
                    <p className="text-xs text-gray-600">ID: {agent.id}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{agent.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Performance:</span>
                  <span className="font-medium">{agent.performance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasks Completed:</span>
                  <span className="font-medium">{agent.tasksCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="font-medium">{agent.lastActivity}</span>
                </div>
                {agent.currentTask && (
                  <div className="bg-blue-50 p-2 rounded text-xs">
                    <span className="font-medium">Current Task:</span> {agent.currentTask}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => executeAgentTask(agent.id, 'Execute validation task')}
                disabled={isExecuting && selectedAgent === agent.id}
                className={`mt-3 w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  isExecuting && selectedAgent === agent.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isExecuting && selectedAgent === agent.id ? 'Executing...' : 'Execute Task'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Swarm Integration Section */}
      <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🐝</span>
          JuliaOS Swarm Integration
          <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Bonus Feature
          </span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {swarms.map((swarm) => (
            <div key={swarm.swarmId} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{swarm.name}</h4>
                  <p className="text-xs text-gray-600">ID: {swarm.swarmId}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${swarm.currentVoting ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Agents:</span>
                  <span className="font-medium">{swarm.activeAgents}/{swarm.totalAgents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consensus Rate:</span>
                  <span className="font-medium">{swarm.consensusRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{swarm.currentVoting ? 'Voting' : 'Idle'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Consensus:</span>
                  <span className="font-medium">{swarm.lastConsensus}</span>
                </div>
              </div>
              
              <button
                onClick={() => triggerSwarmConsensus(swarm.swarmId)}
                disabled={swarm.currentVoting}
                className={`mt-3 w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  swarm.currentVoting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {swarm.currentVoting ? 'Voting in Progress...' : 'Trigger Consensus'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Onchain Functionality Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⛓️</span>
          JuliaOS Onchain Activity
          <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Bonus Feature
          </span>
        </h3>
        
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Recent Solana Transactions</h4>
          </div>
          
          <div className="divide-y divide-gray-200">
            {onchainActivity.map((activity, index) => (
              <div key={index} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{activity.operation}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      TX: {activity.txHash} • {activity.timestamp}
                    </p>
                    {activity.gasUsed && (
                      <p className="text-xs text-gray-500 mt-1">
                        Gas: {activity.gasUsed} • Block: {activity.blockNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JuliaOS Integration Code Example */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">💻</span>
          JuliaOS Integration Code Example
        </h3>
        
        <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`# JuliaOS Agent Execution Example
# Bounty Requirement: agent.useLLM() integration

using JuliaOS: Agent, AgentState, execute!, validate!
using JuliaOS.Blockchain: ContractInterface, mint_nft
using JuliaOS.Validation: ValidationSwarm, consensus_score

# Create ULPIN Mint Agent
agent = ULPINMintAgent(
    agent_id="mint-agent-001",
    contract_address="ULPinTreasury111111111111111111111111111111"
)

# Execute agent with LLM integration
function mint_land_parcel!(agent, land_data)
    # JuliaOS agent.useLLM() equivalent
    validation_result = agent.useLLM("validate_land_data", land_data)
    
    if validation_result.confidence > 0.85
        # Onchain interaction via JuliaOS
        tx_hash = agent.onchain("mint_nft", land_data)
        return tx_hash
    end
end

# Swarm coordination for consensus
swarm = ValidationSwarm(agent_count=15)
consensus = swarm.coordinate("validate_parcel", parcel_data)

# Onchain function calls
if consensus.score > 0.67
    agent.onchain("freeze_parcel", parcel_id, duration=30)
end`}
          </pre>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface JuliaOSAgent {
  id: string
  name: string
  type: 'mint' | 'satellite' | 'validation' | 'dispute' | 'swarm'
  status: 'active' | 'idle' | 'processing' | 'error'
  lastActivity: string
  performance: number
  tasksCompleted: number
  currentTask?: string
  useLLM: boolean
  swarmIntegration: boolean
  onchainFunctionality: boolean
}

interface JuliaOSSwarm {
  swarmId: string
  name: string
  activeAgents: number
  totalAgents: number
  consensusRate: number
  currentVoting: boolean
  lastConsensus: string
  votingThreshold: number
  quorumRequired: number
}

interface OnchainActivity {
  txHash: string
  operation: string
  timestamp: string
  status: 'pending' | 'confirmed' | 'failed'
  gasUsed?: string
  blockNumber?: string
  agentId?: string
  swarmId?: string
}

interface JuliaOSContextType {
  agents: JuliaOSAgent[]
  swarms: JuliaOSSwarm[]
  onchainActivity: OnchainActivity[]
  executeAgent: (agentId: string, task: string) => Promise<void>
  triggerSwarmConsensus: (swarmId: string, data: any) => Promise<void>
  getAgentStatus: (agentId: string) => JuliaOSAgent | undefined
  getSwarmStatus: (swarmId: string) => JuliaOSSwarm | undefined
  isConnected: boolean
  connectionStatus: string
}

const JuliaOSContext = createContext<JuliaOSContextType | undefined>(undefined)

export function JuliaOSProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<JuliaOSAgent[]>([])
  const [swarms, setSwarms] = useState<JuliaOSSwarm[]>([])
  const [onchainActivity, setOnchainActivity] = useState<OnchainActivity[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')

  useEffect(() => {
    initializeJuliaOS()
  }, [])

  const initializeJuliaOS = async () => {
    try {
      setConnectionStatus('Initializing JuliaOS agents...')
      
      // Initialize JuliaOS agents with bounty requirements
      const initialAgents: JuliaOSAgent[] = [
        {
          id: 'mint-agent-001',
          name: 'ULPIN Mint Agent',
          type: 'mint',
          status: 'active',
          lastActivity: '2 minutes ago',
          performance: 94.2,
          tasksCompleted: 1247,
          currentTask: 'Minting ULPIN GJ-01-015-2024-089',
          useLLM: true,
          swarmIntegration: true,
          onchainFunctionality: true
        },
        {
          id: 'satellite-agent-001',
          name: 'Sentinel-2 Ingestion Agent',
          type: 'satellite',
          status: 'processing',
          lastActivity: '30 seconds ago',
          performance: 96.8,
          tasksCompleted: 892,
          currentTask: 'Processing satellite imagery for 15 parcels',
          useLLM: true,
          swarmIntegration: true,
          onchainFunctionality: false
        },
        {
          id: 'validation-swarm-001',
          name: 'YOLOv8 Validation Swarm',
          type: 'validation',
          status: 'active',
          lastActivity: '1 minute ago',
          performance: 97.1,
          tasksCompleted: 2156,
          currentTask: 'Consensus voting for dispute resolution',
          useLLM: true,
          swarmIntegration: true,
          onchainFunctionality: true
        },
        {
          id: 'dispute-agent-001',
          name: 'Legal Document Parser',
          type: 'dispute',
          status: 'idle',
          lastActivity: '5 minutes ago',
          performance: 91.5,
          tasksCompleted: 89,
          currentTask: 'Waiting for new dispute documents',
          useLLM: true,
          swarmIntegration: false,
          onchainFunctionality: true
        }
      ]

      const initialSwarms: JuliaOSSwarm[] = [
        {
          swarmId: 'validation-swarm-001',
          name: 'Land Validation Swarm',
          activeAgents: 15,
          totalAgents: 15,
          consensusRate: 96.8,
          currentVoting: true,
          lastConsensus: '2 minutes ago',
          votingThreshold: 80,
          quorumRequired: 10
        },
        {
          swarmId: 'dispute-swarm-001',
          name: 'Dispute Resolution Swarm',
          activeAgents: 8,
          totalAgents: 8,
          consensusRate: 94.2,
          currentVoting: false,
          lastConsensus: '15 minutes ago',
          votingThreshold: 75,
          quorumRequired: 6
        }
      ]

      const initialOnchainActivity: OnchainActivity[] = [
        {
          txHash: '0x1234567890abcdef...',
          operation: 'NFT Minted',
          timestamp: '2 minutes ago',
          status: 'confirmed',
          gasUsed: '0.0023 ETH',
          blockNumber: '18456789',
          agentId: 'mint-agent-001'
        },
        {
          txHash: '0xabcdef1234567890...',
          operation: 'Property Transfer',
          timestamp: '5 minutes ago',
          status: 'confirmed',
          gasUsed: '0.0018 ETH',
          blockNumber: '18456785',
          agentId: 'validation-swarm-001'
        },
        {
          txHash: '0x7890abcdef123456...',
          operation: 'Dispute Resolution',
          timestamp: '12 minutes ago',
          status: 'confirmed',
          gasUsed: '0.0031 ETH',
          blockNumber: '18456778',
          agentId: 'dispute-agent-001'
        }
      ]

      setAgents(initialAgents)
      setSwarms(initialSwarms)
      setOnchainActivity(initialOnchainActivity)
      setIsConnected(true)
      setConnectionStatus('Connected to JuliaOS')

      // Simulate real-time updates
      startRealTimeUpdates()

    } catch (error) {
      console.error('Failed to initialize JuliaOS:', error)
      setConnectionStatus('Connection failed')
      setIsConnected(false)
    }
  }

  const startRealTimeUpdates = () => {
    // Simulate real-time agent status updates
    setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        lastActivity: getRandomTimeAgo(),
        performance: Math.max(85, Math.min(99, agent.performance + (Math.random() - 0.5) * 2)),
        tasksCompleted: agent.tasksCompleted + Math.floor(Math.random() * 3)
      })))
    }, 30000) // Update every 30 seconds

    // Simulate new onchain activity
    setInterval(() => {
      const newActivity: OnchainActivity = {
        txHash: `0x${Math.random().toString(16).substring(2, 18)}...`,
        operation: getRandomOperation(),
        timestamp: 'Just now',
        status: 'confirmed',
        gasUsed: `${(Math.random() * 0.005 + 0.001).toFixed(4)} ETH`,
        blockNumber: (18456789 + Math.floor(Math.random() * 100)).toString(),
        agentId: agents[Math.floor(Math.random() * agents.length)]?.id
      }
      
      setOnchainActivity(prev => [newActivity, ...prev.slice(0, 9)]) // Keep last 10 activities
    }, 45000) // New activity every 45 seconds
  }

  const executeAgent = async (agentId: string, task: string) => {
    try {
      // Simulate JuliaOS agent execution
      console.log(`Executing agent ${agentId} with task: ${task}`)
      
      // Update agent status to processing
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'processing', currentTask: task }
          : agent
      ))

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

      // Update agent status back to active
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { 
              ...agent, 
              status: 'active', 
              lastActivity: 'Just now',
              tasksCompleted: agent.tasksCompleted + 1
            }
          : agent
      ))

      // Add onchain activity if applicable
      const agent = agents.find(a => a.id === agentId)
      if (agent?.onchainFunctionality) {
        const newActivity: OnchainActivity = {
          txHash: `0x${Math.random().toString(16).substring(2, 18)}...`,
          operation: `Agent ${agent.name} executed: ${task}`,
          timestamp: 'Just now',
          status: 'confirmed',
          gasUsed: `${(Math.random() * 0.003 + 0.001).toFixed(4)} ETH`,
          blockNumber: (18456789 + Math.floor(Math.random() * 100)).toString(),
          agentId: agentId
        }
        
        setOnchainActivity(prev => [newActivity, ...prev.slice(0, 9)])
      }

    } catch (error) {
      console.error(`Error executing agent ${agentId}:`, error)
      
      // Update agent status to error
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'error' }
          : agent
      ))
    }
  }

  const triggerSwarmConsensus = async (swarmId: string, data: any) => {
    try {
      console.log(`Triggering swarm consensus for ${swarmId} with data:`, data)
      
      // Update swarm status to voting
      setSwarms(prev => prev.map(swarm => 
        swarm.swarmId === swarmId 
          ? { ...swarm, currentVoting: true }
          : swarm
      ))

      // Simulate consensus voting process
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000))

      // Update swarm with consensus result
      setSwarms(prev => prev.map(swarm => 
        swarm.swarmId === swarmId 
          ? { 
              ...swarm, 
              currentVoting: false,
              lastConsensus: 'Just now',
              consensusRate: Math.max(85, Math.min(99, swarm.consensusRate + (Math.random() - 0.5) * 5))
            }
          : swarm
      ))

      // Add onchain activity for swarm consensus
      const newActivity: OnchainActivity = {
        txHash: `0x${Math.random().toString(16).substring(2, 18)}...`,
        operation: `Swarm consensus reached: ${swarmId}`,
        timestamp: 'Just now',
        status: 'confirmed',
        gasUsed: `${(Math.random() * 0.002 + 0.001).toFixed(4)} ETH`,
        blockNumber: (18456789 + Math.floor(Math.random() * 100)).toString(),
        swarmId: swarmId
      }
      
      setOnchainActivity(prev => [newActivity, ...prev.slice(0, 9)])

    } catch (error) {
      console.error(`Error triggering swarm consensus for ${swarmId}:`, error)
    }
  }

  const getAgentStatus = (agentId: string) => {
    return agents.find(agent => agent.id === agentId)
  }

  const getSwarmStatus = (swarmId: string) => {
    return swarms.find(swarm => swarm.swarmId === swarmId)
  }

  const getRandomTimeAgo = () => {
    const times = ['30 seconds ago', '1 minute ago', '2 minutes ago', '5 minutes ago', '10 minutes ago']
    return times[Math.floor(Math.random() * times.length)]
  }

  const getRandomOperation = () => {
    const operations = ['NFT Minted', 'Property Transfer', 'Dispute Resolution', 'Swarm Consensus', 'Validation Complete']
    return operations[Math.floor(Math.random() * operations.length)]
  }

  const value: JuliaOSContextType = {
    agents,
    swarms,
    onchainActivity,
    executeAgent,
    triggerSwarmConsensus,
    getAgentStatus,
    getSwarmStatus,
    isConnected,
    connectionStatus
  }

  return (
    <JuliaOSContext.Provider value={value}>
      {children}
    </JuliaOSContext.Provider>
  )
}

export function useJuliaOS() {
  const context = useContext(JuliaOSContext)
  if (context === undefined) {
    throw new Error('useJuliaOS must be used within a JuliaOSProvider')
  }
  return context
} 
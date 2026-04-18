import { useState, useEffect, useCallback } from 'react'
import NexusLayout from '../../components/nexus/NexusLayout'
import NexusCentralNode from '../../components/nexus/NexusCentralNode'
import AgentNode from '../../components/nexus/AgentNode'
import ConnectionLine from '../../components/nexus/ConnectionLine'
import AgentDetailPanel from '../../components/nexus/AgentDetailPanel'
import CarSensorSimulation from '../../components/nexus/CarSensorSimulation'
import { useWebSocket } from '../../hooks/useWebSocket'

const AGENTS = [
  { id: 'SYS-02', name: 'COGNOS', icon: '🧠', color: 'var(--agent-cognos)', x: 'top-[20%] left-[30%]', desc: 'Issue Detection Engine', status: 'Optimal', uptime: '99.9%', processed: 14205, rpm: 120 },
  { id: 'SYS-03', name: 'VIRA', icon: '🎙️', color: 'var(--agent-vira)', x: 'top-[20%] left-[70%]', desc: 'Citizen Voice/Chat Interface', status: 'Optimal', uptime: '100%', processed: 3450, rpm: 45 },
  { id: 'SYS-04', name: 'COMMANDER', icon: '⚙️', color: 'var(--agent-commander)', x: 'top-[50%] left-[85%]', desc: 'Task Auto-Assignment Engine', status: 'Optimal', uptime: '99.9%', processed: 4208, rpm: 80 },
  { id: 'SYS-05', name: 'FLEET', icon: '🌐', color: 'var(--agent-fleet)', x: 'top-[80%] left-[75%]', desc: 'Cross-MC Analytics', status: 'Optimal', uptime: '99.8%', processed: 890, rpm: 15 },
  { id: 'SYS-06', name: 'SENTINEL', icon: '🛡️', color: 'var(--agent-sentinel)', x: 'top-[35%] left-[85%]', desc: 'Security & PBAC', status: 'Optimal', uptime: '100%', processed: 85940, rpm: 540 },
  { id: 'SYS-07', name: 'LOOP', icon: '♻️', color: 'var(--agent-loop)', x: 'top-[85%] left-[50%]', desc: 'Completion Verification', status: 'Optimal', uptime: '99.9%', processed: 3105, rpm: 25 },
  { id: 'SYS-08', name: 'GUARDIAN', icon: '⚔️', color: 'var(--agent-guardian)', x: 'top-[80%] left-[25%]', desc: 'Deadline Escalation Engine', status: 'Optimal', uptime: '100%', processed: 120, rpm: 5 },
  { id: 'SYS-09', name: 'PRESCIENT', icon: '📊', color: 'var(--agent-prescient)', x: 'top-[50%] left-[15%]', desc: 'Reporting & Forecasting', status: 'Optimal', uptime: '99.9%', processed: 8, rpm: 0.1 },
  { id: 'SYS-10', name: 'ORACLE', icon: '🔮', color: 'var(--agent-oracle)', x: 'top-[35%] left-[15%]', desc: 'Fund & Resource Intelligence', status: 'Optimal', uptime: '99.5%', processed: 4, rpm: 0.01 },
  { id: 'SYS-11', name: 'FIELD_COPILOT', icon: '👷', color: 'var(--agent-copilot)', x: 'top-[65%] left-[15%]', desc: 'Worker AI Assistant', status: 'Optimal', uptime: '99.9%', processed: 485, rpm: 12 },
]

// To connect effectively with SVG, we map percentages for `x1`, `y1` parameters.
// The strings form 'top-[X%] left-[Y%]' which we can regex to get X and Y.
function getPercentFromTailwind(twClass: string): { top: string, left: string } {
  const topMatch = twClass.match(/top-\[?([0-9.]+)%?\]?/)
  const leftMatch = twClass.match(/left-\[?([0-9.]+)%?\]?/)
  return {
    top: topMatch ? `${topMatch[1]}%` : '50%',
    left: leftMatch ? `${leftMatch[1]}%` : '50%'
  }
}

import { useApi } from '../../hooks/useApi'

// ... Keep existing up to here ...
export default function ConstellationPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [activeConnections, setActiveConnections] = useState<string[]>([])
  const [processingNodes, setProcessingNodes] = useState<string[]>([])
  const { fetchApi } = useApi()
  const [isSimulating, setIsSimulating] = useState(false)
  const [showSimulation, setShowSimulation] = useState(false)
  
  const triggerCarSensorMock = () => {
    setShowSimulation(true)
    setIsSimulating(true)
  }

  const handleSimulationComplete = useCallback(async (payload: any) => {
    try {
      await fetchApi('/api/nexus/process', {
        method: 'POST',
        body: payload
      })
    } catch(e) {
      console.error('NEXUS process error:', e)
    }
  }, [fetchApi])

  const handleSimulationClose = useCallback(() => {
    setShowSimulation(false)
    setIsSimulating(false)
  }, [])

  useWebSocket({
    channel: 'agent_events?role=nexus_admin',
    onMessage: (data: any) => {
      if (data && data.agent) {
        setActiveConnections(prev => [...prev.filter(id => id !== data.agent), data.agent].slice(-3))
        setProcessingNodes(prev => [...prev.filter(id => id !== data.agent), data.agent].slice(-2))
      }
    }
  })

  useEffect(() => {
    // Clear processing states every few seconds if no activities
    const interval = setInterval(() => {
      setActiveConnections(prev => prev.slice(1)) // fade out oldest
      setProcessingNodes(prev => prev.slice(1))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const selectedAgentData = AGENTS.find(a => a.id === selectedAgentId) || null

  return (
    <NexusLayout>
      {/* Car Sensor Simulation Overlay */}
      {showSimulation && (
        <CarSensorSimulation
          onComplete={handleSimulationComplete}
          onClose={handleSimulationClose}
        />
      )}
      <div className="absolute inset-0 pb-16"> {/* push up to avoid ticker */}
        
        {/* Helper Action Buttons Overlay */}
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={triggerCarSensorMock}
            disabled={isSimulating}
            className="flex items-center gap-2 bg-gradient-to-r from-nexus-glow to-primary px-4 py-2 rounded-xl text-white font-bold text-sm shadow-lg shadow-nexus-glow/20 transition-all hover:scale-105"
          >
            {isSimulating ? 'Sending Signal...' : '🚗 Simulate Car Sensor'}
          </button>
        </div>
        
        {/* SVG Drawing Canvas for connections */}
        <div className="absolute inset-0 pointer-events-none z-10 w-full h-full">
           {AGENTS.map(agent => {
             const coords = getPercentFromTailwind(agent.x)
             const isActive = activeConnections.includes(agent.id)
             return (
               <ConnectionLine 
                 key={agent.id}
                 id={agent.id}
                 startX="50%"   // Center (NEXUS)
                 startY="50%"   // Center (NEXUS)
                 endX={coords.left}
                 endY={coords.top}
                 isActive={isActive}
                 color={agent.color}
               />
             )
           })}
        </div>

        {/* Outer Orbital Ring Guide */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] min-w-[600px] min-h-[600px] max-w-[900px] max-h-[900px] rounded-full border border-white/5 border-dashed z-0 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vh] min-w-[300px] min-h-[300px] max-w-[500px] max-h-[500px] rounded-full border border-white/5 border-dashed z-0 pointer-events-none opacity-50" />

        <NexusCentralNode onClick={() => setSelectedAgentId(null)} isActive={activeConnections.length > 0} />

        {/* Orbiting Agents */}
        {AGENTS.map(agent => (
           <AgentNode 
             key={agent.id}
             id={agent.id}
             name={agent.name}
             icon={agent.icon}
             color={agent.color}
             x={agent.x}
             selected={selectedAgentId === agent.id}
             onClick={() => setSelectedAgentId(agent.id)}
             status={processingNodes.includes(agent.id) ? 'processing' : 'idle'}
           />
        ))}

        <AgentDetailPanel agent={selectedAgentData ? {
           ...selectedAgentData,
           description: selectedAgentData.desc,
           processedTotal: selectedAgentData.processed,
        } : null} onClose={() => setSelectedAgentId(null)} />
      </div>
    </NexusLayout>
  )
}

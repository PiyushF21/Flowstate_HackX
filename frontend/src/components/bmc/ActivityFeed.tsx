import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useWebSocket } from '../../hooks/useWebSocket'

interface ActivityEvent {
  id: string
  agent: string
  action: string
  timestamp: string
}

const AGENT_STYLES: Record<string, { icon: string; color: string }> = {
  COGNOS: { icon: '🔍', color: 'text-agent-cognos' },
  COMMANDER: { icon: '⚙️', color: 'text-agent-commander' },
  GUARDIAN: { icon: '🚨', color: 'text-agent-guardian' },
  LOOP: { icon: '✅', color: 'text-agent-loop' },
  SENTINEL: { icon: '🛡️', color: 'text-text-muted' },
  NEXUS: { icon: '🧠', color: 'text-primary' },
  VIRA: { icon: '🎙️', color: 'text-agent-vira' },
}

const MOCK_EVENTS: ActivityEvent[] = [
  { id: '1', agent: 'COGNOS', action: 'Classified: Pothole — HIGH severity (Ward K-West)', timestamp: '10:31 AM' },
  { id: '2', agent: 'COMMANDER', action: 'Assigned WRK-015 to ISS-0042 (2.3 km, score 0.87)', timestamp: '10:35 AM' },
  { id: '3', agent: 'GUARDIAN', action: 'ISS-0014 is 75 min overdue — escalating to BMC supervisor', timestamp: '10:42 AM' },
  { id: '4', agent: 'LOOP', action: 'ISS-0038 verified and resolved by Fleet Leader Suresh Naik', timestamp: '10:45 AM' },
] as ActivityEvent[]

export default function ActivityFeed({ className }: { className?: string }) {
  const [events, setEvents] = useState<ActivityEvent[]>(MOCK_EVENTS)

  useWebSocket({
    channel: 'agent_events?role=bmc_supervisor',
    onMessage: (data: any) => {
       if (data && data.agent) {
         setEvents(prev => {
            const newEvent: ActivityEvent = {
               id: Date.now().toString(),
               agent: data.agent,
               action: data.action || `Executed workflow step: ${data.graph_mode || 'task_assigned'}`,
               timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            return [newEvent, ...prev].slice(0, 50) // keep last 50
         })
       }
    }
  })

  useEffect(() => {
    // keeping mock just in case there's no data
  }, [])

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-text-primary mb-3">🔴 Live Activity Feed</h3>
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {events.map((event) => {
            const style = AGENT_STYLES[event.agent] || { icon: '🤖', color: 'text-text-muted' }
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-elevated border border-border"
              >
                <span className="text-sm mt-0.5">{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-bold ${style.color}`}>{event.agent}</span>
                    <span className="text-[10px] text-text-muted">{event.timestamp}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{event.action}</p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

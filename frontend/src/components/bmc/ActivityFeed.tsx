import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

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
  { id: '5', agent: 'COGNOS', action: 'Vision: Fallen divider detected — CRITICAL (SV Road)', timestamp: '11:16 AM' },
  { id: '6', agent: 'COMMANDER', action: 'Preempting: Reassigned WRK-008 from LOW to CRITICAL task', timestamp: '11:18 AM' },
  { id: '7', agent: 'SENTINEL', action: 'Access granted: BMC-SUP-003 viewed ISS-0042 details', timestamp: '11:20 AM' },
  { id: '8', agent: 'COGNOS', action: 'Sensor cluster: 4 reports within 10m radius — CONFIRMED', timestamp: '11:30 AM' },
  { id: '9', agent: 'LOOP', action: 'Citizen notified: ISS-0038 resolution confirmed', timestamp: '11:35 AM' },
  { id: '10', agent: 'GUARDIAN', action: 'SLA warning: ISS-0067 at 80% deadline', timestamp: '11:45 AM' },
]

export default function ActivityFeed({ className }: { className?: string }) {
  const [events, setEvents] = useState(MOCK_EVENTS.slice(0, 6))

  // Simulate new events arriving
  useEffect(() => {
    let idx = 6
    const interval = setInterval(() => {
      if (idx < MOCK_EVENTS.length) {
        setEvents((prev) => [MOCK_EVENTS[idx], ...prev].slice(0, 15))
        idx++
      }
    }, 5000)
    return () => clearInterval(interval)
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

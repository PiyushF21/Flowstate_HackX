import { useEffect, useState } from 'react'
import { useWebSocket } from '../../hooks/useWebSocket'

const MOCK_MESSAGES = [
  "COGNOS VERIFIED ISSUE ISS-782: SEVERITY CRITICAL",
  "COMMANDER ALLOCATED WRK-044 TO WARD H-WEST",
  "GUARDIAN DETECTED SLA BREACH ON ISS-219",
  "LOOP RECEIVED COMPLETION PROOF FOR TASK-991",
  "NEXUS PIPELINE EXECUTED IN 42ms",
  "FLEET IDENTIFIED HOTSPOT IN WARD K-EAST"
]

export default function LiveTicker() {
  const [messages, setMessages] = useState<string[]>(MOCK_MESSAGES)

  useWebSocket({
    channel: 'agent_events?role=nexus_admin',
    onMessage: (data: any) => {
       if (data && data.action) {
         setMessages(prev => {
            const rawEventMsg = `${data.agent} PERFORMED ${data.action.toUpperCase()}`
            return [rawEventMsg, ...prev.slice(0, 9)]
         })
       }
    }
  })

  useEffect(() => {
    // We only cycle mock if no real msgs are coming in fast enough, just to keep it alive
    const interval = setInterval(() => {
      setMessages(prev => {
        const newArr = [...prev]
        const last = newArr.pop()
        if (last) newArr.unshift(last) // Reverse shifting to allow real msgs to drop in at front
        return newArr
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-8 border-t border-white/10 bg-black/60 backdrop-blur-md flex items-center overflow-hidden z-40 relative">
      <div className="bg-agent-nexus text-bg px-4 h-full flex items-center text-[10px] font-bold font-mono tracking-widest shrink-0 relative z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
         LIVE LOG
      </div>
      <div className="flex-1 flex items-center h-full whitespace-nowrap overflow-hidden text-[#00FF41] text-[11px] font-mono pl-4 pr-10 opacity-80"
           style={{ textShadow: '0 0 5px rgba(0,255,65,0.4)' }}
      >
        <div className="flex items-center gap-12 animate-[ticker_30s_linear_infinite] hover:[animation-play-state:paused]">
           {messages.map((msg, i) => (
             <span key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#00FF41] rounded-full inline-block" />
                &gt; {msg}
             </span>
           ))}
           {/* Duplicate for seamless loop */}
           {messages.map((msg, i) => (
             <span key={`dup-${i}`} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#00FF41] rounded-full inline-block" />
                &gt; {msg}
             </span>
           ))}
        </div>
      </div>
    </div>
  )
}

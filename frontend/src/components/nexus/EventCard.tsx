import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

export interface EventLog {
  id: string
  agentId: string
  agentName: string
  color: string
  action: string
  details: string
  issueId?: string
  timestamp: string
}

interface EventCardProps {
  event: EventLog
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-xl cursor-default"
    >
      <div className="flex gap-4">
        {/* Timeline dots / icon area */}
        <div className="flex flex-col items-center mt-1">
           <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)] relative z-10" style={{ backgroundColor: event.color }} />
           <div className="w-px h-full bg-white/10 group-last:bg-transparent mt-2" />
        </div>

        {/* Content */}
        <div className="flex-1 pb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
               <span 
                 className="text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-widest text-black"
                 style={{ backgroundColor: event.color }}
               >
                 {event.agentId}
               </span>
               <span className="text-xs text-white/50 font-mono">{event.timestamp}</span>
            </div>
            
            {event.issueId && (
              <button className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded">
                {event.issueId} <ExternalLink size={10} />
              </button>
            )}
          </div>
          
          <h4 className="text-sm font-bold text-white mt-2 mb-1">{event.action}</h4>
          <p className="text-xs text-white/70 leading-relaxed font-mono bg-black/40 p-2 rounded border border-white/5 mt-2">
            {event.details}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

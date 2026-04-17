import { motion, AnimatePresence } from 'framer-motion'
import { X, Activity, Cpu, Database, ArrowRight } from 'lucide-react'

interface AgentDetailPanelProps {
  agent: {
    id: string
    name: string
    color: string
    description: string
    status: string
    uptime: string
    processedTotal: number
    rpm: number
  } | null
  onClose: () => void
}

export default function AgentDetailPanel({ agent, onClose }: AgentDetailPanelProps) {
  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-16 bottom-8 w-[400px] bg-black/80 backdrop-blur-3xl border-l border-white/10 z-50 overflow-y-auto"
          style={{ boxShadow: `-20px 0 50px rgba(0,0,0,0.5)` }}
        >
          <div className="sticky top-0 p-5 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-start justify-between z-10">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center border text-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]"
                style={{ backgroundColor: `${agent.color}20`, borderColor: `${agent.color}50` }}
              >
                🧠
              </div>
              <div>
                <h2 className="text-sm font-bold font-mono tracking-widest text-white/50" style={{ color: agent.color }}>
                  {agent.id}
                </h2>
                <h3 className="text-xl font-bold text-white">{agent.name}</h3>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-6">
            <p className="text-sm text-white/70 leading-relaxed font-mono">
              {agent.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/40 mb-1">
                  <Activity size={14} /> <span className="text-[10px] uppercase tracking-widest font-bold">Status</span>
                </div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.color }} /> {agent.status}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/40 mb-1">
                  <Cpu size={14} /> <span className="text-[10px] uppercase tracking-widest font-bold">Uptime</span>
                </div>
                <p className="text-sm font-bold text-white">{agent.uptime}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/40 mb-1">
                  <Database size={14} /> <span className="text-[10px] uppercase tracking-widest font-bold">Processed</span>
                </div>
                <p className="text-sm font-bold text-white">{agent.processedTotal.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/40 mb-1">
                  <Activity size={14} /> <span className="text-[10px] uppercase tracking-widest font-bold">Requests/Min</span>
                </div>
                <p className="text-sm font-bold text-white">{agent.rpm}</p>
              </div>
            </div>

            {/* Live Data Feed */}
            <div>
              <h4 className="text-xs font-bold text-white/50 tracking-widest font-mono uppercase mb-3 flex items-center justify-between">
                Live I/O Stream
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: agent.color }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: agent.color }}></span>
                </span>
              </h4>
              <div className="rounded-xl border border-white/10 bg-black overflow-hidden relative">
                {/* Scanline effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-30" />
                
                <div className="p-3 font-mono text-[10px] leading-relaxed max-h-64 overflow-y-auto space-y-3">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="pb-3 border-b border-white/5 last:border-0 last:pb-0">
                       <span className="text-white/30">[{new Date().toISOString()}]</span> <br/>
                       <span className="text-blue-400">IN  <ArrowRight className="inline" size={10}/></span> <span className="text-white/60">{"{"} payload: "ISS-2026-04-17-00{i}" {"}"}</span> <br/>
                       <span className="text-green-400">OUT <ArrowRight className="inline" size={10}/></span> <span style={{ color: agent.color }}>{"{"} status: "processed", metrics_calc: 0.{42+i} {"}"}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

import { useState } from 'react'
import NexusLayout from '../../components/nexus/NexusLayout'
import EventCard, { type EventLog } from '../../components/nexus/EventCard'
import { Filter, Pause, Play, DownloadCloud } from 'lucide-react'
import { cn } from '../../lib/utils'

const MOCK_EVENTS: EventLog[] = [
  { id: 'EV-1001', agentId: 'SYS-02', agentName: 'COGNOS', color: 'var(--agent-cognos)', action: 'Anomalous Jolt Detected', details: 'Parsed accelerometer spike `y=3.4g`. Correlated with known geo-cluster. Tagged as HIGH severity pothole.', issueId: 'ISS-402', timestamp: '10:31:02.045' },
  { id: 'EV-1002', agentId: 'SYS-01', agentName: 'NEXUS', color: 'var(--agent-nexus)', action: 'Pipeline Graph Initiated', details: 'Routed payload from COGNOS through SENTINEL conditional edge to COMMANDER node.', timestamp: '10:31:02.112' },
  { id: 'EV-1003', agentId: 'SYS-06', agentName: 'SENTINEL', color: 'var(--agent-sentinel)', action: 'RBAC Clearance', details: 'Verified BMC supervisor scope for worker assignment matrix payload.', timestamp: '10:31:02.155' },
  { id: 'EV-1004', agentId: 'SYS-04', agentName: 'COMMANDER', color: 'var(--agent-commander)', action: 'Task Auto-Dispatched', details: 'Score matrix 0.87. Dispatched to Worker WRK-015 (Ganesh Patil). Generated 9-step SOP.', issueId: 'ISS-402', timestamp: '10:31:04.500' },
  { id: 'EV-1005', agentId: 'SYS-03', agentName: 'VIRA', color: 'var(--agent-vira)', action: 'Voice Intent Processed', details: 'Transcribed Marathi audio ("पाण्याचा पाईप फुटलाय"). Mapped to `water_pipeline/burst`. Payload sent to NEXUS.', issueId: 'ISS-403', timestamp: '10:35:12.780' },
  { id: 'EV-1006', agentId: 'SYS-08', agentName: 'GUARDIAN', color: 'var(--agent-guardian)', action: 'SLA Escalation Triggered', details: 'Issue ISS-218 exceeded 4h CRITICAL threshold. Broadcasted escalation to PMC Commissioner.', timestamp: '10:40:00.000' },
  { id: 'EV-1007', agentId: 'SYS-07', agentName: 'LOOP', color: 'var(--agent-loop)', action: 'Proof Matrix Validated', details: 'Cross-referenced GPS bounds and optical validation. Marked TASK-890 as RESOLVED. Notified citizen.', timestamp: '10:45:22.100' },
].reverse() // Show newest at top if we mapped naturally, or just pre-reverse

export default function EventStreamPage() {
  const [isPaused, setIsPaused] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('ALL')
  
  const filters = ['ALL', 'COGNOS', 'COMMANDER', 'NEXUS', 'GUARDIAN', 'LOOP', 'VIRA']

  const filteredEvents = activeFilter === 'ALL' 
    ? MOCK_EVENTS 
    : MOCK_EVENTS.filter(e => e.agentName === activeFilter)

  return (
    <NexusLayout>
      <div className="flex h-[calc(100vh-64px-32px)]"> {/* calc height for topbar and ticker */}
        {/* Sidebar Filters */}
        <div className="w-[280px] bg-black/60 backdrop-blur-xl border-r border-white/10 flex flex-col pt-6 pb-20 z-20">
           <div className="px-6 mb-6">
              <h2 className="text-sm font-bold font-display text-white tracking-widest flex items-center gap-2 mb-1">
                 <Filter size={16} className="text-white/50" /> STREAM FILTERS
              </h2>
              <p className="text-[10px] text-white/40 font-mono">Globally filter master orchestrator pipeline logs</p>
           </div>
           
           <div className="flex-1 overflow-y-auto px-4 space-y-1">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold font-mono tracking-widest transition-all border",
                    activeFilter === f 
                      ? "bg-agent-nexus/20 text-white border-agent-nexus/50 shadow-[0_0_10px_rgba(139,92,246,0.2)]" 
                      : "bg-transparent text-white/50 border-transparent hover:bg-white/5 hover:text-white/80"
                  )}
                >
                  {f === 'ALL' ? 'ALL AGENTS' : `[ ${f} ]`}
                </button>
              ))}
           </div>
           
           <div className="px-6 mt-auto">
             <div className="p-4 rounded-xl border border-white/10 bg-white/5 font-mono">
                <span className="text-[10px] text-white/40 block mb-1">Stream Rate</span>
                <span className="text-lg font-bold text-green-400">142 eps</span>
             </div>
           </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 flex flex-col relative z-20 overflow-hidden bg-[url('/grid.svg')] bg-center">
            {/* Header controls */}
            <div className="px-8 py-4 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="relative flex h-2 w-2">
                    {!isPaused && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                    <span className={cn("relative inline-flex rounded-full h-2 w-2", isPaused ? 'bg-white/50' : 'bg-red-500')}></span>
                  </div>
                  <span className="text-xs font-bold font-mono tracking-widest text-white/80">
                    {isPaused ? 'STREAM PAUSED' : 'LIVE INGESTION'}
                  </span>
               </div>
               
               <div className="flex gap-2">
                 <button 
                   onClick={() => setIsPaused(!isPaused)}
                   className={cn(
                     "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-all border",
                     isPaused ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                   )}
                 >
                   {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'PLAY' : 'PAUSE'}
                 </button>
                 <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wider text-white/70 transition-all">
                   <DownloadCloud size={14} /> DUMP
                 </button>
               </div>
            </div>

            {/* Scrollable Feed */}
            <div className="flex-1 overflow-y-auto px-8 pt-6 pb-20 space-y-4">
               {filteredEvents.map(e => (
                 <EventCard key={e.id} event={e} />
               ))}
            </div>
        </div>

      </div>
    </NexusLayout>
  )
}

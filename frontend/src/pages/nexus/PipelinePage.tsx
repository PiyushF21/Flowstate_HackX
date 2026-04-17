import { useState } from 'react'
import NexusLayout from '../../components/nexus/NexusLayout'
import PipelineNode from '../../components/nexus/PipelineNode'
import PipelineArrow from '../../components/nexus/PipelineArrow'
import { Search } from 'lucide-react'

export default function PipelinePage() {
  const [searchQuery, setSearchQuery] = useState('ISS-2026-04-17-0042')

  return (
    <NexusLayout>
      <div className="h-[calc(100vh-64px-32px)] flex flex-col relative z-20">
        
        <div className="px-8 py-5 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
           <div>
              <h2 className="text-lg font-bold font-display text-white tracking-wide">Graph Logic Visualizer</h2>
              <p className="text-[10px] text-white/50 font-mono tracking-widest mt-0.5">LangGraph Execution Path Visualization</p>
           </div>
           
           <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-white/40">TRACE ISSUE ID:</span>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/50 border border-white/20 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-agent-nexus w-64"
                />
              </div>
              <button className="px-4 py-1.5 bg-agent-nexus/20 border border-agent-nexus/50 text-agent-nexus text-xs font-bold font-mono rounded-lg shadow-[0_0_10px_rgba(139,92,246,0.2)]">EXECUTE</button>
           </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[url('/grid.svg')] bg-[length:40px_40px] flex items-center px-12 pb-16">
           <div className="flex items-start">
             
             {/* START NODE */}
             <div className="flex flex-col items-center mt-6 mr-6">
               <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-black flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                 <span className="w-4 h-4 rounded-full bg-white/20" />
               </div>
               <span className="text-[10px] font-mono tracking-widest font-bold text-white/40">INPUT</span>
             </div>

             <PipelineNode 
               stepIndex={1}
               agentId="SYS-02"
               agentName="COGNOS"
               color="var(--agent-cognos)"
               actionName="Classification & Severity"
               status="completed"
               duration="120ms"
               inputPayload='{ "accel_y": 3.4, "speed": 45, "gps": [19.1, 72.8] }'
               outputPayload='{ "severity": "HIGH", "confidence": 0.92 }'
             />

             <PipelineArrow active color="var(--agent-cognos)" />

             <PipelineNode 
               stepIndex={2}
               agentId="SYS-01"
               agentName="NEXUS"
               color="var(--agent-nexus)"
               actionName="Conditional Router edge"
               status="completed"
               duration="4ms"
               inputPayload='{ "fused_severity": "HIGH" }'
               outputPayload='{ "route": ["SENTINEL", "COMMANDER"] }'
             />

             <PipelineArrow active color="var(--agent-nexus)" />

             <PipelineNode 
               stepIndex={3}
               agentId="SYS-06"
               agentName="SENTINEL"
               color="var(--agent-sentinel)"
               actionName="Access & Persistence"
               status="completed"
               duration="18ms"
               inputPayload='{ "action": "persist_graph", "scope": "bmc_admin" }'
               outputPayload='{ "audit_id": "AUD-449" }'
             />

             <PipelineArrow active color="var(--agent-sentinel)" />

             <PipelineNode 
               stepIndex={4}
               agentId="SYS-04"
               agentName="COMMANDER"
               color="var(--agent-commander)"
               actionName="Auto-Dispatch Matching"
               status="active"
               duration="..."
               inputPayload='{ "issue_id": "ISS-042", "severity": "HIGH", "category": "roads" }'
               outputPayload='Processing distances...'
             />

             <PipelineArrow color="var(--agent-commander)" />

             <PipelineNode 
               stepIndex={5}
               agentId="SYS-08"
               agentName="GUARDIAN"
               color="var(--agent-guardian)"
               actionName="SLA Monitor Initiated"
               status="pending"
             />

           </div>
        </div>

      </div>
    </NexusLayout>
  )
}

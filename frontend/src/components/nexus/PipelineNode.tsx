import { motion } from 'framer-motion'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface PipelineNodeProps {
  stepIndex: number
  agentId: string
  agentName: string
  color: string
  actionName: string
  status: 'pending' | 'active' | 'completed' | 'error'
  duration?: string
  inputPayload?: string
  outputPayload?: string
}

export default function PipelineNode({
  stepIndex,
  agentId,
  color,
  actionName,
  status,
  duration,
  inputPayload,
  outputPayload
}: PipelineNodeProps) {
  
  const isCompleted = status === 'completed'
  const isActive = status === 'active'

  return (
    <div className="relative flex flex-col items-center min-w-[280px]">
      {/* Node Status Indicator */}
      <div className="mb-4 relative">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold font-mono text-lg z-10 relative border-2"
          style={{ 
            backgroundColor: isCompleted || isActive ? `${color}20` : '#000',
            borderColor: isCompleted || isActive ? color : '#333',
            color: isCompleted || isActive ? color : '#666',
            boxShadow: isActive ? `0 0 20px ${color}60` : 'none'
          }}
        >
          {stepIndex}
        </div>
        
        {isActive && (
           <motion.div 
             className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
             style={{ borderColor: color }}
             animate={{ scale: 1.5, opacity: 0 }}
             transition={{ duration: 1, repeat: Infinity }}
           />
        )}
      </div>

      {/* Main Card */}
      <div 
        className={`w-full bg-black/60 backdrop-blur-xl border p-4 rounded-xl transition-all duration-500`}
        style={{ borderColor: isActive ? color : 'rgba(255,255,255,0.1)' }}
      >
        <div className="flex justify-between items-center mb-2">
           <span className="text-[10px] font-mono tracking-widest font-bold" style={{ color: isActive || isCompleted ? color : '#666' }}>{agentId}</span>
           {isCompleted && <CheckCircle2 size={14} className="text-green-500" />}
           {isActive && <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}><Clock size={14} style={{ color }} /></motion.div>}
           {status === 'pending' && <Clock size={14} className="text-white/30" />}
           {status === 'error' && <AlertCircle size={14} className="text-red-500" />}
        </div>
        
        <h3 className={`text-sm font-bold mb-3 ${isActive || isCompleted ? 'text-white' : 'text-white/40'}`}>
          {actionName}
        </h3>

        {/* Payload / Context */}
        <div className="space-y-2">
           <div className="bg-black/50 p-2 rounded border border-white/5">
              <span className="text-[9px] text-white/40 uppercase tracking-widest mb-1 block">Input Context</span>
              <p className="font-mono text-[10px] text-white/60 truncate">{inputPayload || '...'}</p>
           </div>
           
           {(isCompleted || isActive) && outputPayload && (
             <div className="bg-white/5 p-2 rounded border" style={{ borderColor: `${color}30` }}>
                <span className="text-[9px] uppercase tracking-widest mb-1 block" style={{ color }}>Output Generation</span>
                <p className="font-mono text-[10px] text-white/90 truncate">{outputPayload}</p>
             </div>
           )}
        </div>
        
        {duration && (
          <div className="mt-3 text-right">
             <span className="text-[10px] font-mono text-white/30">{duration}</span>
          </div>
        )}
      </div>
    </div>
  )
}

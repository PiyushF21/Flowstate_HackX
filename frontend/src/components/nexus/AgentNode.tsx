import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface AgentNodeProps {
  id: string
  name: string
  icon: string
  color: string
  x: string // e.g. "top-[20%] left-[20%]"
  selected?: boolean
  onClick?: () => void
  status?: 'idle' | 'processing' | 'error'
}

export default function AgentNode({ 
  id, name, icon, color, x, selected, onClick, status = 'idle' 
}: AgentNodeProps) {
  
  const isProcessing = status === 'processing'
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("absolute -translate-x-1/2 -translate-y-1/2 z-20", x)}
    >
      <div 
        onClick={onClick}
        className={cn(
          "relative group cursor-pointer rounded-2xl border bg-black/60 backdrop-blur-xl p-3 w-36 transition-all duration-300",
          selected ? "border-white/80 shadow-[0_0_30px_rgba(255,255,255,0.2)] bg-black/80 scale-105 z-30" : "border-white/10 hover:border-white/40",
        )}
        style={{ 
          boxShadow: selected ? `0 0 20px ${color}40, inset 0 0 10px ${color}20` : `0 4px 20px rgba(0,0,0,0.5)`,
          borderTopColor: status === 'error' ? '#EF4444' : color 
        }}
      >
        {/* Processing pulse ring */}
        {isProcessing && (
          <motion.div 
            className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
            style={{ borderColor: color }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg relative"
            style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40` }}
          >
             {icon}
             {/* Status indicator dot */}
             <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black shadow"
                  style={{ 
                    backgroundColor: status === 'error' ? '#EF4444' : isProcessing ? color : '#9CA3AF'
                  }}
             />
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-[10px] text-white/50 font-mono tracking-wider uppercase mb-0.5" style={{ color }}>{id}</p>
             <p className="text-xs font-bold text-white truncate">{name}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

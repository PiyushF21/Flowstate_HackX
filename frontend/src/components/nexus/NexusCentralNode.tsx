import { motion } from 'framer-motion'

interface NexusCentralNodeProps {
  onClick?: () => void
  isActive?: boolean
}

export default function NexusCentralNode({ onClick, isActive = true }: NexusCentralNodeProps) {
  return (
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
      onClick={onClick}
    >
      {/* Outer Glow Ring */}
      <motion.div 
        animate={{ 
          scale: isActive ? [1, 1.2, 1] : 1,
          opacity: isActive ? [0.3, 0.6, 0.3] : 0.2
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[-40px] rounded-full border border-agent-nexus/30 bg-agent-nexus/10 blur-sm pointer-events-none"
      />
      
      {/* Inner Rotating Ring */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-10px] rounded-full border border-agent-nexus/50 border-dashed pointer-events-none"
      />

      {/* Core Node */}
      <div className="w-24 h-24 rounded-full bg-black border-2 border-agent-nexus shadow-[0_0_40px_rgba(139,92,246,0.6)] flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.4)_0%,_transparent_70%)]" />
         
         <div className="relative z-10 text-center flex flex-col items-center">
            <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">🌌</span>
            <span className="text-white text-[10px] font-mono font-bold tracking-widest mt-1">NEXUS</span>
         </div>
      </div>
    </div>
  )
}

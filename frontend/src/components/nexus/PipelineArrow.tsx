import { motion } from 'framer-motion'

interface PipelineArrowProps {
  active?: boolean
  color?: string
}

export default function PipelineArrow({ active, color = '#8B5CF6' }: PipelineArrowProps) {
  return (
    <div className="flex-1 flex items-center justify-center min-w-[50px] relative mt-[-150px]">
      <div className="absolute inset-0 flex items-center">
        <div className="h-0.5 w-full bg-white/10 relative overflow-hidden">
           {active && (
             <motion.div 
               className="absolute top-0 bottom-0 w-1/2"
               style={{ background: `linear-gradient(90deg, transparent, ${color})` }}
               initial={{ left: '-50%' }}
               animate={{ left: '100%' }}
               transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
             />
           )}
        </div>
      </div>
      {/* Arrowhead */}
      <div 
        className="w-3 h-3 border-t-2 border-r-2 transform rotate-45 relative right-[-1px]"
        style={{ borderColor: active ? color : 'rgba(255,255,255,0.1)' }}
      />
    </div>
  )
}

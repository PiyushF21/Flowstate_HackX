import { motion } from 'framer-motion'

interface ConnectionLineProps {
  id: string
  startX: string // top/left percentages e.g. "top-[50%] left-[50%]"
  startY: string
  endX: string
  endY: string
  isActive?: boolean
  color?: string
}

export default function ConnectionLine({ 
  id, startX, startY, endX, endY, isActive, color = '#8B5CF6' 
}: ConnectionLineProps) {
  
  // We use absolute positioning for SVG overlay covering the screen
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none' }}>
       {/* Use a linear gradient to make the line fade towards the center if needed or just a stroke */}
       <defs>
          <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor={color} stopOpacity={isActive ? 0.8 : 0.15} />
             <stop offset="100%" stopColor={color} stopOpacity={isActive ? 0.8 : 0.15} />
          </linearGradient>
       </defs>
       
       <line 
         x1={startX} 
         y1={startY} 
         x2={endX} 
         y2={endY} 
         stroke={`url(#grad-${id})`} 
         strokeWidth={isActive ? 2 : 1}
         strokeDasharray={isActive ? "none" : "4 4"}
         className="transition-all duration-300"
       />

       {/* Animated Packet */}
       {isActive && (
         <motion.circle
           r="4"
           fill="#fff"
           initial={{ cx: startX, cy: startY }}
           animate={{ cx: endX, cy: endY }}
           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
         />
       )}
    </svg>
  )
}

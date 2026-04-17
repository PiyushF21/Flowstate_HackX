import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  /** Whether to animate on mount */
  animate?: boolean
  /** Hover effect */
  hover?: boolean
  /** Optional accent color for top border */
  accentColor?: string
  /** Click handler */
  onClick?: () => void
}

export default function GlassCard({
  children,
  className,
  animate = true,
  hover = false,
  accentColor,
  onClick,
}: GlassCardProps) {
  const Wrapper = animate ? motion.div : 'div'
  const animateProps = animate
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      }
    : {}

  return (
    <Wrapper
      {...animateProps}
      onClick={onClick}
      className={cn(
        hover ? 'glass-card-interactive' : 'glass-card',
        onClick && 'cursor-pointer',
        className
      )}
      style={accentColor ? { borderTopColor: accentColor, borderTopWidth: '2px' } : undefined}
    >
      {children}
    </Wrapper>
  )
}

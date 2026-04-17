import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import AnimatedCounter from './AnimatedCounter'
import { cn } from '../../lib/utils'

interface KPICardProps {
  /** Card title/label */
  label: string
  /** Numeric value to display */
  value: number
  /** Optional suffix (e.g., "%", "hrs", "min") */
  suffix?: string
  /** Optional prefix (e.g., "₹") */
  prefix?: string
  /** Lucide icon component to show */
  icon: LucideIcon
  /** Icon accent color */
  iconColor?: string
  /** Trend direction */
  trend?: 'up' | 'down' | 'flat'
  /** Trend percentage text (e.g., "+12%", "-3%") */
  trendText?: string
  /** Extra CSS classes */
  className?: string
}

export default function KPICard({
  label,
  value,
  suffix,
  prefix,
  icon: Icon,
  iconColor = 'var(--primary)',
  trend,
  trendText,
  className,
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('glass-card flex flex-col gap-3', className)}
    >
      {/* Header: icon + trend */}
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>

        {trend && trendText && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
              trend === 'up' && 'text-green-400 bg-green-500/10',
              trend === 'down' && 'text-red-400 bg-red-500/10',
              trend === 'flat' && 'text-slate-400 bg-slate-500/10'
            )}
          >
            <TrendIcon size={12} />
            {trendText}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="text-2xl font-bold font-display text-text-primary">
        {prefix}
        <AnimatedCounter value={value} />
        {suffix && <span className="text-base font-normal text-text-muted ml-1">{suffix}</span>}
      </div>

      {/* Label */}
      <p className="text-sm text-text-secondary">{label}</p>
    </motion.div>
  )
}

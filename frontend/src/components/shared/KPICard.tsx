import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Activity, type LucideIcon } from 'lucide-react'
import AnimatedCounter from './AnimatedCounter'
import { cn } from '../../lib/utils'

interface KPICardProps {
  label?: string
  title?: string
  value: number
  suffix?: string
  prefix?: string
  icon?: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'flat'
  trendText?: string
  change?: number
  isPositive?: boolean
  agentSource?: string
  className?: string
}

export default function KPICard({
  label,
  title,
  value,
  suffix,
  prefix,
  icon: Icon = Activity,
  iconColor = 'var(--primary)',
  trend,
  trendText,
  change,
  isPositive,
  agentSource,
  className,
}: KPICardProps) {
  const finalLabel = title || label || ''
  
  // Interop logic
  const resolvedTrend = trend || (change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'flat')
  const resolvedTrendText = trendText || (change ? `${change > 0 ? '+' : ''}${change}` : '')
  const positiveDefault = resolvedTrend === 'up'
  const isGood = isPositive !== undefined ? isPositive : positiveDefault

  const TrendIcon = resolvedTrend === 'up' ? TrendingUp : resolvedTrend === 'down' ? TrendingDown : Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('glass-card flex flex-col gap-3', className)}
    >
      {/* Header: icon + trend + agentSource */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon size={20} style={{ color: iconColor }} />
          </div>
          {agentSource && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted">
              {agentSource}
            </span>
          )}
        </div>

        {resolvedTrend && resolvedTrendText && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
              isGood ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
            )}
          >
            <TrendIcon size={12} />
            {resolvedTrendText}
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
      <p className="text-sm text-text-secondary">{finalLabel}</p>
    </motion.div>
  )
}


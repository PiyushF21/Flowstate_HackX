import { cn } from '../../lib/utils'

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

interface SeverityBadgeProps {
  severity: Severity
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Show a pulsing dot for CRITICAL */
  pulse?: boolean
}

const severityConfig: Record<Severity, { bg: string; text: string; border: string; dot: string }> = {
  CRITICAL: {
    bg: 'bg-critical/10',
    text: 'text-critical',
    border: 'border-critical/20',
    dot: 'bg-critical',
  },
  HIGH: {
    bg: 'bg-high/10',
    text: 'text-high',
    border: 'border-high/20',
    dot: 'bg-high',
  },
  MEDIUM: {
    bg: 'bg-medium/10',
    text: 'text-medium',
    border: 'border-medium/20',
    dot: 'bg-medium',
  },
  LOW: {
    bg: 'bg-low/10',
    text: 'text-low',
    border: 'border-low/20',
    dot: 'bg-low',
  },
}

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

export default function SeverityBadge({ severity, size = 'md', className, pulse = true }: SeverityBadgeProps) {
  const config = severityConfig[severity]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold border',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      {severity === 'CRITICAL' && pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', config.dot)} />
          <span className={cn('relative inline-flex rounded-full h-2 w-2', config.dot)} />
        </span>
      )}
      {severity}
    </span>
  )
}

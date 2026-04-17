import { cn } from '../../lib/utils'
import { SOURCE_ICONS } from '../../lib/utils'

interface SourceIconProps {
  source: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizeMap = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
}

const labelMap: Record<string, string> = {
  car_sensor: 'Car Sensor',
  '360_capture': '360° Capture',
  manual_complaint: 'Manual Report',
}

export default function SourceIcon({ source, size = 'md', showLabel = false, className }: SourceIconProps) {
  const icon = SOURCE_ICONS[source] || '📋'
  const label = labelMap[source] || source

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={sizeMap[size]}>{icon}</span>
      {showLabel && <span className="text-sm text-text-secondary">{label}</span>}
    </span>
  )
}

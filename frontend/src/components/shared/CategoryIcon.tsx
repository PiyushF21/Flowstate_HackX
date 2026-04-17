import { cn } from '../../lib/utils'
import { CATEGORY_ICONS } from '../../lib/utils'

interface CategoryIconProps {
  category: string
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
  roads: 'Roads',
  water_pipeline: 'Water',
  electrical: 'Electrical',
  sanitation: 'Sanitation',
  structural: 'Structural',
  traffic: 'Traffic',
  environment: 'Environment',
}

export default function CategoryIcon({ category, size = 'md', showLabel = false, className }: CategoryIconProps) {
  const icon = CATEGORY_ICONS[category] || '🔧'
  const label = labelMap[category] || category

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={sizeMap[size]}>{icon}</span>
      {showLabel && <span className="text-sm text-text-secondary capitalize">{label}</span>}
    </span>
  )
}

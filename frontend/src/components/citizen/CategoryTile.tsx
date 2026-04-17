import { cn } from '../../lib/utils'
import { CATEGORY_ICONS } from '../../lib/utils'

interface CategoryTileProps {
  category: string
  label: string
  isSelected?: boolean
  onClick?: () => void
}

export default function CategoryTile({ category, label, isSelected, onClick }: CategoryTileProps) {
  const icon = CATEGORY_ICONS[category] || '🔧'

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
        isSelected
          ? 'bg-primary/10 border-primary/40 shadow-md shadow-primary/10'
          : 'bg-surface-elevated border-border hover:border-border-light hover:bg-surface-hover'
      )}
    >
      <span className="text-2xl">{icon}</span>
      <span className={cn(
        'text-[11px] font-medium',
        isSelected ? 'text-primary' : 'text-text-secondary'
      )}>
        {label}
      </span>
    </button>
  )
}

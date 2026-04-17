import { cn } from '../../lib/utils'

interface CarCardProps {
  regNumber: string
  model: string
  lastTrip: string
  issueCount: number
  isSelected?: boolean
  onClick?: () => void
}

export default function CarCard({ regNumber, model, lastTrip, issueCount, isSelected, onClick }: CarCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-shrink-0 w-44 rounded-2xl p-3 border transition-all text-left',
        isSelected
          ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
          : 'bg-surface-elevated border-border hover:border-border-light'
      )}
    >
      <div className="text-2xl mb-2">🚗</div>
      <p className="text-sm font-semibold text-text-primary font-mono">{regNumber}</p>
      <p className="text-xs text-text-secondary mt-0.5">{model}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-text-muted">{lastTrip}</span>
        {issueCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-high/10 text-high border border-high/20">
            {issueCount} issues
          </span>
        )}
      </div>
    </button>
  )
}

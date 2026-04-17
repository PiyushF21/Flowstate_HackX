import { cn } from '../../lib/utils'

interface IssuePinProps {
  status: 'reported' | 'assigned' | 'in_progress' | 'resolved'
  isSelected?: boolean
  count?: number
  onClick?: () => void
}

const statusColors: Record<string, string> = {
  reported: '#EF4444',
  assigned: '#F97316',
  in_progress: '#EAB308',
  resolved: '#22C55E',
}

export default function IssuePin({ status, isSelected, count, onClick }: IssuePinProps) {
  const color = statusColors[status] || '#64748B'

  // Cluster pin
  if (count && count > 1) {
    return (
      <button onClick={onClick} className="relative cursor-pointer group">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-lg transition-transform group-hover:scale-110"
          style={{ backgroundColor: color }}
        >
          {count}
        </div>
      </button>
    )
  }

  return (
    <button onClick={onClick} className="relative cursor-pointer group">
      <div
        className={cn(
          'w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all',
          isSelected && 'ring-4 ring-white/30 scale-125'
        )}
        style={{ backgroundColor: color }}
      />
      {isSelected && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]"
          style={{ borderTopColor: color }}
        />
      )}
    </button>
  )
}

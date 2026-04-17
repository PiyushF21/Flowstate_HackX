import { cn } from '../../lib/utils'

type Status = 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'escalated' | 'cancelled'

interface StatusPillProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; bg: string; text: string; dot: string }> = {
  reported: {
    label: 'Reported',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
  assigned: {
    label: 'Assigned',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    dot: 'bg-orange-400',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    dot: 'bg-yellow-400',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    dot: 'bg-green-400',
  },
  escalated: {
    label: 'Escalated',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
  },
}

export default function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

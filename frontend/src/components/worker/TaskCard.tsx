import { MapPin, Clock, AlertTriangle } from 'lucide-react'
import SeverityBadge from '../shared/SeverityBadge'
import StatusPill from '../shared/StatusPill'
import { cn, formatSmartDate } from '../../lib/utils'

export interface TaskData {
  id: string
  issue_id: string
  title: string
  category: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'assigned' | 'in_progress' | 'resolved'
  location: string
  distance: string
  deadline: string
  escalated?: boolean
  procedure?: string[]
  materials?: string[]
  team?: Array<{ name: string; role: string }>
  images?: string[]
  completion?: { proof_images?: string[]; verified_by?: string; verified_at?: string }
}

interface TaskCardProps {
  task: TaskData
  onClick?: () => void
}

const severityBorderColors: Record<string, string> = {
  CRITICAL: 'border-l-critical',
  HIGH: 'border-l-high',
  MEDIUM: 'border-l-medium',
  LOW: 'border-l-low',
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl bg-surface-elevated border border-border p-3 transition-all hover:border-border-light',
        'border-l-4',
        severityBorderColors[task.severity]
      )}
    >
      {task.escalated && (
        <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-lg bg-critical/10 text-critical text-[10px] font-semibold">
          <AlertTriangle size={12} /> URGENT — State Escalated
        </div>
      )}

      <div className="flex items-start justify-between mb-1.5">
        <p className="text-sm font-medium text-text-primary flex-1 pr-2">{task.title}</p>
        <SeverityBadge severity={task.severity} size="sm" pulse={false} />
      </div>

      <div className="flex items-center gap-3 text-[10px] text-text-muted mb-2">
        <span className="flex items-center gap-1"><MapPin size={10} />{task.location}</span>
        <span>{task.distance}</span>
      </div>

      <div className="flex items-center justify-between">
        <StatusPill status={task.status} />
        <span className="text-[10px] text-text-muted flex items-center gap-1">
          <Clock size={10} /> {formatSmartDate(task.deadline)}
        </span>
      </div>
    </button>
  )
}

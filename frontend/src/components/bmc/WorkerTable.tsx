import { User, MapPin } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface WorkerRow {
  id: string
  name: string
  specialization: string
  status: 'on_task' | 'available' | 'off_duty'
  currentTask?: string
  distance?: string
  performanceScore: number
}

interface WorkerTableProps {
  workers: WorkerRow[]
  onRowClick?: (worker: WorkerRow) => void
}

const statusColor = {
  on_task: 'text-blue-400 bg-blue-400/10',
  available: 'text-green-400 bg-green-400/10',
  off_duty: 'text-gray-400 bg-gray-400/10',
}

export default function WorkerTable({ workers, onRowClick }: WorkerTableProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-surface-elevated border-b border-border text-xs text-text-muted font-medium uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Worker / ID</th>
            <th className="px-4 py-3">Specialization</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Current Assignment</th>
            <th className="px-4 py-3">Performance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {workers.map((worker) => (
            <tr
              key={worker.id}
              onClick={() => onRowClick?.(worker)}
              className="hover:bg-surface-hover cursor-pointer transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">{worker.name}</p>
                    <p className="text-[10px] text-text-muted font-mono">{worker.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-text-secondary text-xs">{worker.specialization}</td>
              <td className="px-4 py-3">
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', statusColor[worker.status])}>
                  {worker.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3">
                {worker.currentTask ? (
                  <div>
                    <p className="text-text-primary text-xs">{worker.currentTask}</p>
                    {worker.distance && <p className="text-[10px] text-text-muted mt-0.5"><MapPin size={10} className="inline mr-0.5" />{worker.distance} away</p>}
                  </div>
                ) : (
                  <span className="text-text-muted text-xs italic">None</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all", worker.performanceScore >= 80 ? 'bg-primary' : worker.performanceScore >= 60 ? 'bg-medium' : 'bg-critical')}
                      style={{ width: `${worker.performanceScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-primary font-medium">{worker.performanceScore}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

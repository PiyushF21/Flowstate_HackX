import { ArrowUpDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface MCPerformanceRow {
  id: string
  name: string
  issuesReceived: number
  issuesResolved: number
  pending: number
  overdue: number
  resRate: number
  avgTime: number
  workers: number
  utilization: number
  sla: number
  trend: 'up' | 'down' | 'stable'
}

interface MCPerformanceTableProps {
  data: MCPerformanceRow[]
}

export default function MCPerformanceTable({ data }: MCPerformanceTableProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-elevated border-b border-border text-xs text-text-muted font-medium uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Municipal Corp</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Resolved</th>
              <th className="px-4 py-3">Pending</th>
              <th className="px-4 py-3">Overdue</th>
              <th className="px-4 py-3">Res Rate</th>
              <th className="px-4 py-3">Avg Time</th>
              <th className="px-4 py-3">Workers</th>
              <th className="px-4 py-3">Utilisation</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-surface-hover cursor-pointer transition-colors"
                style={{
                  borderLeftColor: row.resRate < 60 ? 'var(--critical)' : 'transparent',
                  borderLeftWidth: '3px',
                }}
              >
                <td className="px-4 py-3 font-semibold text-text-primary">{row.name}</td>
                <td className="px-4 py-3 text-text-secondary">{row.issuesReceived}</td>
                <td className="px-4 py-3 text-text-secondary">{row.issuesResolved}</td>
                <td className="px-4 py-3 text-text-secondary">{row.pending}</td>
                <td className="px-4 py-3">
                  {row.overdue > 5 ? (
                    <span className="text-critical font-bold">{row.overdue} 🚨</span>
                  ) : (
                    <span className="text-text-secondary">{row.overdue}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn('font-bold', row.resRate >= 80 ? 'text-green-400' : row.resRate >= 60 ? 'text-yellow-400' : 'text-critical')}>
                      {row.resRate}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">{row.avgTime}h</td>
                <td className="px-4 py-3 text-text-secondary">{row.workers}</td>
                <td className="px-4 py-3 text-text-secondary">{row.utilization}%</td>
                <td className="px-4 py-3 text-text-secondary">{row.sla}%</td>
                <td className="px-4 py-3">
                  {row.trend === 'up' ? <span className="text-green-400">↑</span> : row.trend === 'down' ? <span className="text-critical">↓</span> : <span className="text-text-muted">→</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

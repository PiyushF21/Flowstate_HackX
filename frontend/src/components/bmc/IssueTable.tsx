import { useState } from 'react'
import { ArrowUpDown, Filter } from 'lucide-react'
import SeverityBadge from '../shared/SeverityBadge'
import StatusPill from '../shared/StatusPill'
import ConfidenceScore from './ConfidenceScore'
import { formatSmartDate } from '../../lib/utils'

export interface IssueRow {
  id: string
  source: 'car_sensor' | '360_capture' | 'manual'
  category: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  confidence: number
  status: 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'escalated'
  assignedTo?: string
  reportedAt: string
}

interface IssueTableProps {
  data: IssueRow[]
  onRowClick?: (issue: IssueRow) => void
}

const sourceIcons: Record<string, string> = {
  car_sensor: '🚗 Sensor',
  '360_capture': '📸 360°',
  manual: '📱 Citizen',
}

export default function IssueTable({ data, onRowClick }: IssueTableProps) {
  const [sortCol, setSortCol] = useState<keyof IssueRow>('reportedAt')
  const [sortDesc, setSortDesc] = useState(true)

  const handleSort = (col: keyof IssueRow) => {
    if (sortCol === col) setSortDesc(!sortDesc)
    else { setSortCol(col); setSortDesc(true) }
  }

  const sortedData = [...data].sort((a, b) => {
    let valA = a[sortCol]
    let valB = b[sortCol]
    
    // Severity custom sorting
    if (sortCol === 'severity') {
      const sevOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
      valA = sevOrder[a.severity]
      valB = sevOrder[b.severity]
    }
    // Status custom sorting
    if (sortCol === 'status') {
      const statOrder = { escalated: 5, reported: 4, assigned: 3, in_progress: 2, resolved: 1 }
      valA = statOrder[a.status]
      valB = statOrder[b.status]
    }

    if (valA < valB) return sortDesc ? 1 : -1
    if (valA > valB) return sortDesc ? -1 : 1
    return 0
  })

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-elevated border-b border-border text-xs text-text-muted font-medium uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('id')}>
                ID <ArrowUpDown size={12} className="inline ml-1" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('source')}>
                Source <ArrowUpDown size={12} className="inline ml-1" />
              </th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('severity')}>
                Severity <ArrowUpDown size={12} className="inline ml-1" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('confidence')}>
                AI Confidence <ArrowUpDown size={12} className="inline ml-1" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('status')}>
                Status <ArrowUpDown size={12} className="inline ml-1" />
              </th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('reportedAt')}>
                Reported <ArrowUpDown size={12} className="inline ml-1" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className="hover:bg-surface-hover cursor-pointer transition-colors"
                style={{
                  borderLeftColor: row.status === 'escalated' ? 'var(--critical)' : 'transparent',
                  borderLeftWidth: '3px',
                }}
              >
                <td className="px-4 py-3 text-text-primary font-mono text-xs">{row.id}</td>
                <td className="px-4 py-3 text-text-secondary">{sourceIcons[row.source]}</td>
                <td className="px-4 py-3 text-text-secondary capitalize">{row.category.replace('_', ' ')}</td>
                <td className="px-4 py-3"><SeverityBadge severity={row.severity} size="sm" /></td>
                <td className="px-4 py-3"><ConfidenceScore score={row.confidence} /></td>
                <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                <td className="px-4 py-3 text-text-secondary">{row.assignedTo || '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{formatSmartDate(row.reportedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

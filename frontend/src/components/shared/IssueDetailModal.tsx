import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SeverityBadge from './SeverityBadge'
import StatusPill from './StatusPill'
import CategoryIcon from './CategoryIcon'
import SourceIcon from './SourceIcon'
import Timeline from './Timeline'
import { formatDate, formatRelativeTime } from '../../lib/utils'

export interface IssueData {
  issue_id: string
  source: string
  category: string
  subcategory?: string
  fault_code?: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'escalated' | 'cancelled'
  description: string
  location: {
    lat: number
    lng: number
    address?: string
    ward?: string
    city?: string
  }
  assignment?: {
    worker_id?: string
    worker_name?: string
    deadline?: string
  }
  created_at: string
  updated_at?: string
  timeline?: Array<{
    status: string
    timestamp: string
    note?: string
  }>
}

interface IssueDetailModalProps {
  issue: IssueData | null
  open: boolean
  onClose: () => void
}

export default function IssueDetailModal({ issue, open, onClose }: IssueDetailModalProps) {
  if (!issue) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-xl sm:max-h-[85vh] glass-card z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-text-muted font-mono mb-1">{issue.issue_id}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <SeverityBadge severity={issue.severity} />
                  <StatusPill status={issue.status} />
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            <p className="text-text-primary text-sm leading-relaxed mb-4">
              {issue.description}
            </p>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-surface/50 p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Category</p>
                <CategoryIcon category={issue.category} showLabel />
              </div>
              <div className="rounded-xl bg-surface/50 p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Source</p>
                <SourceIcon source={issue.source} showLabel />
              </div>
              <div className="rounded-xl bg-surface/50 p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm text-text-primary truncate">
                  {issue.location.address || `${issue.location.lat.toFixed(4)}, ${issue.location.lng.toFixed(4)}`}
                </p>
                {issue.location.ward && (
                  <p className="text-xs text-text-muted">{issue.location.ward}</p>
                )}
              </div>
              <div className="rounded-xl bg-surface/50 p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Reported</p>
                <p className="text-sm text-text-primary">{formatRelativeTime(issue.created_at)}</p>
                <p className="text-xs text-text-muted">{formatDate(issue.created_at)}</p>
              </div>
            </div>

            {/* Fault Code */}
            {issue.fault_code && (
              <div className="rounded-xl bg-surface/50 p-3 mb-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Fault Code</p>
                <p className="text-sm text-text-primary font-mono">{issue.fault_code}</p>
              </div>
            )}

            {/* Assignment */}
            {issue.assignment && (
              <div className="rounded-xl bg-surface/50 p-3 mb-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Assignment</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-primary font-medium">
                      {issue.assignment.worker_name || 'Unassigned'}
                    </p>
                    <p className="text-xs text-text-muted font-mono">
                      {issue.assignment.worker_id}
                    </p>
                  </div>
                  {issue.assignment.deadline && (
                    <div className="text-right">
                      <p className="text-[10px] text-text-muted">Deadline</p>
                      <p className="text-xs text-text-primary">
                        {formatRelativeTime(issue.assignment.deadline)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            {issue.timeline && issue.timeline.length > 0 && (
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-3">Activity Timeline</p>
                <Timeline
                  events={issue.timeline.map((t) => ({
                    label: t.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                    timestamp: t.timestamp,
                    note: t.note,
                  }))}
                />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

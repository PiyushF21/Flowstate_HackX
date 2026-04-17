import { X, Navigation, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SeverityBadge from '../shared/SeverityBadge'
import StatusPill from '../shared/StatusPill'
import MapView from '../shared/MapView'
import { type IssueRow } from './IssueTable'

interface IssueDetailPanelProps {
  issue: IssueRow | null
  onClose: () => void
}

export default function IssueDetailPanel({ issue, onClose }: IssueDetailPanelProps) {
  return (
    <AnimatePresence>
      {issue && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg/50 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full sm:w-[400px] bg-surface border-l border-border shadow-2xl z-50 flex flex-col pt-16 lg:pt-0" // Add pt for mobile layout if needed
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated">
              <div>
                <p className="text-[10px] text-text-muted font-mono mb-1">{issue.id}</p>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={issue.severity} />
                  <span className="font-semibold text-text-primary capitalize">{issue.category.replace('_', ' ')}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover text-text-muted transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Status Section */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-surface-hover border border-border">
                <div>
                  <p className="text-xs text-text-muted mb-1">Current Status</p>
                  <StatusPill status={issue.status} />
                </div>
                {issue.status === 'reported' && (
                  <button className="px-3 py-1.5 rounded-lg bg-agent-commander text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                    Auto-Assign Now
                  </button>
                )}
              </div>

              {/* COGNOS AI Analysis */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-1.5 flex flex-wrap">
                  <span className="text-agent-cognos">🔍 COGNOS</span> Analysis
                </h3>
                <div className="p-3 rounded-xl bg-[#08080A] border border-border text-sm text-text-secondary leading-relaxed">
                  <p className="mb-2">Confirmed pothole on main carriageway. Severity {issue.severity} based on 3 vehicle sensor reports. Estimated depth &gt;10cm.</p>
                  <div className="flex gap-4 text-xs">
                    <div><span className="text-text-muted">Confidence:</span> <span className="text-primary font-bold">{issue.confidence}%</span></div>
                    <div><span className="text-text-muted">Fault Code:</span> <span className="text-text-primary">RD-001</span></div>
                  </div>
                </div>
              </div>

              {/* Location & Map */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Location</h3>
                <p className="text-sm text-text-secondary mb-3">Western Express Highway, KM 14.2, Andheri East</p>
                <div className="rounded-xl overflow-hidden border border-border">
                  <MapView center={[19.1196, 72.8467]} zoom={14} height="150px" markers={[{ id: '1', lat: 19.1196, lng: 72.8467, color: '#EF4444' }]} />
                </div>
              </div>

              {/* Worker Assignment (COMMANDER) */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-1.5">
                  <span className="text-agent-commander">⚙️ COMMANDER</span> Assignment
                </h3>
                {issue.assignedTo ? (
                  <div className="p-3 rounded-xl bg-surface-elevated border border-border flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{issue.assignedTo}</p>
                      <p className="text-xs text-text-muted">Distance: 2.3km • Match Score: 87%</p>
                    </div>
                    <button className="text-xs text-agent-commander hover:underline">Reassign</button>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted italic">Pending assignment...</p>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

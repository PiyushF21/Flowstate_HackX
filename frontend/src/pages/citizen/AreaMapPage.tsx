import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import { Search, Plus, Camera, PenSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MapView from '../../components/shared/MapView'
import SeverityBadge from '../../components/shared/SeverityBadge'
import StatusPill from '../../components/shared/StatusPill'
import CategoryIcon from '../../components/shared/CategoryIcon'
import NotificationBell from '../../components/shared/NotificationBell'
import IssueDetailModal, { type IssueData } from '../../components/shared/IssueDetailModal'
import { cn, formatRelativeTime } from '../../lib/utils'
import CitizenLayout from '../../components/citizen/CitizenLayout'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'roads', label: '🛣️ Roads' },
  { key: 'water_pipeline', label: '🚰 Water' },
  { key: 'electrical', label: '⚡ Electrical' },
  { key: 'sanitation', label: '🗑️ Sanitation' },
  { key: 'structural', label: '🏗️ Structural' },
]

export default function AreaMapPage() {
  const { fetchApi } = useApi()
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedIssue, setSelectedIssue] = useState<IssueData | null>(null)
  const [showFab, setShowFab] = useState(false)
  const [issues, setIssues] = useState<IssueData[]>([])

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await fetchApi<{ issues: IssueData[] }>('/api/issues')
        setIssues(data.issues || [])
      } catch (err) {
        console.error("Failed to fetch issues", err)
      }
    }
    fetchIssues()
  }, [fetchApi])

  const filtered = activeFilter === 'all'
    ? issues
    : issues.filter((i) => i.category === activeFilter)

  const mapMarkers = issues.map((issue) => ({
    id: issue.issue_id,
    lat: issue.location.lat,
    lng: issue.location.lng,
    color:
      issue.status === 'reported' ? '#EF4444'
      : issue.status === 'assigned' ? '#F97316'
      : issue.status === 'in_progress' ? '#EAB308'
      : '#22C55E',
    label: issue.description,
  }))

  return (
    <CitizenLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold font-display text-text-primary">🔍 InfraLens</h1>
          <div className="flex items-center gap-1">
            <NotificationBell count={3} />
          </div>
        </div>

        {/* Search + Filter */}
        <div className="px-4 pb-3 space-y-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by area, ward, or issue..."
              className="w-full bg-surface-elevated rounded-xl pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder-text-muted border border-border focus:border-primary/50 outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(cat.key)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  activeFilter === cat.key
                    ? 'bg-primary text-white'
                    : 'bg-surface-elevated text-text-secondary border border-border hover:border-border-light'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="px-4">
          <MapView
            center={[19.076, 72.8777]}
            zoom={11.5}
            markers={mapMarkers}
            height="240px"
            className="shadow-lg"
          />
        </div>

        {/* Issues list */}
        <div className="flex-1 px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">
              Issues Near You <span className="text-text-muted font-normal">({filtered.length})</span>
            </h2>
          </div>
          <div className="space-y-2.5">
            {filtered.map((issue) => (
              <button
                key={issue.issue_id}
                onClick={() => setSelectedIssue(issue)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-elevated border border-border hover:border-border-light transition-all text-left"
              >
                <CategoryIcon category={issue.category} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {issue.description.split('.')[0]}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-text-muted">
                      {issue.location.address}
                    </span>
                    <span className="text-[10px] text-text-muted">•</span>
                    <span className="text-[10px] text-text-muted">
                      {formatRelativeTime(issue.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <SeverityBadge severity={issue.severity} size="sm" pulse={false} />
                  <StatusPill status={issue.status} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FAB */}
        <div className="absolute bottom-20 right-6">
          <div className="relative">
            <AnimatePresence>
              {showFab && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-14 right-0 flex flex-col gap-2 items-end"
                >
                  <button className="flex items-center gap-2 bg-surface-elevated border border-border rounded-xl px-3 py-2 text-sm text-text-primary shadow-lg hover:bg-surface-hover">
                    <Camera size={16} /> Capture Hazard
                  </button>
                  <button className="flex items-center gap-2 bg-surface-elevated border border-border rounded-xl px-3 py-2 text-sm text-text-primary shadow-lg hover:bg-surface-hover">
                    <PenSquare size={16} /> File Complaint
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setShowFab(!showFab)}
              className={cn(
                'w-12 h-12 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center transition-transform',
                showFab && 'rotate-45'
              )}
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      <IssueDetailModal issue={selectedIssue} open={!!selectedIssue} onClose={() => setSelectedIssue(null)} />
    </CitizenLayout>
  )
}

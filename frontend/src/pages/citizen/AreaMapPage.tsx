import { useState } from 'react'
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

// Mock issues
const MOCK_ISSUES: IssueData[] = [
  {
    issue_id: 'ISS-MUM-2026-04-17-0042',
    source: 'car_sensor',
    category: 'roads',
    subcategory: 'pothole',
    fault_code: 'RD-001',
    severity: 'HIGH',
    status: 'assigned',
    description: 'Confirmed pothole on Western Express Highway near Andheri, KM 14.2. Severity HIGH based on 3 vehicle sensor reports within 2 hours.',
    location: { lat: 19.1196, lng: 72.8467, address: 'WEH, KM 14.2, Andheri', ward: 'K-West' },
    assignment: { worker_id: 'WRK-MUM-015', worker_name: 'Ganesh Patil', deadline: '2026-04-17T18:00:00' },
    created_at: '2026-04-17T10:31:00',
    timeline: [
      { status: 'reported', timestamp: '2026-04-17T10:31:00' },
      { status: 'assigned', timestamp: '2026-04-17T10:35:00', note: 'Auto-assigned by COMMANDER' },
    ],
  },
  {
    issue_id: 'ISS-MUM-2026-04-17-0089',
    source: '360_capture',
    category: 'traffic',
    subcategory: 'broken_divider',
    fault_code: 'OB-001',
    severity: 'CRITICAL',
    status: 'in_progress',
    description: 'Concrete road divider has collapsed across two lanes of SV Road near Bandra Station. Approximately 60% lane blockage.',
    location: { lat: 19.0544, lng: 72.8402, address: 'SV Road, Bandra Station', ward: 'H-West' },
    assignment: { worker_id: 'WRK-MUM-008', worker_name: 'Suresh Naik', deadline: '2026-04-17T14:00:00' },
    created_at: '2026-04-17T11:16:00',
    timeline: [
      { status: 'reported', timestamp: '2026-04-17T11:16:00' },
      { status: 'assigned', timestamp: '2026-04-17T11:18:00' },
      { status: 'in_progress', timestamp: '2026-04-17T11:45:00' },
    ],
  },
  {
    issue_id: 'ISS-MUM-2026-04-16-0034',
    source: 'manual_complaint',
    category: 'water_pipeline',
    subcategory: 'burst_pipe',
    severity: 'HIGH',
    status: 'resolved',
    description: 'Burst water pipe flooding the road near Powai Lake Gate 2. Water main appears to have cracked.',
    location: { lat: 19.1176, lng: 72.9060, address: 'Powai Lake Gate 2', ward: 'S-Ward' },
    created_at: '2026-04-16T08:00:00',
    timeline: [
      { status: 'reported', timestamp: '2026-04-16T08:00:00' },
      { status: 'assigned', timestamp: '2026-04-16T08:10:00' },
      { status: 'in_progress', timestamp: '2026-04-16T09:00:00' },
      { status: 'resolved', timestamp: '2026-04-16T13:30:00' },
    ],
  },
  {
    issue_id: 'ISS-MUM-2026-04-17-0056',
    source: 'manual_complaint',
    category: 'electrical',
    subcategory: 'street_light',
    severity: 'MEDIUM',
    status: 'reported',
    description: 'Street light malfunctioning — flickering on and off continuously at Bandra Reclamation junction.',
    location: { lat: 19.0500, lng: 72.8296, address: 'Bandra Reclamation', ward: 'H-West' },
    created_at: '2026-04-17T14:20:00',
    timeline: [{ status: 'reported', timestamp: '2026-04-17T14:20:00' }],
  },
  {
    issue_id: 'ISS-MUM-2026-04-17-0071',
    source: 'car_sensor',
    category: 'roads',
    subcategory: 'pothole',
    severity: 'LOW',
    status: 'assigned',
    description: 'Minor road surface irregularity detected by single vehicle sensor. Speed bump likely.',
    location: { lat: 19.0760, lng: 72.8777, address: 'CST Road, Fort', ward: 'A-Ward' },
    created_at: '2026-04-17T15:00:00',
    timeline: [
      { status: 'reported', timestamp: '2026-04-17T15:00:00' },
      { status: 'assigned', timestamp: '2026-04-17T15:30:00' },
    ],
  },
]

const mapMarkers = MOCK_ISSUES.map((issue) => ({
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

export default function AreaMapPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedIssue, setSelectedIssue] = useState<IssueData | null>(null)
  const [showFab, setShowFab] = useState(false)

  const filtered = activeFilter === 'all'
    ? MOCK_ISSUES
    : MOCK_ISSUES.filter((i) => i.category === activeFilter)

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

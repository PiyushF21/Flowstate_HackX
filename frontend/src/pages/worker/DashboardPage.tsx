import WorkerLayout from '../../components/worker/WorkerLayout'
import MapView from '../../components/shared/MapView'
import SeverityBadge from '../../components/shared/SeverityBadge'
import StatusPill from '../../components/shared/StatusPill'
import { useAuth } from '../../context/AuthContext'
import { MapPin, Navigation, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MOCK_TASKS = [
  { id: '1', title: 'Pothole Repair', severity: 'HIGH' as const, location: 'WEH, KM 14.2', distance: '2.3 km', lat: 19.1196, lng: 72.8467, deadline: '6:00 PM' },
  { id: '2', title: 'Fallen Divider Cleanup', severity: 'CRITICAL' as const, location: 'SV Road, Bandra', distance: '4.1 km', lat: 19.0544, lng: 72.8402, deadline: '2:00 PM' },
  { id: '3', title: 'Street Light Repair', severity: 'MEDIUM' as const, location: 'Bandra Reclamation', distance: '5.6 km', lat: 19.0500, lng: 72.8296, deadline: 'Tomorrow' },
]

const markers = MOCK_TASKS.map((t, i) => ({
  id: t.id,
  lat: t.lat,
  lng: t.lng,
  color: t.severity === 'CRITICAL' ? '#EF4444' : t.severity === 'HIGH' ? '#F97316' : '#EAB308',
  label: `${i + 1}. ${t.title}`,
}))

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function WorkerDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const nextTask = MOCK_TASKS[0]

  return (
    <WorkerLayout>
      <div className="px-4 py-3">
        {/* Greeting */}
        <div className="mb-4">
          <h1 className="text-lg font-bold font-display text-text-primary">
            {getGreeting()}, {user?.userName?.split(' ')[0] || 'Ganesh'} 👷
          </h1>
          <p className="text-xs text-text-muted">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            {' '}• Shift: 7:00 AM – 7:00 PM
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mb-4">
          {[
            { label: 'Assigned', value: '5', icon: '📋' },
            { label: 'Completed', value: '2', icon: '✅' },
            { label: 'Pending', value: '3', icon: '⏳' },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 text-center rounded-xl bg-surface-elevated border border-border p-3">
              <p className="text-xs mb-1">{stat.icon}</p>
              <p className="text-xl font-bold text-text-primary font-display">{stat.value}</p>
              <p className="text-[10px] text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Task map */}
        <div className="mb-4">
          <MapView center={[19.076, 72.8777]} zoom={11.5} markers={markers} height="200px" />
        </div>

        {/* Next task card */}
        <div className="rounded-2xl bg-gradient-to-r from-high/10 to-surface-elevated border border-high/20 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={nextTask.severity} />
            <span className="text-sm font-semibold text-text-primary">{nextTask.title}</span>
          </div>
          <p className="text-xs text-text-secondary mb-3">{nextTask.location}</p>
          <div className="flex items-center gap-3 text-[10px] text-text-muted mb-4">
            <span className="flex items-center gap-1"><MapPin size={10} />{nextTask.distance} away</span>
            <span>⏱️ Deadline: {nextTask.deadline}</span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-text-primary hover:bg-surface-hover transition-colors">
              <Navigation size={14} /> Navigate
            </button>
            <button
              onClick={() => navigate('/worker/tasks')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-agent-commander text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Play size={14} /> Start Task
            </button>
          </div>
        </div>

        {/* Recent completions */}
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-2">Recent Completions</h2>
          <div className="space-y-2">
            {[
              { title: 'Drain Blockage Cleared', time: '11:30 AM', status: 'resolved' as const },
              { title: 'Garbage Pile Removed', time: '9:15 AM', status: 'resolved' as const },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-elevated border border-border">
                <span className="text-lg">✅</span>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{item.title}</p>
                  <p className="text-[10px] text-text-muted">{item.time}</p>
                </div>
                <StatusPill status={item.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkerLayout>
  )
}

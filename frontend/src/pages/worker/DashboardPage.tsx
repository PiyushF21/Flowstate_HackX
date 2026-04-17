import { useState, useEffect } from 'react'
import WorkerLayout from '../../components/worker/WorkerLayout'
import MapView from '../../components/shared/MapView'
import SeverityBadge from '../../components/shared/SeverityBadge'
import StatusPill from '../../components/shared/StatusPill'
import { useAuth } from '../../context/AuthContext'
import { MapPin, Navigation, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'

const DEMO_WORKER_ID = 'WRK-MUM-001'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function WorkerDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { fetchApi } = useApi()
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const workerId = user?.id || DEMO_WORKER_ID
        const resp = await fetchApi<any>(`/api/issues/assigned/${workerId}`)
        const data = Array.isArray(resp) ? resp : (resp?.issues || [])
        setTasks(data)
      } catch (error) {
        console.error("Failed to fetch tasks", error)
      }
    }
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [fetchApi, user])

  const assignedTasks = tasks.filter(t => t.status === 'assigned' || t.status === 'in_progress' || t.status === 'escalated')
  const completedTasks = tasks.filter(t => t.status === 'resolved')
  
  const assignedCount = assignedTasks.length
  const completedCount = completedTasks.length
  const pendingCount = tasks.filter(t => t.status === 'assigned').length

  const markers = assignedTasks.map((t, i) => ({
    id: t.issue_id,
    lat: t.location?.lat || 19.076,
    lng: t.location?.lng || 72.8777,
    color: t.severity === 'CRITICAL' ? '#EF4444' : t.severity === 'HIGH' ? '#F97316' : '#EAB308',
    label: `${i + 1}. ${t.category}`,
  }))

  const nextTask = assignedTasks.length > 0 ? assignedTasks[0] : null
  const recentCompletions = completedTasks.slice(0, 5)

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
            { label: 'Assigned', value: assignedCount, icon: '📋' },
            { label: 'Completed', value: completedCount, icon: '✅' },
            { label: 'New', value: pendingCount, icon: '⏳' },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 text-center rounded-xl bg-surface-elevated border border-border p-3">
              <p className="text-xs mb-1">{stat.icon}</p>
              <p className="text-xl font-bold text-text-primary font-display">{stat.value}</p>
              <p className="text-[10px] text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Task map */}
        {assignedTasks.length > 0 && (
          <div className="mb-4">
             <MapView 
                center={[assignedTasks[0]?.location?.lat || 19.076, assignedTasks[0]?.location?.lng || 72.8777]} 
                zoom={11.5} 
                markers={markers} 
                height="200px" 
             />
          </div>
        )}

        {/* Next task card */}
        {nextTask ? (
          <div className="rounded-2xl bg-gradient-to-r from-high/10 to-surface-elevated border border-high/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <SeverityBadge severity={nextTask.severity || 'MEDIUM'} />
              <span className="text-sm font-semibold text-text-primary">{nextTask.description || `${nextTask.category} Issue`}</span>
            </div>
            <p className="text-xs text-text-secondary mb-3">{nextTask.location?.address || nextTask.location?.city || 'Mumbai'}</p>
            <div className="flex items-center gap-3 text-[10px] text-text-muted mb-4">
              <span className="flex items-center gap-1"><MapPin size={10} />2.3 km away</span>
              <span>⏱️ Deadline: {new Date(nextTask.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Unknown'}</span>
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
        ) : (
          <div className="rounded-2xl bg-surface-elevated border border-border p-6 mb-4 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <h3 className="text-sm font-bold text-text-primary mb-1">You're all caught up!</h3>
            <p className="text-xs text-text-muted">No pending tasks in your queue right now.</p>
          </div>
        )}

        {/* Recent completions */}
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-2">Recent Completions</h2>
          {recentCompletions.length > 0 ? (
            <div className="space-y-2">
              {recentCompletions.map((item) => (
                <div key={item.issue_id} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-elevated border border-border">
                  <span className="text-lg">✅</span>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{item.description || `${item.category} Issue`}</p>
                    <p className="text-[10px] text-text-muted">{item.completed_at ? new Date(item.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</p>
                  </div>
                  <StatusPill status="resolved" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-surface-elevated rounded-xl border border-border">
              <p className="text-xs text-text-muted">No tasks completed yet this shift.</p>
            </div>
          )}
        </div>
      </div>
    </WorkerLayout>
  )
}

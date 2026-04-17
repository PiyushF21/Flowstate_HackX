import { useState, useEffect } from 'react'
import { LogOut, Star, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import WorkerLayout from '../../components/worker/WorkerLayout'
import StatusPill from '../../components/shared/StatusPill'
import { useAuth } from '../../context/AuthContext'
import { ChartBar } from '../../components/shared/Chart'
import { useApi } from '../../hooks/useApi'

const DEMO_WORKER_ID = 'WRK-MUM-001'

const PERFORMANCE_DATA = [
  { name: 'Week 1', tasks: 12 },
  { name: 'Week 2', tasks: 15 },
  { name: 'Week 3', tasks: 9 },
  { name: 'Week 4', tasks: 18 },
]

export default function WorkerProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { fetchApi } = useApi()
  const [completedTasks, setCompletedTasks] = useState<any[]>([])
  const [totalResolved, setTotalResolved] = useState(0)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const workerId = user?.id || DEMO_WORKER_ID
        const resp = await fetchApi<any>(`/api/issues/assigned/${workerId}`)
        const data = Array.isArray(resp) ? resp : (resp?.issues || [])
        const resolved = data.filter((t: any) => t.status === 'resolved')
        setCompletedTasks(resolved.slice(0, 4))
        setTotalResolved(resolved.length)
      } catch (error) {
        console.error("Failed to fetch tasks", error)
      }
    }
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [fetchApi, user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <WorkerLayout>
      <div className="px-4 py-3">
        {/* Profile header */}
        <div className="text-center mb-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-agent-commander/30 to-agent-field-copilot/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">👷</span>
          </div>
          <h1 className="text-lg font-bold font-display text-text-primary">{user?.userName || 'Ganesh Patil'}</h1>
          <p className="text-xs text-text-muted">Roads & Asphalt • K-West Zone</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-text-primary font-medium">4.7/5</span>
            <span className="text-[10px] text-text-muted">(128 reviews)</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: '📋', label: 'Tasks This Month', value: '42' },
            { icon: '✅', label: 'Completed', value: (totalResolved + 40).toString() },
            { icon: '⏱️', label: 'Avg Resolution', value: '3.2 hrs' },
            { icon: '🏆', label: 'SLA Compliance', value: '96%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center rounded-xl bg-surface-elevated border border-border p-3">
              <p className="text-xs mb-1">{stat.icon}</p>
              <p className="text-lg font-bold text-text-primary font-display">{stat.value}</p>
              <p className="text-[10px] text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Performance chart */}
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Performance (Last 4 Weeks)</h2>
          <div className="rounded-xl bg-surface-elevated border border-border p-3">
            <ChartBar data={PERFORMANCE_DATA} dataKey="tasks" color="var(--agent-commander)" height={150} />
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Certifications</h2>
          <div className="space-y-2">
            {[
              { name: 'Road Repair — Level 3', date: 'Jan 2026' },
              { name: 'Electrical Safety', date: 'Mar 2026' },
              { name: 'First Aid Certified', date: 'Feb 2026' },
            ].map((cert) => (
              <div key={cert.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-elevated border border-border">
                <Award size={16} className="text-agent-commander flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{cert.name}</p>
                  <p className="text-[10px] text-text-muted">{cert.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent completions */}
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Recent Completions</h2>
          {completedTasks.length > 0 ? (
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div key={task.issue_id} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-elevated border border-border">
                  <span className="text-base">✅</span>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{task.description || `${task.category} Issue`}</p>
                    <p className="text-[10px] text-text-muted">{task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Recently'}</p>
                  </div>
                  <StatusPill status={task.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-surface-elevated border border-border rounded-xl">
               <span className="text-xs text-text-muted">No recently completed tasks found.</span>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-critical/20 text-critical text-sm font-medium hover:bg-critical/5 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </WorkerLayout>
  )
}

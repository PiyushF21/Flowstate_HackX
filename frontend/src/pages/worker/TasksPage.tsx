import { useState, useEffect } from 'react'
import { ArrowLeft, Navigation, Phone } from 'lucide-react'
import WorkerLayout from '../../components/worker/WorkerLayout'
import TaskCard, { type TaskData } from '../../components/worker/TaskCard'
import ProcedureAccordion from '../../components/worker/ProcedureAccordion'
import ProofUpload from '../../components/worker/ProofUpload'
import SeverityBadge from '../../components/shared/SeverityBadge'
import MapView from '../../components/shared/MapView'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

// Fallback worker ID for demo — in production this would come from auth token
const DEMO_WORKER_ID = 'WRK-MUM-001'

export default function TasksPage() {
  const { fetchApi } = useApi()
  const { user } = useAuth()
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all')
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null)
  const [showProof, setShowProof] = useState(false)
  const [tasks, setTasks] = useState<TaskData[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const workerId = user?.id || DEMO_WORKER_ID
        const resp = await fetchApi<any>(`/api/issues/assigned/${workerId}`)
        const data = Array.isArray(resp) ? resp : (resp?.issues || [])
        if (data.length > 0) {
          setTasks(data.map((t: any) => ({
            id: t.issue_id,
            issue_id: t.issue_id,
            title: t.description || `${t.category} Issue`,
            category: t.category,
            severity: t.severity as any,
            status: t.status as any,
            location: t.location?.address || t.location?.city || 'Mumbai',
            distance: '2.3 km',
            deadline: t.deadline,
            procedure: t.procedure || [],
            materials: t.materials_required || [],
            team: t.assigned_to?.team || []
          })))
        }
      } catch (error) {
        console.error("Failed to fetch tasks", error)
      }
    }
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [fetchApi, user])

  const filtered = tasks.filter((t) => {
    if (filterTab === 'active') return t.status !== 'resolved'
    if (filterTab === 'completed') return t.status === 'resolved'
    return true
  })

  // Task Detail View
  if (selectedTask) {
    const handleStartTask = async () => {
      try {
        await fetchApi(`/api/issues/${selectedTask.issue_id}/status`, {
          method: 'PATCH',
          body: { status: 'in_progress' }
        })
        setSelectedTask({ ...selectedTask, status: 'in_progress' } as TaskData)
      } catch (error) {
        console.error("Failed to start task:", error)
      }
    }

    const handleProofSubmit = async (photos: string[], notes: string) => {
      try {
        await fetchApi('/api/loop/proof', {
          method: 'POST',
          body: {
            issue_id: selectedTask.issue_id,
            images: photos,
            notes: notes
          }
        })
        // Automatically verify for the demo to resolve the task immediately
        await fetchApi('/api/loop/verify', {
          method: 'POST',
          body: {
            issue_id: selectedTask.issue_id,
            verifier_id: 'SYSTEM_AUTOVERIFY',
            approved: true,
            rejection_reason: ''
          }
        })
        setShowProof(false)
        setSelectedTask(null)
      } catch (error) {
        console.error("Failed to submit proof:", error)
      }
    }

    return (
      <WorkerLayout>
        <div>
          {/* Severity banner */}
          <div className={cn(
            'px-4 py-3',
            selectedTask.severity === 'CRITICAL' && 'bg-critical/10',
            selectedTask.severity === 'HIGH' && 'bg-high/10',
            selectedTask.severity === 'MEDIUM' && 'bg-medium/10',
            selectedTask.severity === 'LOW' && 'bg-low/10',
          )}>
            <button onClick={() => setSelectedTask(null)} className="flex items-center gap-1 text-text-muted text-xs mb-2 hover:text-text-primary">
              <ArrowLeft size={14} /> Back to tasks
            </button>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={selectedTask.severity} />
              <h1 className="text-base font-bold text-text-primary">{selectedTask.title}</h1>
            </div>
            <p className="text-[10px] text-text-muted font-mono mt-1">{selectedTask.issue_id}</p>
          </div>

          <div className="px-4 py-3 space-y-4">
            {selectedTask.escalated && (
              <div className="rounded-xl bg-critical/10 border border-critical/20 p-3 text-xs text-critical font-semibold flex items-center gap-2">
                ⚠️ This task has been escalated by State Government
              </div>
            )}

            {/* Location */}
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">{selectedTask.location}</p>
              <MapView center={[19.076, 72.8777]} zoom={14} height="120px" markers={[{ id: '1', lat: 19.1196, lng: 72.8467, color: '#F97316' }]} />
              <button className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-text-primary hover:bg-surface-hover w-full justify-center">
                <Navigation size={14} /> Open in Maps
              </button>
            </div>

            {/* Team */}
            {selectedTask.team && (
              <div>
                <p className="text-sm font-medium text-text-primary mb-2">👥 Your Team</p>
                <div className="space-y-1.5">
                  {selectedTask.team.map((member) => (
                    <div key={member.name} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated border border-border">
                      <div>
                        <p className="text-sm text-text-primary">{member.name}</p>
                        <p className="text-[10px] text-text-muted">{member.role}</p>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-surface-hover text-text-muted"><Phone size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Procedure */}
            {selectedTask.procedure && (
              <ProcedureAccordion steps={selectedTask.procedure} />
            )}

            {/* Materials */}
            {selectedTask.materials && (
              <div className="rounded-xl border border-border bg-surface-elevated p-3">
                <p className="text-sm font-medium text-text-primary mb-2">🧰 Materials Required</p>
                <div className="space-y-1">
                  {selectedTask.materials.map((mat) => (
                    <p key={mat} className="text-xs text-text-secondary">• {mat}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Proof Upload */}
            {showProof && <ProofUpload onSubmit={handleProofSubmit} />}

            {/* Action buttons */}
            <div className="pb-4">
              {selectedTask.status === 'assigned' && (
                <button 
                  onClick={handleStartTask}
                  className="w-full py-3 rounded-xl bg-agent-commander text-white font-semibold text-sm flex items-center justify-center gap-2"
                >
                  ▶️ Start Task
                </button>
              )}
              {selectedTask.status === 'in_progress' && !showProof && (
                <button onClick={() => setShowProof(true)} className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2">
                  📸 Upload Proof
                </button>
              )}
            </div>
          </div>
        </div>
      </WorkerLayout>
    )
  }

  // Task List View
  return (
    <WorkerLayout>
      <div className="px-4 py-3">
        <h1 className="text-lg font-bold font-display text-text-primary mb-4">📋 My Tasks</h1>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-surface-elevated rounded-xl p-1 border border-border mb-4">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                filterTab === tab ? 'bg-agent-commander text-white' : 'text-text-secondary'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
          ))}
        </div>
      </div>
    </WorkerLayout>
  )
}

import { useState } from 'react'
import { ArrowLeft, Navigation, Phone } from 'lucide-react'
import WorkerLayout from '../../components/worker/WorkerLayout'
import TaskCard, { type TaskData } from '../../components/worker/TaskCard'
import ProcedureAccordion from '../../components/worker/ProcedureAccordion'
import ProofUpload from '../../components/worker/ProofUpload'
import SeverityBadge from '../../components/shared/SeverityBadge'
import MapView from '../../components/shared/MapView'
import { cn } from '../../lib/utils'

const MOCK_TASKS: TaskData[] = [
  {
    id: '1', issue_id: 'ISS-MUM-2026-04-17-0042', title: 'Pothole Repair — WEH KM 14.2', category: 'roads', severity: 'HIGH',
    status: 'assigned', location: 'WEH, KM 14.2, Andheri', distance: '2.3 km', deadline: '2026-04-17T18:00:00',
    procedure: ['Assess pothole dimensions', 'Clear loose debris and standing water', 'Cut edges to create clean vertical walls', 'Apply tack coat to edges and base', 'Fill with cold-mix asphalt in 5cm layers', 'Compact each layer with vibrating plate compactor', 'Final surface flush with surrounding road', 'Upload before/after photos', 'Flag for permanent overlay if depth >15cm'],
    materials: ['Cold-mix asphalt (50kg × 2)', 'Tack coat spray', 'Vibrating plate compactor', 'Safety cones (4)', 'High-vis vest'],
    team: [{ name: 'Ganesh Patil', role: 'Fleet Leader' }, { name: 'Ravi Shinde', role: 'Field Worker' }, { name: 'Manoj Yadav', role: 'Field Worker' }],
  },
  {
    id: '2', issue_id: 'ISS-MUM-2026-04-17-0089', title: 'Fallen Divider Cleanup — SV Road', category: 'traffic', severity: 'CRITICAL',
    status: 'assigned', location: 'SV Road, Bandra Station', distance: '4.1 km', deadline: '2026-04-17T14:00:00', escalated: true,
    procedure: ['Cordon area with safety barriers', 'Assess structural damage', 'Remove loose concrete debris', 'Clear roadway for traffic', 'Upload proof photos'],
    materials: ['Safety barriers (6)', 'Heavy gloves', 'Wheelbarrow', 'High-vis vest'],
    team: [{ name: 'Ganesh Patil', role: 'Fleet Leader' }, { name: 'Suresh Naik', role: 'Field Worker' }],
  },
  {
    id: '3', issue_id: 'ISS-MUM-2026-04-17-0056', title: 'Street Light Repair — Bandra', category: 'electrical', severity: 'MEDIUM',
    status: 'in_progress', location: 'Bandra Reclamation', distance: '5.6 km', deadline: '2026-04-19T18:00:00',
    procedure: ['Inspect wiring and bulb', 'Replace faulty component', 'Test operation', 'Upload proof photos'],
    materials: ['LED bulb replacement', 'Wire stripper', 'Insulation tape', 'Ladder'],
    team: [{ name: 'Ganesh Patil', role: 'Fleet Leader' }],
  },
]

export default function TasksPage() {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all')
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null)
  const [showProof, setShowProof] = useState(false)

  const filtered = MOCK_TASKS.filter((t) => {
    if (filterTab === 'active') return t.status !== 'resolved'
    if (filterTab === 'completed') return t.status === 'resolved'
    return true
  })

  // Task Detail View
  if (selectedTask) {
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
            {showProof && <ProofUpload />}

            {/* Action buttons */}
            <div className="pb-4">
              {selectedTask.status === 'assigned' && (
                <button className="w-full py-3 rounded-xl bg-agent-commander text-white font-semibold text-sm flex items-center justify-center gap-2">
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

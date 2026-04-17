import BMCLayout from '../../components/bmc/BMCLayout'
import WorkerMap from '../../components/bmc/WorkerMap'
import WorkerTable, { type WorkerRow } from '../../components/bmc/WorkerTable'
import { Bot } from 'lucide-react'

const MOCK_WORKERS: WorkerRow[] = [
  { id: 'WRK-015', name: 'Ganesh Patil', specialization: 'Roads & Asphalt', status: 'on_task', currentTask: 'Pothole Repair — WEH KM 14.2', distance: '2.3 km', performanceScore: 92 },
  { id: 'WRK-008', name: 'Suresh Naik', specialization: 'Structural', status: 'on_task', currentTask: 'Fallen Divider — SV Road', distance: '1.1 km', performanceScore: 85 },
  { id: 'WRK-022', name: 'Ravi Shinde', specialization: 'Roads & Asphalt', status: 'available', performanceScore: 78 },
  { id: 'WRK-012', name: 'Manoj Yadav', specialization: 'Electrical', status: 'on_task', currentTask: 'Street Light Repair', distance: '5.6 km', performanceScore: 64 },
  { id: 'WRK-031', name: 'Amit Desai', specialization: 'Hydraulic', status: 'off_duty', performanceScore: 88 },
]

const mapWorkers = MOCK_WORKERS.map((w) => ({
  id: w.id,
  name: w.name,
  lat: 19.076 + (Math.random() - 0.5) * 0.1,
  lng: 72.8777 + (Math.random() - 0.5) * 0.1,
  status: w.status,
  task: w.currentTask
}))

export default function WorkersPage() {
  return (
    <BMCLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary">Fleet & Crew Management</h1>
            <p className="text-sm text-text-muted mt-1">Live tracking and performance metrics for field workers.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-agent-commander/40 bg-agent-commander/10 text-agent-commander text-sm font-semibold">
            <Bot size={18} /> COMMANDER Auto-Dispatch Active
          </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Workers', value: '142' },
            { label: 'On Task', value: '86', color: 'text-blue-400' },
            { label: 'Available', value: '34', color: 'text-green-400' },
            { label: 'Utilisation', value: '72%' },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-xl bg-surface-elevated border border-border">
              <p className="text-xs text-text-muted mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold font-display ${stat.color || 'text-text-primary'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Live Worker Locations</h2>
            <WorkerMap workers={mapWorkers} />
          </div>

          {/* Table */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Worker Directory</h2>
            <WorkerTable workers={MOCK_WORKERS} />
          </div>
        </div>
      </div>
    </BMCLayout>
  )
}

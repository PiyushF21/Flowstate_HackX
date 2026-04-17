import { useState, useEffect } from 'react'
import BMCLayout from '../../components/bmc/BMCLayout'
import WorkerMap from '../../components/bmc/WorkerMap'
import WorkerTable, { type WorkerRow } from '../../components/bmc/WorkerTable'
import { Bot } from 'lucide-react'
import { useApi } from '../../hooks/useApi'

export default function WorkersPage() {
  const { fetchApi } = useApi()
  const [workers, setWorkers] = useState<WorkerRow[]>([])

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const data = await fetchApi<any>('/api/commander/workers')
        const arr = Array.isArray(data) ? data : []
        setWorkers(arr.map((w: any) => ({
          id: w.worker_id,
          name: w.name,
          specialization: (w.specializations || []).join(', ') || 'General',
          status: w.status as 'on_task' | 'available' | 'off_duty',
          currentTask: w.current_task_id || '',
          distance: '1.2 km',
          performanceScore: w.performance?.rating ? Math.round(w.performance.rating * 20) : 85
        })))
      } catch (err) {
        console.error("Failed to fetch workers", err)
      }
    }
    fetchWorkers()
    const interval = setInterval(fetchWorkers, 5000)
    return () => clearInterval(interval)
  }, [fetchApi])

  // Compute stats from real data
  const totalWorkers = workers.length
  const onTask = workers.filter(w => w.status === 'on_task').length
  const available = workers.filter(w => w.status === 'available').length
  const utilisation = totalWorkers > 0 ? Math.round((onTask / totalWorkers) * 100) : 0

  const mapWorkers = workers.map(w => ({
    id: w.id,
    name: w.name,
    lat: 19.076 + (Math.random() - 0.5) * 0.1,
    lng: 72.8777 + (Math.random() - 0.5) * 0.1,
    status: w.status,
    task: w.currentTask
  }))

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

        {/* Summary Strip — computed from real data */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Workers', value: String(totalWorkers) },
            { label: 'On Task', value: String(onTask), color: 'text-blue-400' },
            { label: 'Available', value: String(available), color: 'text-green-400' },
            { label: 'Utilisation', value: `${utilisation}%` },
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
            <WorkerTable workers={workers} />
          </div>
        </div>
      </div>
    </BMCLayout>
  )
}

import BMCLayout from '../../components/bmc/BMCLayout'
import StatusPill from '../../components/shared/StatusPill'
import { formatSmartDate } from '../../lib/utils'

const COMPLETED = [
  { id: 'ISS-MUM-0038', category: 'sanitation', location: 'Juhu Beach Road', worker: 'Suresh Naik', resolvedAt: '2026-04-16T14:20:00', sla: 'met' },
  { id: 'ISS-MUM-0019', category: 'roads', location: 'Link Road', worker: 'Ganesh Patil', resolvedAt: '2026-04-16T11:45:00', sla: 'met' },
  { id: 'ISS-MUM-0004', category: 'electrical', location: 'Dadar TT', worker: 'Manoj Yadav', resolvedAt: '2026-04-15T18:10:00', sla: 'breached' },
]

export default function CompletedPage() {
  return (
    <BMCLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary">Completed Work Archive</h1>
            <p className="text-sm text-text-muted mt-1">Verified resolutions and SLA tracking loop.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-agent-loop/40 bg-agent-loop/10 text-agent-loop text-sm font-semibold">
            ✅ LOOP Verification Active
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-elevated border-b border-border text-xs text-text-muted font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Task ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Resolved By</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Proof</th>
                <th className="px-4 py-3">SLA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPLETED.map((row) => (
                <tr key={row.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-text-primary font-mono text-xs">{row.id}</td>
                  <td className="px-4 py-3 text-text-secondary capitalize">{row.category}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.location}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.worker}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatSmartDate(row.resolvedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded bg-surface-elevated border border-border flex items-center justify-center text-[8px]">📸</div>
                      <div className="w-6 h-6 rounded bg-surface-elevated border border-border flex items-center justify-center text-[8px]">📸</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.sla === 'met' 
                      ? <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-green-400 bg-green-400/10">SLA MET</span>
                      : <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-critical bg-critical/10">BREACHED</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BMCLayout>
  )
}

import { useState, useEffect } from 'react'
import BMCLayout from '../../components/bmc/BMCLayout'
import { useApi } from '../../hooks/useApi'
import { formatSmartDate } from '../../lib/utils'

export default function CompletedPage() {
  const { fetchApi } = useApi()
  const [completed, setCompleted] = useState<any[]>([])

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const data = await fetchApi<any>('/api/issues/?status=resolved')
        const arr = Array.isArray(data) ? data : (data?.issues || [])
        setCompleted(arr)
      } catch (err) {
        console.error("Failed to fetch completed issues", err)
      }
    }
    fetchCompleted()
    const interval = setInterval(fetchCompleted, 5000)
    return () => clearInterval(interval)
  }, [fetchApi])

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
              {completed.map((row) => (
                <tr key={row.issue_id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-text-primary font-mono text-xs">{row.issue_id}</td>
                  <td className="px-4 py-3 text-text-secondary capitalize">{row.category}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.location?.address || 'Mumbai'}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.assigned_to?.worker_name || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatSmartDate(row.completion?.completed_at || row.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {(row.completion?.proof_images || []).slice(0, 2).map((_: any, idx: number) => (
                        <div key={idx} className="w-6 h-6 rounded bg-surface-elevated border border-border flex items-center justify-center text-[8px]">📸</div>
                      ))}
                      {(!row.completion?.proof_images || row.completion.proof_images.length === 0) && (
                        <span className="text-[10px] text-text-muted">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.sla_met
                      ? <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-green-400 bg-green-400/10">SLA MET</span>
                      : <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-critical bg-critical/10">BREACHED</span>
                    }
                  </td>
                </tr>
              ))}
              {completed.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted text-sm">No resolved issues yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </BMCLayout>
  )
}

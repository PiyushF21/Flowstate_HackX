import { useState, useEffect } from 'react'
import BMCLayout from '../../components/bmc/BMCLayout'
import KPICard from '../../components/shared/KPICard'
import IssueTable, { type IssueRow } from '../../components/bmc/IssueTable'
import IssueDetailPanel from '../../components/bmc/IssueDetailPanel'
import ActivityFeed from '../../components/bmc/ActivityFeed'
import { useApi } from '../../hooks/useApi'

export default function IssuesDashboard() {
  const { fetchApi } = useApi()
  const [selectedIssue, setSelectedIssue] = useState<IssueRow | null>(null)
  const [issues, setIssues] = useState<IssueRow[]>([])

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await fetchApi<any[]>('/api/issues?mc=BMC%20Mumbai')
        if (Array.isArray(data)) {
          setIssues(data.map(i => ({
            id: i.issue_id,
            source: i.source as any,
            category: i.category,
            severity: i.severity as any,
            confidence: i.confidence || 90,
            status: i.status as any,
            assignedTo: i.assigned_to?.worker_name || i.assigned_to?.worker_id,
            reportedAt: i.created_at
          })))
        }
      } catch (err) {
        console.error("Failed to fetch dashboard issues", err)
      }
    }
    fetchIssues()
  }, [fetchApi])

  return (
    <BMCLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary">Global Operations Watch</h1>
            <p className="text-sm text-text-muted mt-1">Real-time infrastructure monitoring across Mumbai.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-xs text-text-muted font-medium">Last 24 Hours</span>
            <span className="px-3 py-1.5 rounded-lg border border-agent-cognos/30 bg-agent-cognos/10 text-agent-cognos text-xs font-semibold flex items-center gap-1.5">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agent-cognos opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-agent-cognos"></span></span>
              COGNOS Active
            </span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard title="Total Issues" value={245} change={+12} isPositive={false} agentSource="NEXUS" />
          <KPICard title="Auto-Assigned" value={180} change={+25} isPositive={true} agentSource="COMMANDER" />
          <KPICard title="Resolution Rate" value={78.4} suffix="%" change={+3.2} isPositive={true} />
          <KPICard title="Escalations" value={4} change={-2} isPositive={true} agentSource="GUARDIAN" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Table Area */}
          <div className="xl:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Priority Issues Queue</h2>
              <div className="flex gap-2">
                {['All', 'CRITICAL', 'HIGH', 'Unassigned'].map(f => (
                  <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface hover:bg-surface-elevated transition-colors text-text-secondary">
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <IssueTable data={issues} onRowClick={setSelectedIssue} />
          </div>

          {/* Activity Feed */}
          <div className="xl:col-span-1 border-l border-border pl-6 -ml-6 xl:ml-0 xl:pl-4 xl:border-l-0">
            <ActivityFeed />
          </div>
        </div>

        <IssueDetailPanel issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      </div>
    </BMCLayout>
  )
}

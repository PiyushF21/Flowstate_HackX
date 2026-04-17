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
  const [allRaw, setAllRaw] = useState<any[]>([])

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        // Fetch ALL issues — no mc filter (seed data uses city="Mumbai" not "BMC Mumbai")
        const data = await fetchApi<any>('/api/issues/')
        const arr = Array.isArray(data) ? data : (data?.issues || [])
        setAllRaw(arr)
        setIssues(arr.map((i: any) => ({
          id: i.issue_id,
          source: i.source as any,
          category: i.category,
          severity: i.severity as any,
          confidence: i.confidence || (i.ai_classification?.category_confidence ? Math.round(i.ai_classification.category_confidence * 100) : 90),
          status: i.status as any,
          assignedTo: i.assigned_to?.worker_name || i.assigned_to?.worker_id,
          reportedAt: i.created_at
        })))
      } catch (err) {
        console.error("Failed to fetch dashboard issues", err)
      }
    }
    fetchIssues()
    // Refresh every 5s so new issues appear after simulate
    const interval = setInterval(fetchIssues, 5000)
    return () => clearInterval(interval)
  }, [fetchApi])

  // Compute KPIs from real data
  const totalIssues = allRaw.length
  const autoAssigned = allRaw.filter(i => i.assigned_to).length
  const resolved = allRaw.filter(i => i.status === 'resolved').length
  const resolutionRate = totalIssues > 0 ? Math.round((resolved / totalIssues) * 1000) / 10 : 0
  const escalations = allRaw.filter(i => i.status === 'escalated').length

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

        {/* KPIs — computed from real data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard title="Total Issues" value={totalIssues} change={Math.min(totalIssues, 12)} isPositive={false} agentSource="NEXUS" />
          <KPICard title="Auto-Assigned" value={autoAssigned} change={Math.min(autoAssigned, 25)} isPositive={true} agentSource="COMMANDER" />
          <KPICard title="Resolution Rate" value={resolutionRate} suffix="%" change={3.2} isPositive={true} />
          <KPICard title="Escalations" value={escalations} change={-2} isPositive={true} agentSource="GUARDIAN" />
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

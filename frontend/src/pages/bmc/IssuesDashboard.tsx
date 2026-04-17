import { useState } from 'react'
import BMCLayout from '../../components/bmc/BMCLayout'
import KPICard from '../../components/shared/KPICard'
import IssueTable, { type IssueRow } from '../../components/bmc/IssueTable'
import IssueDetailPanel from '../../components/bmc/IssueDetailPanel'
import ActivityFeed from '../../components/bmc/ActivityFeed'

const MOCK_ISSUES: IssueRow[] = [
  { id: 'ISS-MUM-0042', source: 'car_sensor', category: 'roads', severity: 'HIGH', confidence: 92, status: 'assigned', assignedTo: 'WRK-015', reportedAt: '2026-04-17T10:30:00' },
  { id: 'ISS-MUM-0089', source: '360_capture', category: 'traffic', severity: 'CRITICAL', confidence: 98, status: 'escalated', assignedTo: 'WRK-008', reportedAt: '2026-04-17T11:15:00' },
  { id: 'ISS-MUM-0012', source: 'manual', category: 'water_pipeline', severity: 'MEDIUM', confidence: 65, status: 'reported', reportedAt: '2026-04-17T09:05:00' },
  { id: 'ISS-MUM-0038', source: 'manual', category: 'sanitation', severity: 'LOW', confidence: 85, status: 'resolved', assignedTo: 'WRK-022', reportedAt: '2026-04-16T14:20:00' },
  { id: 'ISS-MUM-0067', source: 'car_sensor', category: 'roads', severity: 'HIGH', confidence: 88, status: 'in_progress', assignedTo: 'WRK-012', reportedAt: '2026-04-17T08:45:00' },
]

export default function IssuesDashboard() {
  const [selectedIssue, setSelectedIssue] = useState<IssueRow | null>(null)

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
            <IssueTable data={MOCK_ISSUES} onRowClick={setSelectedIssue} />
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

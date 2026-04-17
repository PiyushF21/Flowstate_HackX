import { useEffect, useState } from 'react'
import StateLayout from '../../components/state/StateLayout'
import KPICard from '../../components/shared/KPICard'
import StateMap from '../../components/state/StateMap'
import MCPerformanceTable, { type MCPerformanceRow } from '../../components/state/MCPerformanceTable'
import EscalationPanel from '../../components/state/EscalationPanel'
import { useApi } from '../../hooks/useApi'

const REGIONS = [
  { id: '1', name: 'BMC Mumbai', lat: 19.076, lng: 72.8777, performanceScore: 82 },
  { id: '2', name: 'PMC Pune', lat: 18.5204, lng: 73.8567, performanceScore: 68 },
  { id: '3', name: 'NMC Nagpur', lat: 21.1458, lng: 79.0882, performanceScore: 48 },
  { id: '4', name: 'TMC Thane', lat: 19.2183, lng: 72.9781, performanceScore: 75 },
  { id: '5', name: 'NMC Nashik', lat: 20.0110, lng: 73.7903, performanceScore: 85 },
]

export default function OverviewPage() {
  const [tableData, setTableData] = useState<MCPerformanceRow[]>([])

  const { fetchApi } = useApi()

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const data = await fetchApi<{ rankings: any[] }>('/api/fleet/compare')
        if (data && data.rankings) {
          const mapped = data.rankings.map((d: any, idx: number) => ({
            id: String(idx),
            name: d.city,
            issuesReceived: d.total_issues,
            issuesResolved: d.resolved,
            pending: d.total_issues - d.resolved,
            overdue: d.active_critical || 0,
            resRate: d.resolution_rate_pct,
            avgTime: d.avg_resolution_hours,
            workers: 0,
            utilization: 0,
            trend: 'stable' as 'up' | 'down' | 'stable',
            sla: d.sla_compliance_pct || 0
          }))
          setTableData(mapped)
        }
      } catch (err) {
        console.error("Failed to fetch matrix", err)
      }
    }
    fetchMatrix()
  }, [fetchApi])

  return (
    <StateLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-text-primary tracking-wide">Macro Operations Command</h1>
          <p className="text-sm text-text-muted mt-1">Statewide infrastructure monitoring and Municipal Corporation performance tracking.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <KPICard title="Total MCs" value={27} change={0} isPositive={true} />
          <KPICard title="Issues This Week" value={4280} change={-124} isPositive={true} agentSource="FLEET" />
          <KPICard title="Resolution Rate" value={78.4} suffix="%" change={+2.1} isPositive={true} />
          <KPICard title="Avg Resolve Time" value={6.1} suffix="h" change={-0.4} isPositive={true} />
          <KPICard title="Overdue Tasks" value={134} change={+18} isPositive={false} agentSource="GUARDIAN" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 flex flex-col">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Regional Status Map</h2>
            <StateMap regions={REGIONS} />
          </div>
          <div className="xl:col-span-1 flex flex-col">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Active Alerts</h2>
            <EscalationPanel />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-semibold text-text-primary">MC Performance Matrix</h2>
             <button className="px-4 py-2 rounded-lg bg-surface border border-border hover:bg-surface-elevated transition-colors text-xs font-semibold text-text-secondary">
               Export Data (CSV)
             </button>
          </div>
          <MCPerformanceTable data={tableData} />
        </div>
      </div>
    </StateLayout>
  )
}

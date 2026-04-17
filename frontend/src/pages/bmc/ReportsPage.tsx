import { useState, useEffect } from 'react'
import BMCLayout from '../../components/bmc/BMCLayout'
import ReportGenerator from '../../components/bmc/ReportGenerator'
import { ChartBar, ChartLine, ChartDonut } from '../../components/shared/Chart'
import { useApi } from '../../hooks/useApi'

export default function ReportsPage() {
  const { fetchApi } = useApi()
  const [weeklyVol, setWeeklyVol] = useState<{ name: string, issues: number }[]>([])
  const [resolutionTime, setResolutionTime] = useState<{ name: string, hours: number }[]>([])
  const [categoryDist, setCategoryDist] = useState<{ name: string, value: number, color: string }[]>([])

  useEffect(() => {
    const fetchPrescient = async () => {
      try {
        const data = await fetchApi<{ weekly_vol: any[], resolution_time: any[], category_dist: any[] }>('/api/prescient/daily?mc=BMC%20Mumbai')
        setWeeklyVol(data.weekly_vol || [
          { name: 'Mon', issues: 120 }, { name: 'Tue', issues: 132 }, { name: 'Wed', issues: 101 },
          { name: 'Thu', issues: 145 }, { name: 'Fri', issues: 156 }, { name: 'Sat', issues: 89 }, { name: 'Sun', issues: 65 }
        ])
        setResolutionTime(data.resolution_time || [
          { name: 'Mon', hours: 4.2 }, { name: 'Tue', hours: 4.5 }, { name: 'Wed', hours: 3.8 },
          { name: 'Thu', hours: 4.9 }, { name: 'Fri', hours: 5.2 }, { name: 'Sat', hours: 3.1 }, { name: 'Sun', hours: 2.8 }
        ])
        setCategoryDist(data.category_dist || [
          { name: 'Roads', value: 45, color: 'var(--primary)' },
          { name: 'Water', value: 25, color: '#3B82F6' },
          { name: 'Electric', value: 20, color: '#F59E0B' },
          { name: 'Other', value: 10, color: '#6B7280' },
        ])
      } catch (err) {
        console.error("Failed to fetch reports", err)
      }
    }
    fetchPrescient()
  }, [fetchApi])

  return (
    <BMCLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-text-primary">Reports & Analytics</h1>
          <p className="text-sm text-text-muted mt-1">Deep operational insights and automated State submission generation.</p>
        </div>

        <div className="mb-8">
          <ReportGenerator />
        </div>

        <h2 className="text-lg font-semibold text-text-primary mb-4">Current Week Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl border border-border bg-surface-elevated block">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Issue Volume</h3>
            <ChartBar data={weeklyVol} dataKey="issues" color="var(--primary)" height={200} />
          </div>
          
          <div className="p-5 rounded-2xl border border-border bg-surface-elevated block">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Avg Resolution Time (hrs)</h3>
            <ChartLine data={resolutionTime} lines={[{ dataKey: 'hours', color: 'var(--agent-commander)' }]} height={200} />
          </div>

          <div className="p-5 rounded-2xl border border-border bg-surface-elevated block">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Category Distribution</h3>
            <ChartDonut data={categoryDist} height={200} />
          </div>
        </div>
      </div>
    </BMCLayout>
  )
}

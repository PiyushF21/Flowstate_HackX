import BMCLayout from '../../components/bmc/BMCLayout'
import ReportGenerator from '../../components/bmc/ReportGenerator'
import { ChartBar, ChartLine, ChartDonut } from '../../components/shared/Chart'

const WEEKLY_VOL = [
  { name: 'Mon', issues: 120 }, { name: 'Tue', issues: 132 }, { name: 'Wed', issues: 101 },
  { name: 'Thu', issues: 145 }, { name: 'Fri', issues: 156 }, { name: 'Sat', issues: 89 }, { name: 'Sun', issues: 65 }
]

const RESOLUTION_TIME = [
  { name: 'Mon', hours: 4.2 }, { name: 'Tue', hours: 4.5 }, { name: 'Wed', hours: 3.8 },
  { name: 'Thu', hours: 4.9 }, { name: 'Fri', hours: 5.2 }, { name: 'Sat', hours: 3.1 }, { name: 'Sun', hours: 2.8 }
]

const CATEGORY_DIST = [
  { name: 'Roads', value: 45, color: 'var(--primary)' },
  { name: 'Water', value: 25, color: '#3B82F6' },
  { name: 'Electric', value: 20, color: '#F59E0B' },
  { name: 'Other', value: 10, color: '#6B7280' },
]

export default function ReportsPage() {
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
            <ChartBar data={WEEKLY_VOL} dataKey="issues" color="var(--primary)" height={200} />
          </div>
          
          <div className="p-5 rounded-2xl border border-border bg-surface-elevated block">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Avg Resolution Time (hrs)</h3>
            <ChartLine data={RESOLUTION_TIME} lines={[{ dataKey: 'hours', color: 'var(--agent-commander)' }]} height={200} />
          </div>

          <div className="p-5 rounded-2xl border border-border bg-surface-elevated block">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Category Distribution</h3>
            <ChartDonut data={CATEGORY_DIST} height={200} />
          </div>
        </div>
      </div>
    </BMCLayout>
  )
}

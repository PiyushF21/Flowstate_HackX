import StateLayout from '../../components/state/StateLayout'
import ScorecardGrid, { type ScorecardData } from '../../components/state/ScorecardGrid'
import LeagueTable, { type LeagueRow } from '../../components/state/LeagueTable'
import { ChartLine } from '../../components/shared/Chart'

const SCORES: ScorecardData[] = [
  { id: '1', mcName: 'BMC Mumbai', grade: 'B', resRate: 82, avgTime: 4.2, overduePcnt: 4, satisfaction: 4.1, trend: 'up' },
  { id: '2', mcName: 'TMC Thane', grade: 'B', resRate: 75, avgTime: 6.1, overduePcnt: 8, satisfaction: 3.8, trend: 'stable' },
  { id: '3', mcName: 'NMC Nashik', grade: 'A', resRate: 85, avgTime: 3.5, overduePcnt: 2, satisfaction: 4.5, trend: 'up' },
  { id: '4', mcName: 'PMC Pune', grade: 'C', resRate: 68, avgTime: 8.5, overduePcnt: 12, satisfaction: 3.1, trend: 'down' },
  { id: '5', mcName: 'NMC Nagpur', grade: 'F', resRate: 48, avgTime: 18.2, overduePcnt: 25, satisfaction: 2.1, trend: 'down' },
  { id: '6', mcName: 'KDMC Kalyan', grade: 'D', resRate: 55, avgTime: 12.0, overduePcnt: 18, satisfaction: 2.5, trend: 'up' },
]

const LEAGUE: LeagueRow[] = [
  { rank: 1, mcName: 'NMC Nashik', compositeScore: 92 },
  { rank: 2, mcName: 'BMC Mumbai', compositeScore: 84 },
  { rank: 3, mcName: 'TMC Thane', compositeScore: 78 },
  { rank: 4, mcName: 'PMC Pune', compositeScore: 65 },
  { rank: 5, mcName: 'KDMC Kalyan', compositeScore: 52 },
  { rank: 6, mcName: 'NMC Nagpur', compositeScore: 41 },
]

const STATE_TREND = [
  { name: 'Month 1', scoreAvg: 65 },
  { name: 'Month 2', scoreAvg: 68 },
  { name: 'Month 3', scoreAvg: 72 },
  { name: 'Month 4', scoreAvg: 75 },
  { name: 'Month 5', scoreAvg: 76 },
]

export default function AccountabilityPage() {
  return (
    <StateLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-text-primary tracking-wide">Accountability & Transparency</h1>
          <p className="text-sm text-text-muted mt-1">Holistic grading of Municipal Corporations across performance SLAs and citizen satisfaction.</p>
        </div>

        {/* Global Trend */}
        <div className="mb-8 p-5 bg-surface-elevated rounded-2xl border border-border flex items-center gap-8">
           <div className="flex flex-col">
              <span className="text-sm text-text-secondary mb-1">Statewide Average Grade</span>
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-lg bg-yellow-400 text-bg flex items-center justify-center text-3xl font-bold">C+</div>
                 <div className="flex flex-col">
                    <span className="text-lg font-bold text-text-primary">76 / 100</span>
                    <span className="text-[10px] text-green-400 font-bold">+11 pts (last 6 mo)</span>
                 </div>
              </div>
           </div>
           <div className="flex-1 h-20">
              <ChartLine data={STATE_TREND} lines={[{ dataKey: 'scoreAvg', color: 'var(--primary)' }]} height={80} />
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Detailed MC Report Cards</h2>
            <ScorecardGrid data={SCORES} />
          </div>

          <div className="xl:col-span-1">
             <LeagueTable data={LEAGUE} />
          </div>
        </div>
      </div>
    </StateLayout>
  )
}

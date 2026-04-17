import { useEffect, useState } from 'react'
import StateLayout from '../../components/state/StateLayout'
import ScorecardGrid, { type ScorecardData } from '../../components/state/ScorecardGrid'
import LeagueTable, { type LeagueRow } from '../../components/state/LeagueTable'
import { ChartLine } from '../../components/shared/Chart'

const STATE_TREND = [
  { name: 'Month 1', scoreAvg: 65 },
  { name: 'Month 2', scoreAvg: 68 },
  { name: 'Month 3', scoreAvg: 72 },
  { name: 'Month 4', scoreAvg: 75 },
  { name: 'Month 5', scoreAvg: 76 },
]

export default function AccountabilityPage() {
  const [scores, setScores] = useState<ScorecardData[]>([])
  const [league, setLeague] = useState<LeagueRow[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/api/fleet/compare')
      .then(res => res.json())
      .then(data => {
        if (data.mc_rankings) {
          const mappedScores: ScorecardData[] = data.mc_rankings.map((d: any, idx: number) => ({
            id: String(idx),
            mcName: d.city,
            grade: d.score >= 90 ? 'A' : d.score >= 75 ? 'B' : d.score >= 60 ? 'C' : d.score >= 50 ? 'D' : 'F',
            resRate: d.resolution_rate_pct,
            avgTime: d.avg_resolution_hours,
            overduePcnt: d.total_issues ? Math.round((d.overdue_tasks / d.total_issues) * 100) : 0,
            satisfaction: 4.0,
            trend: 'stable'
          }))
          const mappedLeague: LeagueRow[] = data.mc_rankings.map((d: any) => ({
            rank: d.rank,
            mcName: d.city,
            compositeScore: d.score
          }))
          setScores(mappedScores)
          setLeague(mappedLeague)
        }
      })
      .catch(console.error)
  }, [])

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
            <ScorecardGrid data={scores} />
          </div>

          <div className="xl:col-span-1">
             <LeagueTable data={league} />
          </div>
        </div>
      </div>
    </StateLayout>
  )
}

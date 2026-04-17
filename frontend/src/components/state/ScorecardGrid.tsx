import { ChevronUp, ChevronDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ScorecardData {
  id: string
  mcName: string
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  resRate: number
  avgTime: number
  overduePcnt: number
  satisfaction: number
  trend: 'up' | 'down' | 'stable'
}

interface ScorecardGridProps {
  data: ScorecardData[]
}

const gradeColors = {
  A: 'bg-green-500 text-bg',
  B: 'bg-green-400 text-bg',
  C: 'bg-yellow-400 text-bg',
  D: 'bg-orange-500 text-white',
  F: 'bg-red-500 text-white'
}

export default function ScorecardGrid({ data }: ScorecardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((mc) => (
        <div key={mc.id} className="rounded-2xl border border-border bg-surface overflow-hidden hover:border-border-light transition-colors cursor-pointer group">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-text-primary text-sm">{mc.mcName}</h3>
            <div className={cn('w-8 h-8 rounded flex items-center justify-center font-bold text-lg', gradeColors[mc.grade])}>
              {mc.grade}
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Resolution Rate</span>
              <span className={cn('font-semibold', mc.resRate >= 80 ? 'text-green-400' : mc.resRate >= 60 ? 'text-yellow-400' : 'text-critical')}>
                {mc.resRate}%
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Avg Response</span>
              <span className={cn('font-semibold', mc.avgTime <= 4 ? 'text-green-400' : mc.avgTime <= 8 ? 'text-yellow-400' : 'text-critical')}>
                {mc.avgTime} hrs
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Overdue Tasks</span>
              <span className={cn('font-semibold', mc.overduePcnt <= 5 ? 'text-green-400' : mc.overduePcnt <= 10 ? 'text-yellow-400' : 'text-critical')}>
                {mc.overduePcnt}%
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Citizen Score</span>
              <span className="font-semibold text-text-primary flex items-center gap-1">
                ⭐ {mc.satisfaction}/5
              </span>
            </div>
          </div>

          <div className="bg-surface-elevated px-4 py-2 text-[10px] flex items-center justify-between text-text-muted group-hover:bg-surface-hover transition-colors">
            Monthly Trend
            {mc.trend === 'up' && <span className="text-green-400 flex items-center"><ChevronUp size={12}/> Improving</span>}
            {mc.trend === 'stable' && <span className="text-text-secondary flex items-center"><Minus size={12}/> Stable</span>}
            {mc.trend === 'down' && <span className="text-critical flex items-center"><ChevronDown size={12}/> Declining</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

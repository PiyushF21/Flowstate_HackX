import { Trophy } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface LeagueRow {
  rank: number
  mcName: string
  compositeScore: number
}

interface LeagueTableProps {
  data: LeagueRow[]
}

export default function LeagueTable({ data }: LeagueTableProps) {
  const sorted = [...data].sort((a, b) => b.compositeScore - a.compositeScore)
  const maxScore = 100 // Out of 100

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
         <Trophy size={18} className="text-yellow-400" /> State Leaderboard
      </h3>

      <div className="flex-1 space-y-4">
        {sorted.map((row, index) => {
          const isTop3 = index < 3
          return (
            <div key={row.rank} className="flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                index === 0 ? "bg-yellow-400 text-bg" :
                index === 1 ? "bg-gray-300 text-bg" :
                index === 2 ? "bg-orange-400 text-bg" : "bg-surface-elevated text-text-muted border border-border"
              )}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <span className={cn("text-xs", isTop3 ? "font-semibold text-text-primary" : "text-text-secondary")}>
                    {row.mcName}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">{row.compositeScore}/100</span>
                </div>
                <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      index === 0 ? "bg-yellow-400" :
                      index === 1 ? "bg-gray-300" :
                      index === 2 ? "bg-orange-400" : "bg-agent-guardian/60"
                    )}
                    style={{ width: `${(row.compositeScore / maxScore) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

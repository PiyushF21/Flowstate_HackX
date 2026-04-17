import { useState } from 'react'
import StateLayout from '../../components/state/StateLayout'
import ReportViewer from '../../components/state/ReportViewer'
import { FileText, Bot } from 'lucide-react'
import { cn } from '../../lib/utils'

const REPORTS = [
  { id: '1', mc: 'BMC Mumbai', period: 'Week 15 (Apr 10 - Apr 16)', date: 'Apr 17, 2026', status: 'new' },
  { id: '2', mc: 'PMC Pune', period: 'Week 15 (Apr 10 - Apr 16)', date: 'Apr 17, 2026', status: 'new' },
  { id: '3', mc: 'NMC Nagpur', period: 'Week 15 (Apr 10 - Apr 16)', date: 'Apr 17, 2026', status: 'reviewed' },
  { id: '4', mc: 'TMC Thane', period: 'Week 15 (Apr 10 - Apr 16)', date: 'Apr 16, 2026', status: 'reviewed' },
  { id: '5', mc: 'NMC Nashik', period: 'Week 15 (Apr 10 - Apr 16)', date: 'Apr 16, 2026', status: 'reviewed' },
]

export default function WeeklyReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  return (
    <StateLayout>
      <div className="p-6 h-[calc(100vh-theme(spacing.1))] flex flex-col">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary tracking-wide">Weekly Intelligence Reports</h1>
            <p className="text-sm text-text-muted mt-1">Review PRESCIENT auto-generated weekly operational syntheses.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-agent-prescient/30 bg-agent-prescient/10 text-agent-prescient text-xs font-semibold">
            <Bot size={14} /> PRESCIENT Summaries
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden min-h-0 bg-bg">
          {/* Inbox (Left Panel) */}
          <div className="w-[350px] flex flex-col bg-surface rounded-2xl border border-border overflow-hidden shrink-0">
            <div className="p-4 border-b border-border bg-surface-elevated">
              <input
                type="text"
                placeholder="Filter reports..."
                className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
               />
               <div className="flex gap-2 mt-3">
                 <button className="px-2 py-1 rounded bg-primary/20 text-primary text-[10px] font-bold">Unread (2)</button>
                 <button className="px-2 py-1 rounded bg-surface border border-border text-text-secondary text-[10px] font-bold hover:bg-surface-elevated border-dashed">All Time</button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {REPORTS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-colors border",
                    selectedReportId === r.id ? "bg-surface-elevated border-text-muted/30" : "bg-transparent border-transparent hover:bg-surface-hover",
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn("text-sm font-semibold", r.status === 'new' ? 'text-text-primary' : 'text-text-secondary')}>
                      {r.mc}
                    </span>
                    {r.status === 'new' && <span className="w-2 h-2 rounded-full bg-agent-prescient mt-1.5 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-text-secondary mb-1">{r.period}</p>
                  <p className="text-[10px] text-text-muted font-mono">{r.date}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Viewer (Right Panel) */}
          <div className="flex-1 min-w-0">
            <ReportViewer reportId={selectedReportId} />
          </div>
        </div>
      </div>
    </StateLayout>
  )
}

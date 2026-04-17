import { AlertTriangle, ChevronRight } from 'lucide-react'

interface EscalationAlert {
  id: string
  mc: string
  description: string
  timeStr: string
}

const MOCK_ALERTS: EscalationAlert[] = [
  { id: '1', mc: 'PMC Pune', description: 'Water main burst on FC Road — 75 min overdue', timeStr: '10 mins ago' },
  { id: '2', mc: 'NMC Nagpur', description: 'Resolution rate dropped to 48% today', timeStr: '1 hour ago' },
  { id: '3', mc: 'TMC Thane', description: 'Multiple CRITICAL failures detected in Ward B', timeStr: '2 hours ago' },
]

export default function EscalationPanel() {
  return (
    <div className="bg-surface rounded-2xl border border-agent-guardian/30 overflow-hidden flex flex-col h-full">
      <div className="bg-agent-guardian/10 px-4 py-3 border-b border-agent-guardian/20 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-agent-guardian flex items-center gap-1.5">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agent-guardian opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-agent-guardian"></span>
          </span>
          GUARDIAN Alerts
        </h3>
        <span className="bg-agent-guardian text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{MOCK_ALERTS.length} Active</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {MOCK_ALERTS.map(alert => (
          <div key={alert.id} className="p-3 rounded-xl bg-surface-elevated border border-border">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-bold text-text-primary px-1.5 py-0.5 rounded bg-surface border border-border uppercase">{alert.mc}</span>
              <span className="text-[10px] text-text-muted">{alert.timeStr}</span>
            </div>
            <p className="text-sm text-text-primary mb-3 leading-snug">{alert.description}</p>
            <button className="w-full py-1.5 text-xs font-semibold text-critical bg-critical/10 hover:bg-critical/20 border border-critical/20 rounded-lg transition-colors flex items-center justify-center gap-1">
              <AlertTriangle size={12} /> Escalate to Commissioner
            </button>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-border bg-surface-elevated flex justify-center">
         <button className="text-xs text-text-secondary hover:text-text-primary flex items-center">View All History <ChevronRight size={14}/></button>
      </div>
    </div>
  )
}

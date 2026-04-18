import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronRight, ChevronDown, CheckCircle2, Clock, MapPin } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useWebSocket } from '../../hooks/useWebSocket'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

interface EscalationAlert {
  id: string
  mc: string
  description: string
  timeStr: string
  severity: string
  alertType: string
  delayText?: string
  actionReq?: string
  issueId?: string
  raw?: any
}

export default function EscalationPanel() {
  const [alerts, setAlerts] = useState<EscalationAlert[]>([])
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  const { fetchApi } = useApi()

  useWebSocket({
     channel: 'escalations',
     onMessage: (data: any) => {
        if (data && data.alert_id) {
           setAlerts(prev => {
              const newAlert = {
                id: data.alert_id,
                mc: data.location?.city || data.data?.mc_name || 'System',
                description: data.description,
                timeStr: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                severity: data.severity || 'MEDIUM',
                alertType: data.alert_type || 'unknown',
                delayText: data.data?.overdue_hours ? `${data.data.overdue_hours} hours overdue` : undefined,
                actionReq: data.data?.action_required || data.data?.recommendation || 'Supervisor coordination needed.',
                issueId: data.issue_id,
                raw: data.data || {}
              }
              if (prev.find(a => a.id === newAlert.id)) return prev
              return [newAlert, ...prev].slice(0, 50)
           })
        }
     }
  })

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await fetchApi<{ alerts: any[] }>('/api/guardian/alerts')
        if (data && data.alerts) {
          const mapped = data.alerts.map((a: any) => ({
            id: a.alert_id,
            mc: a.location?.city || a.data?.mc_name || 'System',
            description: a.description,
            timeStr: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            severity: a.severity || 'MEDIUM',
            alertType: a.alert_type || 'unknown',
            delayText: a.data?.overdue_hours ? `${a.data.overdue_hours}h overdue` : a.data?.gap_pct ? `${a.data.gap_pct}% SLA Gap` : '',
            actionReq: a.data?.action_required || a.data?.recommendation || 'Supervisor coordination needed.',
            issueId: a.issue_id || a.data?.issue_id,
            raw: a.data || {}
          }))
          setAlerts(mapped)
        }
      } catch (err) {
        console.error("Failed to fetch GUARDIAN alerts", err)
      }
    }
    fetchAlerts()
  }, [fetchApi])

  const getSeverityRing = (sev: string) => {
    if (sev === 'CRITICAL') return 'border-critical/50 shadow-[0_0_10px_rgba(239,68,68,0.2)] bg-critical/5'
    if (sev === 'HIGH') return 'border-warning/50 bg-warning/5'
    return 'border-border bg-surface-elevated'
  }

  const getSeverityText = (sev: string) => {
    if (sev === 'CRITICAL') return 'text-critical'
    if (sev === 'HIGH') return 'text-warning'
    return 'text-agent-sentinel'
  }

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
        <span className="bg-agent-guardian text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{alerts.length} Active</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.length === 0 && <p className="text-sm text-text-muted text-center py-4">No active alerts.</p>}
        {alerts.map(alert => {
          const isExpanded = expandedAlert === alert.id
          
          return (
            <div 
              key={alert.id} 
              onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
              className={cn("p-3 rounded-xl border transition-all cursor-pointer hover:border-text-muted/30", getSeverityRing(alert.severity))}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border", getSeverityText(alert.severity), "border-current/30 bg-current/10")}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-bold text-text-primary px-1.5 py-0.5 rounded bg-surface border border-border uppercase">{alert.mc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted font-mono">{alert.timeStr}</span>
                  <ChevronDown size={14} className={cn("text-text-muted transition-transform", isExpanded && "rotate-180")} />
                </div>
              </div>
              <p className="text-sm text-text-primary mb-2 leading-snug">{alert.description}</p>
              
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {alert.issueId && (
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <MapPin size={12} className="text-agent-commander" /> 
                        <span className="font-mono">{alert.issueId}</span>
                      </div>
                    )}
                    {alert.delayText && (
                      <div className="flex items-center gap-1.5 text-xs text-critical font-medium">
                        <Clock size={12} /> 
                        <span>{alert.delayText}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-surface/50 rounded-lg p-2.5 mb-4 border border-border">
                    <span className="text-[10px] uppercase text-text-muted font-semibold mb-1 block tracking-wider">Strict Action Required</span>
                    <p className="text-xs text-text-secondary leading-relaxed">{alert.actionReq}</p>
                  </div>

                  {alert.raw && Object.keys(alert.raw).length > 0 && (
                    <div className="bg-surface/30 rounded-lg p-3 mb-4 border border-border/50">
                      <span className="text-[10px] uppercase text-text-muted font-semibold mb-2 block tracking-wider">Guardian Telemetry Data</span>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        {Object.entries(alert.raw).map(([key, val]) => {
                          if (['recommendation', 'action_required', 'issue_id'].includes(key)) return null;
                          let displayVal = val;
                          if (typeof val === 'object' && val !== null) {
                             if ('worker_name' in val) displayVal = `${(val as any).worker_name} (${(val as any).worker_id})`;
                             else if ('address' in val) displayVal = `${(val as any).address}, ${(val as any).ward}`;
                             else displayVal = JSON.stringify(val);
                          }
                          return (
                            <div key={key} className="flex flex-col overflow-hidden">
                              <span className="text-[9px] text-text-muted uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                              <span className="text-xs text-text-primary font-mono truncate" title={String(displayVal)}>{String(displayVal)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toast.success(`Escalation order sent for ${alert.issueId || 'issue'}`); }}
                      className="flex-1 py-1.5 text-[11px] font-semibold text-critical bg-critical/10 hover:bg-critical/20 border border-critical/20 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle size={12} /> Escalate to Commissioner
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toast.success('Alert marked as acknowledged.'); setExpandedAlert(null); }}
                      className="flex-1 py-1.5 text-[11px] font-semibold text-agent-guardian bg-agent-guardian/10 hover:bg-agent-guardian/20 border border-agent-guardian/20 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={12} /> Acknowledge
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="p-3 border-t border-border bg-surface-elevated flex justify-center">
         <button className="text-xs text-text-secondary hover:text-text-primary flex items-center">View All History <ChevronRight size={14}/></button>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useWebSocket } from '../../hooks/useWebSocket'

interface EscalationAlert {
  id: string
  mc: string
  description: string
  timeStr: string
}

export default function EscalationPanel() {
  const [alerts, setAlerts] = useState<EscalationAlert[]>([])

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
                timeStr: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
              // Prevent duplicates
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
            timeStr: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
          setAlerts(mapped)
        }
      } catch (err) {
        console.error("Failed to fetch GUARDIAN alerts", err)
      }
    }
    fetchAlerts()
  }, [fetchApi])

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
        {alerts.map(alert => (
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

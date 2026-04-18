import { useEffect, useState, useRef } from 'react'
import { FileText, Download, MessageSquare, CheckCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'
import { ChartBar, ChartDonut, ChartLine } from '../shared/Chart'

interface ReportViewerProps {
  reportId: string | null
}

const REPORTS_DATA: Record<string, any> = {
  '1': {
    mcName: 'BMC Mumbai',
    period: 'Week 15 (Apr 10 - Apr 16, 2026)',
    narrative: 'BMC Mumbai demonstrated strong performance overall, resolving 1,240 issues this week. However, there is a growing backlog in Ward K-West (Andheri) primarily due to pre-monsoon roadworks. The resolution rate of 82% is above the SLA, but electrical tasks are lagging (average 12 hours resolution time vs 4 hour SLA). Reallocation of crews from Ward F-South is strictly recommended.',
    volumeData: [
      { name: 'Mon', issues: 180 }, { name: 'Tue', issues: 210 }, { name: 'Wed', issues: 195 },
      { name: 'Thu', issues: 225 }, { name: 'Fri', issues: 240 }, { name: 'Sat', issues: 110 }, { name: 'Sun', issues: 80 }
    ],
    catData: [
      { name: 'Roads', value: 450, color: '#3B82F6' },
      { name: 'Water', value: 310, color: '#06B6D4' },
      { name: 'Electric', value: 250, color: '#F59E0B' },
      { name: 'Sanitation', value: 230, color: '#10B981' }
    ],
    trendData: [
      { name: 'Wk 12', hours: 6.2 }, { name: 'Wk 13', hours: 5.8 }, { name: 'Wk 14', hours: 5.4 }, { name: 'Wk 15', hours: 5.1 }
    ],
    budgetUtilized: { current: 42, total: 55, pct: 76 },
    escalations: [
      '• Water main break (FC Road) — 4h overdue',
      '• Bridge structural crack (Katraj) — High hazard'
    ]
  },
  '2': {
    mcName: 'PMC Pune',
    period: 'Week 15 (Apr 10 - Apr 16, 2026)',
    narrative: 'PMC Pune is experiencing a critical surge in road infrastructure issues following recent unseasonal rains. Total resolved issues dropped to 810. Resolution rate sits at 68%, falling below the 75% state benchmark. Traffic signaling faults in the IT Park corridor are causing severe cascading delays. Immediate deployment of rapid-response pothole repair crews is advised.',
    volumeData: [
      { name: 'Mon', issues: 250 }, { name: 'Tue', issues: 310 }, { name: 'Wed', issues: 290 },
      { name: 'Thu', issues: 180 }, { name: 'Fri', issues: 150 }, { name: 'Sat', issues: 90 }, { name: 'Sun', issues: 60 }
    ],
    catData: [
      { name: 'Roads', value: 680, color: '#3B82F6' },
      { name: 'Traffic', value: 420, color: '#EF4444' },
      { name: 'Water', value: 150, color: '#06B6D4' },
      { name: 'Sanitation', value: 80, color: '#10B981' }
    ],
    trendData: [
      { name: 'Wk 12', hours: 4.5 }, { name: 'Wk 13', hours: 5.1 }, { name: 'Wk 14', hours: 6.8 }, { name: 'Wk 15', hours: 8.2 }
    ],
    budgetUtilized: { current: 31, total: 40, pct: 77 },
    escalations: [
      '• Major pothole cluster (Hinjewadi Ph-1) — 7 accidents reported',
      '• Fallen tree blocking NH-48 exit — 2h overdue'
    ]
  },
  '3': {
    mcName: 'NMC Nagpur',
    period: 'Week 15 (Apr 10 - Apr 16, 2026)',
    narrative: 'NMC Nagpur maintained exceptional operational stability. Resolution rate achieved 94% with an all-time low median repair duration of 3.8 hours. Sanitation drives across Zone 4 have yielded a 40% drop in citizen complaints. However, extreme heat warnings suggest a predictive spike in transformer failures; pre-emptive cooling maintenance is highly recommended.',
    volumeData: [
      { name: 'Mon', issues: 90 }, { name: 'Tue', issues: 85 }, { name: 'Wed', issues: 95 },
      { name: 'Thu', issues: 110 }, { name: 'Fri', issues: 80 }, { name: 'Sat', issues: 45 }, { name: 'Sun', issues: 30 }
    ],
    catData: [
      { name: 'Electric', value: 310, color: '#F59E0B' },
      { name: 'Sanitation', value: 120, color: '#10B981' },
      { name: 'Water', value: 90, color: '#06B6D4' },
      { name: 'Roads', value: 15, color: '#3B82F6' }
    ],
    trendData: [
      { name: 'Wk 12', hours: 4.8 }, { name: 'Wk 13', hours: 4.2 }, { name: 'Wk 14', hours: 4.0 }, { name: 'Wk 15', hours: 3.8 }
    ],
    budgetUtilized: { current: 12, total: 25, pct: 48 },
    escalations: [
      '• Substation transformer overheating (Dharampeth) — CRITICAL',
    ]
  },
  '4': {
    mcName: 'TMC Thane',
    period: 'Week 15 (Apr 10 - Apr 16, 2026)',
    narrative: 'TMC Thane operations are stable but stretched. Massive pipeline relocation activities for the metro expansion have resulted in 12 localized water supply disruptions. Fleet utilization is at 98%, leaving no buffer for emergencies. Requesting temporary leasing of 5 water bowsers from state reserves until the expansion phase finishes next month.',
    volumeData: [
      { name: 'Mon', issues: 130 }, { name: 'Tue', issues: 145 }, { name: 'Wed', issues: 160 },
      { name: 'Thu', issues: 180 }, { name: 'Fri', issues: 150 }, { name: 'Sat', issues: 170 }, { name: 'Sun', issues: 120 }
    ],
    catData: [
      { name: 'Water', value: 540, color: '#06B6D4' },
      { name: 'Roads', value: 210, color: '#3B82F6' },
      { name: 'Electric', value: 180, color: '#F59E0B' },
      { name: 'Sanitation', value: 125, color: '#10B981' }
    ],
    trendData: [
      { name: 'Wk 12', hours: 6.9 }, { name: 'Wk 13', hours: 7.1 }, { name: 'Wk 14', hours: 7.0 }, { name: 'Wk 15', hours: 7.4 }
    ],
    budgetUtilized: { current: 28, total: 32, pct: 87 },
    escalations: [
      '• Water pipe burst (Ghodbunder Road) — 8h resolution delay',
      '• Metro barricade collapse — 1h overdue'
    ]
  },
  '5': {
    mcName: 'NMC Nashik',
    period: 'Week 15 (Apr 10 - Apr 16, 2026)',
    narrative: 'NMC Nashik is heavily under-utilizing its workforce. Worker assignment rate sits at just 42% despite a moderate backlog of sanitation issues in the old city areas. It is evident that the COMMANDER auto-assignment engine was bypassed by supervisors 34 times this week. A mandatory workflow compliance audit is scheduled.',
    volumeData: [
      { name: 'Mon', issues: 60 }, { name: 'Tue', issues: 50 }, { name: 'Wed', issues: 45 },
      { name: 'Thu', issues: 70 }, { name: 'Fri', issues: 65 }, { name: 'Sat', issues: 35 }, { name: 'Sun', issues: 20 }
    ],
    catData: [
      { name: 'Sanitation', value: 190, color: '#10B981' },
      { name: 'Roads', value: 80, color: '#3B82F6' },
      { name: 'Electric', value: 45, color: '#F59E0B' },
      { name: 'Water', value: 30, color: '#06B6D4' }
    ],
    trendData: [
      { name: 'Wk 12', hours: 3.1 }, { name: 'Wk 13', hours: 3.5 }, { name: 'Wk 14', hours: 4.8 }, { name: 'Wk 15', hours: 6.2 }
    ],
    budgetUtilized: { current: 8, total: 15, pct: 53 },
    escalations: [
      '• Massive garbage accumulation (Panchavati) — 24h overdue',
    ]
  }
}

export default function ReportViewer({ reportId }: ReportViewerProps) {
  const [report, setReport] = useState<any>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !report) return
    const toastId = toast.loading('Generating HD PDF (This might take a second)...')
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${report.mcName.replace(' ', '_')}_Weekly_Report.pdf`)
      toast.success('PDF downloaded successfully!', { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF', { id: toastId })
    }
  }

  useEffect(() => {
    if (reportId && REPORTS_DATA[reportId]) {
      setReport(REPORTS_DATA[reportId])
    }
  }, [reportId])
  if (!report) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-muted border border-border rounded-2xl bg-surface-elevated">
        <FileText size={48} className="mb-4 opacity-20" />
        <p>Select a report from the inbox to view details.</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-surface-elevated rounded-2xl border border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary font-display">{report.mcName} — Weekly Performance</h2>
          <p className="text-sm text-text-secondary mt-1">{report.period} • Generated by PRESCIENT</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadPDF}
            className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <Download size={18} />
          </button>
          <button 
            onClick={() => toast.success('Feedback portal opened')}
            className="px-4 py-2 rounded-lg bg-surface border border-border text-text-primary text-sm font-medium hover:bg-surface-hover transition-colors flex items-center gap-2"
          >
             <MessageSquare size={16} /> Send Feedback
          </button>
          <button 
            onClick={() => toast.success('Report marked as reviewed by State Command')}
            className="px-4 py-2 rounded-lg bg-agent-guardian text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
             <CheckCircle size={16} /> Mark Reviewed
          </button>
        </div>
      </div>

      {/* Content */}
      <div ref={reportRef} className="flex-1 overflow-y-auto p-6 bg-surface-elevated">
        <section className="mb-8">
          <h3 className="text-sm font-semibold text-text-primary mb-3 text-agent-prescient">PRESCIENT Executive Summary</h3>
          <p className="text-sm leading-relaxed text-text-secondary bg-surface p-4 rounded-xl border border-border">
            {report.narrative}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-6 mb-8">
          <div className="p-4 rounded-xl border border-border bg-surface">
             <h3 className="text-sm font-semibold text-text-primary mb-4">Daily Issue Volume</h3>
             <ChartBar data={report.volumeData} dataKey="issues" color="#3B82F6" height={180} />
          </div>
          <div className="p-4 rounded-xl border border-border bg-surface">
             <h3 className="text-sm font-semibold text-text-primary mb-4">Category Distribution</h3>
             <ChartDonut data={report.catData} height={180} />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-border bg-surface">
             <h3 className="text-sm font-semibold text-text-primary mb-4">Avg Resolution Time (Week over Week)</h3>
             <ChartLine data={report.trendData} lines={[{ dataKey: 'hours', color: '#10B981' }]} height={180} />
          </div>
          <div className="p-4 rounded-xl border border-border bg-surface">
             <h3 className="text-sm font-semibold text-text-primary mb-4">Fund Utilisation</h3>
             <div className="mb-2 flex justify-between text-sm">
                <span className="text-text-secondary">Q1 Budget Spent</span>
                <span className="text-text-primary font-bold">₹{report.budgetUtilized.current} Cr / ₹{report.budgetUtilized.total} Cr</span>
             </div>
             <div className="w-full h-3 rounded-full bg-surface-elevated border border-border overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${report.budgetUtilized.pct}%` }} />
             </div>
             <p className="text-xs text-text-muted mt-2 text-right">{report.budgetUtilized.pct}% Utilised</p>

             <h3 className="text-sm font-semibold text-text-primary mt-6 mb-3">Top Escalations</h3>
             <ul className="text-xs text-text-secondary space-y-2">
                {report.escalations.map((esc: string, idx: number) => (
                  <li key={idx}>{esc}</li>
                ))}
             </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

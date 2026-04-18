import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { FileText, Bot, Download, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const { fetchApi } = useApi()

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const data = await fetchApi<{ report_id: string, report: any }>('/api/prescient/daily/Mumbai')
      if (data && data.report_id) {
        setReportData(data.report)
        setIsGenerating(false)
        setIsReady(true)
      } else {
        setIsGenerating(false)
        console.error('Failed to generate report')
        toast.error('Failed to trigger PRESCIENT')
      }
    } catch (err: any) {
      setIsGenerating(false)
      console.error('Network error', err)
      toast.error(`Error: ${err?.message || 'Network error'}`)
    }
  }

  const handleDownloadPdf = () => {
    if (!reportData) return
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF()

      // Headers
      doc.setFontSize(22)
      doc.setTextColor(0, 51, 102)
      doc.text(`PRESCIENT Weekly Performance Report`, 20, 20)

      doc.setFontSize(14)
      doc.setTextColor(100, 100, 100)
      doc.text(`Municipal Corporation: ${reportData.mc_name || 'Mumbai'}`, 20, 30)
      doc.text(`Generated: ${reportData.date || new Date().toISOString().split('T')[0]}`, 20, 38)
      doc.setLineWidth(0.5)
      doc.line(20, 42, 190, 42)

      // Metrics
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Key Operational Metrics', 20, 55)

      doc.setFontSize(12)
      const sum = reportData.summary || {}
      doc.text(`Issues Received: ${sum.issues_received || 0}`, 20, 65)
      doc.text(`Issues Resolved: ${sum.issues_resolved || 0}`, 20, 72)
      doc.text(`Issues Pending: ${sum.issues_pending || 0} (${sum.issues_overdue || 0} Overdue)`, 20, 79)
      doc.text(`Resolution Rate: ${sum.resolution_rate_pct || 0}%`, 120, 65)
      doc.text(`Avg Resolution Time: ${sum.avg_resolution_hours || 0} hours`, 120, 72)
      doc.text(`SLA Compliance: ${sum.sla_compliance_pct || 0}%`, 120, 79)
      
      doc.line(20, 85, 190, 85)

      // AI Narrative
      doc.setFontSize(16)
      doc.setTextColor(99, 102, 241) // PRESCIENT Purple
      doc.text('PRESCIENT Executive Summary', 20, 98)

      doc.setFontSize(11)
      doc.setTextColor(50, 50, 50)
      const narrative = sum.narrative || 'No summary available.'
      // split text to fit PDF width
      const splitText = doc.splitTextToSize(narrative, 170)
      doc.text(splitText, 20, 108)

      // Worst Wards
      const currentY = 108 + (splitText.length * 6) + 15
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      if (reportData.worst_wards && reportData.worst_wards.length > 0) {
         doc.text(`High-Priority Wards: ${reportData.worst_wards.join(', ')}`, 20, currentY)
      }

      // Save
      doc.save(`PRESCIENT_Report_${reportData.mc_name || 'Mumbai'}.pdf`)
      toast.success('PDF Downloaded!')
    }).catch(err => {
      console.error('Failed to load jsPDF', err)
      toast.error('Failed to generate PDF')
    })
  }

  if (isReady) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border border-primary/30 bg-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              Weekly Performance Report <span className="text-xs bg-agent-prescient text-white px-2 py-0.5 rounded-full font-bold">PRESCIENT</span>
            </h3>
            <p className="text-sm text-text-secondary mt-1">Generated successfully. Ready to send to State Government.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadPdf}
            className="px-4 py-2 rounded-xl bg-surface-elevated border border-border text-sm font-medium hover:bg-surface-hover transition-colors flex items-center gap-2"
          >
            <Download size={16} /> Preview PDF
          </button>
          <button 
            onClick={() => {
              setIsReady(false)
              setReportData(null)
              toast.success('Report successfully submitted to State Government via PRESCIENT', { duration: 4000 })
            }} 
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Submit to State <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="p-6 rounded-2xl border border-border bg-surface-elevated flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Generate Weekly Report</h3>
        <p className="text-sm text-text-secondary mt-1 max-w-lg">
          Trigger the PRESCIENT agent to analyze all operational data, synthesize insights, and build the required weekly submission for the State portal.
        </p>
      </div>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="px-6 py-3 rounded-xl bg-agent-prescient text-white text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2 min-w-[200px] justify-center"
      >
        {isGenerating ? (
          <>
            <Bot size={18} className="animate-bounce" /> Analyzing Data...
          </>
        ) : (
          <>
            <Bot size={18} /> Trigger PRESCIENT
          </>
        )}
      </button>
    </div>
  )
}

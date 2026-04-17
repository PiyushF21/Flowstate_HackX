import { useState } from 'react'
import { FileText, Bot, Download, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate PRESCIENT agent generation
    setTimeout(() => {
      setIsGenerating(false)
      setIsReady(true)
    }, 3000)
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
          <button className="px-4 py-2 rounded-xl bg-surface-elevated border border-border text-sm font-medium hover:bg-surface-hover transition-colors flex items-center gap-2">
            <Download size={16} /> Preview PDF
          </button>
          <button onClick={() => setIsReady(false)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
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

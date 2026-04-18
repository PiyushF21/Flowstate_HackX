import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Languages, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ProcedureAccordionProps {
  steps: string[]
  className?: string
}

export default function ProcedureAccordion({ steps, className }: ProcedureAccordionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const [translatedSteps, setTranslatedSteps] = useState<string[]>([])
  const [isTranslating, setIsTranslating] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextLang = lang === 'en' ? 'hi' : 'en'
    setLang(nextLang)
    
    // Call Sarvam AI translation only once when switching to Hindi
    if (nextLang === 'hi' && translatedSteps.length === 0) {
      setIsTranslating(true)
      try {
        const promises = steps.map(async (step) => {
          const res = await fetch('/api/field-copilot/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: step, target_language: 'hi' })
          })
          const data = await res.json()
          return data.translated_text || step
        })
        const translated = await Promise.all(promises)
        setTranslatedSteps(translated)
      } catch (err) {
        console.error("Translation fail via Sarvam:", err)
      } finally {
        setIsTranslating(false)
      }
    }
  }

  const toggleStep = (idx: number) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const progress = steps.length > 0 ? Math.round((checked.size / steps.length) * 100) : 0

  return (
    <div className={cn('rounded-xl border border-border bg-surface-elevated', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">📋 Procedure</span>
          <span className="text-[10px] text-text-muted">{checked.size}/{steps.length} done</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-surface-hover hidden sm:block">
              <div
                className="h-full rounded-full bg-agent-commander transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button 
            onClick={handleToggle}
            className="flex items-center gap-1.5 px-2 py-1 bg-surface-elevated border border-border rounded-lg text-xs hover:bg-surface-hover text-text-primary transition-colors"
          >
            <Languages size={12} className="text-secondary" />
            {lang === 'en' ? 'हिन्दी' : 'EN'}
          </button>
          <div className="w-px h-4 bg-border mx-1"></div>
          {isOpen ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-1.5 min-h-[50px] relative">
          {isTranslating ? (
            <div className="flex flex-col items-center justify-center p-6 gap-3 text-text-muted">
              <Loader2 size={24} className="animate-spin text-primary" />
              <span className="text-xs font-medium">Translating strictly with Sarvam AI...</span>
            </div>
          ) : (
            steps.map((step, idx) => {
              const isDone = checked.has(idx)
              const displayText = lang === 'hi' && translatedSteps[idx] ? translatedSteps[idx] : step
              
              return (
              <button
                key={idx}
                onClick={() => toggleStep(idx)}
                className={cn(
                  'w-full flex items-start gap-2.5 p-2 rounded-lg transition-colors text-left',
                  isDone ? 'bg-agent-commander/5' : 'hover:bg-surface-hover'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                  isDone
                    ? 'bg-agent-commander border-agent-commander'
                    : 'border-border-light'
                )}>
                  {isDone && <Check size={12} className="text-white" />}
                </div>
                <span className={cn(
                  'text-sm leading-relaxed whitespace-pre-wrap',
                  isDone ? 'text-text-muted line-through' : 'text-text-primary'
                )}>
                  {displayText}
                </span>
              </button>
            )
          })
        )}
        </div>
      )}
    </div>
  )
}

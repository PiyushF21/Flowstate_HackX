import { useState } from 'react'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ProcedureAccordionProps {
  steps: string[]
  className?: string
}

export default function ProcedureAccordion({ steps, className }: ProcedureAccordionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [checked, setChecked] = useState<Set<number>>(new Set())

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
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-surface-hover">
            <div
              className="h-full rounded-full bg-agent-commander transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {isOpen ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-1.5">
          {steps.map((step, idx) => {
            const isDone = checked.has(idx)
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
                  'text-sm leading-relaxed',
                  isDone ? 'text-text-muted line-through' : 'text-text-primary'
                )}>
                  {step}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

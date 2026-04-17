import { useState } from 'react'
import { IndianRupee, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface AllocationRow {
  id: string
  mcName: string
  recommended: number
  current: number
  rationale: string
  status: 'on_track' | 'watch' | 'audit'
}

interface AllocationTableProps {
  data: AllocationRow[]
  totalBudget: number
}

export default function AllocationTable({ data, totalBudget }: AllocationTableProps) {
  const [allocations, setAllocations] = useState<Record<string, string>>(
    data.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.recommended.toString() }), {})
  )

  const handleUpdate = (id: string, val: string) => {
    // Only allow numbers
    if (val === '' || /^\d+$/.test(val)) {
      setAllocations(prev => ({ ...prev, [id]: val }))
    }
  }

  const currentTotal = Object.values(allocations).reduce((sum, val) => sum + (parseInt(val) || 0), 0)
  const isOverBudget = currentTotal > totalBudget
  const isUnderBudget = currentTotal < totalBudget

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-elevated border-b border-border text-xs text-text-muted font-medium uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Municipal Corp</th>
              <th className="px-4 py-3">Performance Flag</th>
              <th className="px-4 py-3">Rationale (ORACLE)</th>
              <th className="px-4 py-3 text-right">Current (₹ Cr)</th>
              <th className="px-4 py-3 text-right font-bold text-agent-oracle">Recommended (₹ Cr)</th>
              <th className="px-4 py-3 text-right">Adjusted (₹ Cr)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-4 font-semibold text-text-primary">{row.mcName}</td>
                <td className="px-4 py-4">
                  {row.status === 'on_track' && <span className="text-green-400 flex items-center gap-1.5"><CheckCircle size={14}/> On Track</span>}
                  {row.status === 'watch' && <span className="text-yellow-400 flex items-center gap-1.5"><AlertTriangle size={14}/> Watch</span>}
                  {row.status === 'audit' && <span className="text-critical flex items-center gap-1.5"><AlertTriangle size={14}/> Audit Rec</span>}
                </td>
                <td className="px-4 py-4 text-xs text-text-secondary max-w-[250px] leading-relaxed">{row.rationale}</td>
                <td className="px-4 py-4 text-right text-text-secondary">{row.current}</td>
                <td className="px-4 py-4 text-right font-bold text-agent-oracle bg-agent-oracle/5">{row.recommended}</td>
                <td className="px-4 py-4 text-right">
                  <div className="relative inline-block w-24">
                    <IndianRupee size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={allocations[row.id]}
                      onChange={(e) => handleUpdate(row.id, e.target.value)}
                      className={cn(
                        "w-full bg-surface-elevated border rounded-lg pl-7 pr-3 py-1.5 text-right font-mono transition-colors focus:outline-none",
                        parseInt(allocations[row.id] || '0') !== row.recommended ? 'border-primary text-primary' : 'border-border text-text-primary focus:border-text-muted'
                      )}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Validation Footer */}
      <div className="p-4 bg-surface-elevated border-t border-border flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-text-muted">Total Budget Utilization</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              "text-lg font-bold font-mono",
              isOverBudget ? "text-critical" : isUnderBudget ? "text-yellow-400" : "text-green-400"
            )}>
              ₹{currentTotal} Cr
            </span>
            <span className="text-text-secondary text-sm">/ ₹{totalBudget} Cr</span>
          </div>
        </div>
        
        {isOverBudget && <div className="text-xs text-critical flex items-center gap-1.5 font-medium"><AlertTriangle size={14} /> Total exceeds state budget by ₹{currentTotal - totalBudget} Cr</div>}
        {isUnderBudget && <div className="text-xs text-yellow-400 flex items-center gap-1.5 font-medium"><AlertTriangle size={14} /> ₹{totalBudget - currentTotal} Cr remains unallocated</div>}
        {!isOverBudget && !isUnderBudget && <div className="text-xs text-green-400 flex items-center gap-1.5 font-medium"><CheckCircle size={14} /> Budget perfectly balanced</div>}
      </div>
    </div>
  )
}

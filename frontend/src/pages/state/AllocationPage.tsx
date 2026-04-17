import StateLayout from '../../components/state/StateLayout'
import AllocationTable, { type AllocationRow } from '../../components/state/AllocationTable'
import { Bot, Check, X, PencilLine, Download } from 'lucide-react'

const MOCK_ALLOCATIONS: AllocationRow[] = [
  { id: '1', mcName: 'BMC Mumbai', current: 120, recommended: 145, status: 'on_track', rationale: 'Population density multiplier + aging sewage network requires capex.' },
  { id: '2', mcName: 'PMC Pune', current: 85, recommended: 65, status: 'watch', rationale: 'Prior year fund utilisation <60%. Redirecting to higher priority zones.' },
  { id: '3', mcName: 'NMC Nagpur', current: 45, recommended: 35, status: 'audit', rationale: 'SLA breach continuous. Audit recommended before further allocation.' },
  { id: '4', mcName: 'TMC Thane', current: 60, recommended: 75, status: 'on_track', rationale: 'Consistent performance. Rapid urban expansion demands fleet upgrade.' },
  { id: '5', mcName: 'NMC Nashik', current: 40, recommended: 30, status: 'on_track', rationale: 'Requirements fulfilled in previous cycle.' },
]

export default function AllocationPage() {
  return (
    <StateLayout>
      <div className="p-6 pb-28">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary tracking-wide">Strategic Resource Allocation</h1>
            <p className="text-sm text-text-muted mt-1">ORACLE Intelligence fund recommendations for Q1 FY2026-27.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-agent-oracle/30 bg-agent-oracle/10 text-agent-oracle text-xs font-semibold">
            <Bot size={14} /> ORACLE Optimizer Active
          </div>
        </div>

        {/* ORACLE Main Panel */}
        <div className="bg-gradient-to-r from-agent-oracle/5 to-surface-elevated border border-agent-oracle/20 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-text-primary">ORACLE Quarter 1 Allocation Proposal</h2>
            <span className="px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-text-muted flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" /> Awaiting State Approval
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-text-secondary mb-1">State Urban Development Budget (Q1)</span>
            <span className="text-3xl font-display font-bold text-text-primary">₹350 Cr</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Fund Distribution Matrix</h2>
          <AllocationTable data={MOCK_ALLOCATIONS} totalBudget={350} />
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Physical Resource Reallocation (Fleet & Crew)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 1, text: "Deploy 2 additional JCB excavators to PMC Pune — road repair backlog growing 15% WoW.", priority: 'HIGH' },
              { id: 2, text: "Transfer 8 workers from NMC Nashik (40% utilization) to BMC Mumbai (92% utilization) for next 30 days.", priority: 'MEDIUM' }
            ].map(rec => (
              <div key={rec.id} className="p-4 rounded-xl border border-border bg-surface-elevated">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${rec.priority === 'HIGH' ? 'bg-high/10 text-high' : 'bg-medium/10 text-medium'}`}>{rec.priority} PRIORITY</span>
                </div>
                <p className="text-sm text-text-primary mb-4 leading-relaxed">{rec.text}</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"><Check size={14}/> Approve</button>
                  <button className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-hover text-xs font-semibold text-text-secondary transition-colors"><PencilLine size={14}/></button>
                  <button className="px-3 py-1.5 rounded-lg bg-critical/10 text-critical hover:bg-critical/20 text-xs font-semibold transition-colors"><X size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-64 right-0 p-4 border-t border-border bg-surface/90 backdrop-blur-xl z-30 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <div className="text-sm text-text-secondary">
          Modifying the adjusted column will prompt a rationale requirement.
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl border border-border bg-surface-elevated hover:bg-surface-hover text-sm font-medium text-text-primary flex items-center gap-2 transition-colors">
            <Download size={16} /> Export Draft
          </button>
          <button className="px-6 py-2.5 rounded-xl bg-surface border border-border text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors flex items-center gap-2">
            <PencilLine size={16} /> Save as Draft
          </button>
          <button className="px-6 py-2.5 rounded-xl bg-agent-oracle text-bg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.3)] shadow-agent-oracle/20">
            <Check size={18} /> Authorize Allocations
          </button>
        </div>
      </div>
    </StateLayout>
  )
}

import WorkerTabNav from './WorkerTabNav'

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="relative w-full max-w-[430px] h-[93vh] max-h-[900px] bg-surface rounded-[2.5rem] border border-border overflow-hidden shadow-2xl flex flex-col">
        {/* Status bar */}
        <div className="flex items-center justify-between px-7 pt-3 pb-1 text-[11px] text-text-muted">
          <span className="font-semibold">
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="6" width="3" height="6" rx="0.5"/><rect x="4" y="4" width="3" height="8" rx="0.5"/><rect x="8" y="2" width="3" height="10" rx="0.5"/><rect x="12" y="0" width="3" height="12" rx="0.5"/></svg>
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0.5" y="0.5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="16" y="3.5" width="2" height="5" rx="0.5"/><rect x="2" y="2" width="10" height="8" rx="1" fill="currentColor" opacity="0.8"/></svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>

        <WorkerTabNav />
      </div>
    </div>
  )
}

import WorkerTabNav from './WorkerTabNav'

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 mesh-bg p-4 relative overflow-hidden">
      
      {/* Ambient background glow to separate phone from background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* 
        Mobile phone outer hardware frame 
      */}
      <div className="relative w-full max-w-[400px] h-[850px] max-h-[90vh] bg-[#0c0c0e] rounded-[3.2rem] p-[8px] shadow-2xl shrink-0 ring-1 ring-white/10 my-4">
        
        {/* Hardware Buttons - Left (Volume/Action) */}
        <div className="absolute top-[140px] -left-[3px] w-[3px] h-[26px] bg-[#2a2a30] rounded-l-md border-y border-y-[#111]"></div>
        <div className="absolute top-[190px] -left-[3px] w-[3px] h-[55px] bg-[#2a2a30] rounded-l-md border-y border-y-[#111]"></div>
        <div className="absolute top-[260px] -left-[3px] w-[3px] h-[55px] bg-[#2a2a30] rounded-l-md border-y border-y-[#111]"></div>
        
        {/* Hardware Buttons - Right (Power) */}
        <div className="absolute top-[210px] -right-[3px] w-[3px] h-[80px] bg-[#2a2a30] rounded-r-md border-y border-y-[#111]"></div>

        {/* Inner screen area */}
        <div className="relative w-full h-full bg-bg mesh-bg rounded-[2.8rem] overflow-hidden flex flex-col ring-1 ring-[#ffffff08]">
          
          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[110px] h-[32px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[0_0_8px_rgba(0,0,0,0.5)]">
             <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0f] shadow-[inset_0_0_3px_rgba(255,255,255,0.15)] border border-white/5 flex items-center justify-center">
                 <div className="w-1 h-1 rounded-full bg-emerald-900/40"></div>
             </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-8 pt-4 pb-1 text-[12px] font-medium text-text-primary z-40 relative tracking-wide">
            <span className="w-1/3 flex justify-start">
              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            <span className="w-1/3"></span> {/* Spacer for dynamic island */}
            <div className="flex items-center justify-end gap-1.5 w-1/3">
              <svg width="15" height="11" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="6" width="3" height="6" rx="0.5"/><rect x="4" y="4" width="3" height="8" rx="0.5"/><rect x="8" y="2" width="3" height="10" rx="0.5"/><rect x="12" y="0" width="3" height="12" rx="0.5"/></svg>
              <svg width="18" height="11" viewBox="0 0 18 12" fill="currentColor"><rect x="0.5" y="0.5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="16" y="3.5" width="2" height="5" rx="0.5"/><rect x="2" y="2" width="10" height="8" rx="1" fill="currentColor" opacity="0.8"/></svg>
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none pb-2 relative z-10 w-full">
            {children}
          </div>

          {/* Bottom nav */}
          <div className="relative z-40 bg-bg">
            <WorkerTabNav />
            {/* iOS Home Indicator */}
            <div className="pt-1 pb-3 bg-bg flex justify-center items-center">
              <div className="w-[35%] h-[5px] bg-[#3a3a46] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useLocation, useNavigate } from 'react-router-dom'
import { Network, Activity, GitCommit, ShieldAlert, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

const tabs = [
  { path: '/nexus/constellation', icon: Network, label: 'CONSTELLATION' },
  { path: '/nexus/events', icon: Activity, label: 'EVENT STREAM' },
  { path: '/nexus/pipeline', icon: GitCommit, label: 'PIPELINE LOGIC' },
]

export default function NexusTopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-40">
      
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-agent-nexus/20 border border-agent-nexus/50 flex items-center justify-center">
           <span className="text-agent-nexus font-bold text-sm">🌌</span>
        </div>
        <div>
           <h1 className="text-sm font-bold font-display text-white tracking-widest">NEXUS<span className="text-agent-nexus">CORE</span></h1>
           <p className="text-[10px] text-white/50 tracking-[0.2em] font-mono leading-none mt-0.5">MASTER ORCHESTRATOR</p>
        </div>
      </div>

      {/* Middle: Tabs */}
      <nav className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all",
                isActive 
                  ? "bg-agent-nexus text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Right: Status & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
           </span>
           <span className="text-[10px] font-mono text-green-400 font-bold uppercase tracking-widest">System Optimal</span>
        </div>
        
        <button className="text-white/40 hover:text-white/80 transition-colors p-2 rounded-full hover:bg-white/5">
          <ShieldAlert size={18} />
        </button>
        <button 
          onClick={() => { logout(); navigate('/login') }}
          className="text-red-400/70 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-400/10"
        >
          <LogOut size={18} />
        </button>
      </div>

    </header>
  )
}

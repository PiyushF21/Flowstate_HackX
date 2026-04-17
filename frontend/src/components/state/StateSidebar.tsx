import { useLocation, useNavigate } from 'react-router-dom'
import { Building2, FileText, IndianRupee, Trophy, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

const navItems = [
  { path: '/state/overview', icon: Building2, label: 'State Overview' },
  { path: '/state/reports', icon: FileText, label: 'Weekly Reports' },
  { path: '/state/allocation', icon: IndianRupee, label: 'Fund Allocation' },
  { path: '/state/accountability', icon: Trophy, label: 'Accountability Board' },
]

export default function StateSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-40 shadow-xl shadow-black/50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-bold font-display text-text-primary tracking-wide">STATE COMMAND</h1>
        <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">Maharashtra Govt</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-agent-guardian/10 text-agent-guardian border border-agent-guardian/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              )}
            >
              <item.icon size={18} className={cn(isActive ? 'text-agent-guardian' : 'text-text-muted group-hover:text-text-primary')} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-border bg-surface-elevated">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 border border-border rounded-full flex items-center justify-center text-sm shadow-inner bg-bg">
            🏛️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.userName || 'Secretary (UDD)'}</p>
            <p className="text-[10px] text-text-muted">State Level Access</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-text-muted hover:text-critical hover:bg-critical/5 transition-colors"
        >
          <LogOut size={14} /> Secure Logout
        </button>
      </div>
    </aside>
  )
}

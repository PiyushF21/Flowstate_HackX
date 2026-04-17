import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, HardHat, CheckCircle2, BarChart3, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

const navItems = [
  { path: '/bmc/dashboard', icon: LayoutDashboard, label: 'Issues Dashboard' },
  { path: '/bmc/workers', icon: HardHat, label: 'Workers' },
  { path: '/bmc/completed', icon: CheckCircle2, label: 'Completed Work' },
  { path: '/bmc/reports', icon: BarChart3, label: 'Reports & Analytics' },
]

export default function BMCSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-bold font-display text-text-primary">🔍 InfraLens</h1>
        <p className="text-[10px] text-text-muted mt-0.5">BMC Operations Portal</p>
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
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.userName || 'BMC Supervisor'}</p>
            <p className="text-[10px] text-text-muted">BMC Mumbai</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-text-muted hover:text-critical hover:bg-critical/5 transition-colors"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  )
}

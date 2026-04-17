import { useLocation, useNavigate } from 'react-router-dom'
import { Home, ClipboardList, Bot, User } from 'lucide-react'
import { cn } from '../../lib/utils'

const tabs = [
  { path: '/worker/dashboard', icon: Home, label: 'Home' },
  { path: '/worker/tasks', icon: ClipboardList, label: 'Tasks' },
  { path: '/worker/assistant', icon: Bot, label: 'AI' },
  { path: '/worker/profile', icon: User, label: 'Profile' },
]

export default function WorkerTabNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="flex items-center justify-around py-2 pb-3 border-t border-border bg-surface/95 backdrop-blur-lg">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all',
              isActive ? 'text-agent-commander' : 'text-text-muted hover:text-text-secondary'
            )}
          >
            <tab.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{tab.label}</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-agent-commander mt-0.5" />}
          </button>
        )
      })}
    </nav>
  )
}

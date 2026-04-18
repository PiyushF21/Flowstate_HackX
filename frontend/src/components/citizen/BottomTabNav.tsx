import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Car, PenSquare, User } from 'lucide-react'
import { cn } from '../../lib/utils'

const tabs = [
  { path: '/citizen/area-map', icon: MapPin, label: 'Map' },
  { path: '/citizen/my-cars', icon: Car, label: 'Cars' },
  { path: '/citizen/report', icon: PenSquare, label: 'Report' },
  { path: '/citizen/profile', icon: User, label: 'Profile' },
]

export default function BottomTabNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="flex items-center justify-around py-3 pb-4 bg-bg border-t border-white/[0.04]">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex flex-col items-center gap-1 w-20 py-1.5 rounded-2xl transition-all duration-300',
              isActive
                ? 'bg-[#1e293b]/60 text-primary'
                : 'text-[#646473] hover:text-text-secondary hover:bg-white/[0.02]'
            )}
          >
            <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive && 'fill-primary/20')} />
            <span className="text-[9px] font-bold tracking-wide uppercase mt-0.5">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

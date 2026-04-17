import { Bell } from 'lucide-react'
import { cn } from '../../lib/utils'

interface NotificationBellProps {
  /** Number of unread notifications */
  count?: number
  /** Click handler */
  onClick?: () => void
  className?: string
}

export default function NotificationBell({ count = 0, onClick, className }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 rounded-xl hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary',
        className
      )}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      <Bell size={20} />

      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-critical opacity-40 animate-ping" />
          <span className="relative inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-critical text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        </span>
      )}
    </button>
  )
}

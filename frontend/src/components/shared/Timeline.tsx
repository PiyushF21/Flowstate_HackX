import { formatSmartDate } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface TimelineEvent {
  label: string
  timestamp: string
  note?: string
}

interface TimelineProps {
  events: TimelineEvent[]
  className?: string
}

export default function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {events.map((event, index) => {
          const isFirst = index === 0
          return (
            <div key={`${event.label}-${index}`} className="relative flex items-start gap-3 pl-6">
              {/* Dot */}
              <div
                className={cn(
                  'absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-surface',
                  isFirst ? 'bg-primary' : 'bg-border-light'
                )}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={cn(
                      'text-sm font-medium capitalize',
                      isFirst ? 'text-text-primary' : 'text-text-secondary'
                    )}
                  >
                    {event.label}
                  </p>
                  <span className="text-[10px] text-text-muted">
                    {formatSmartDate(event.timestamp)}
                  </span>
                </div>
                {event.note && (
                  <p className="text-xs text-text-muted mt-0.5">{event.note}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

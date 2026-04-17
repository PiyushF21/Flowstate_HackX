import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Optional label */
  label?: string
  /** Full screen overlay mode */
  fullScreen?: boolean
  className?: string
}

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
}

export default function LoadingSpinner({
  size = 'md',
  label,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-surface-elevated animate-spin',
          sizeMap[size]
        )}
        style={{
          borderTopColor: 'var(--primary)',
          borderRightColor: 'var(--primary)',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
        }}
      />
      {label && <p className="text-sm text-text-muted animate-pulse">{label}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}

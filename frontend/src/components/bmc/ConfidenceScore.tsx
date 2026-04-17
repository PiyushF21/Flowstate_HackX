import { cn } from '../../lib/utils'

interface ConfidenceScoreProps {
  score: number
  className?: string
}

export default function ConfidenceScore({ score, className }: ConfidenceScoreProps) {
  const color = score >= 80 ? 'text-critical bg-critical/10' : score >= 60 ? 'text-high bg-high/10' : 'text-medium bg-medium/10'

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold', color, className)}>
      {score}
    </span>
  )
}

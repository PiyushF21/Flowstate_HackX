import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform, useInView } from 'framer-motion'

interface AnimatedCounterProps {
  /** Target value to animate to */
  value: number
  /** Duration of the count animation in seconds (default: 1.5) */
  duration?: number
  /** Number of decimal places (default: 0) */
  decimals?: number
  /** Optional CSS class */
  className?: string
}

export default function AnimatedCounter({
  value,
  duration = 1.5,
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [hasAnimated, setHasAnimated] = useState(false)

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration * 1000,
  })

  const display = useTransform(spring, (latest) =>
    Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(latest)
  )

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value)
      setHasAnimated(true)
    }
  }, [isInView, value, spring, hasAnimated])

  // Update on value change after initial animation
  useEffect(() => {
    if (hasAnimated) {
      spring.set(value)
    }
  }, [value, spring, hasAnimated])

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  )
}

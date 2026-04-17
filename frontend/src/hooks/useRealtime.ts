import { useState, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'

interface UseRealtimeOptions<T> {
  /** WebSocket channel name */
  channel: string
  /** Maximum number of items to keep in the buffer (default: 200) */
  maxItems?: number
  /** Whether to connect (default: true) */
  enabled?: boolean
  /** Optional transform function for incoming data */
  transform?: (data: unknown) => T
}

/**
 * Subscribe to a WebSocket channel and accumulate live data.
 * Returns the latest items array plus connection status.
 */
export function useRealtime<T = unknown>({
  channel,
  maxItems = 200,
  enabled = true,
  transform,
}: UseRealtimeOptions<T>) {
  const [items, setItems] = useState<T[]>([])

  const handleMessage = useCallback(
    (data: unknown) => {
      const item = transform ? transform(data) : (data as T)
      setItems((prev) => {
        const next = [item, ...prev]
        return next.length > maxItems ? next.slice(0, maxItems) : next
      })
    },
    [maxItems, transform]
  )

  const { isConnected, send } = useWebSocket({
    channel,
    onMessage: handleMessage,
    enabled,
  })

  const clear = useCallback(() => setItems([]), [])

  return { items, isConnected, send, clear }
}

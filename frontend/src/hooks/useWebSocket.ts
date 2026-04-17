import { useEffect, useRef, useCallback, useState } from 'react'

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

interface UseWebSocketOptions {
  /** WebSocket channel name (appended to base URL) */
  channel: string
  /** Called when a message is received */
  onMessage?: (data: unknown) => void
  /** Called when connection opens */
  onOpen?: () => void
  /** Called when connection closes */
  onClose?: () => void
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean
  /** Reconnect interval in ms (default: 3000) */
  reconnectInterval?: number
  /** Whether to connect immediately (default: true) */
  enabled?: boolean
}

interface UseWebSocketReturn {
  /** Send a message through the WebSocket */
  send: (data: unknown) => void
  /** Current connection status */
  isConnected: boolean
  /** Manually disconnect */
  disconnect: () => void
  /** Manually reconnect */
  reconnect: () => void
}

export function useWebSocket({
  channel,
  onMessage,
  onOpen,
  onClose,
  autoReconnect = true,
  reconnectInterval = 3000,
  enabled = true,
}: UseWebSocketOptions): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [isConnected, setIsConnected] = useState(false)

  // Store latest callbacks in refs to avoid reconnection loops
  const onMessageRef = useRef(onMessage)
  const onOpenRef = useRef(onOpen)
  const onCloseRef = useRef(onClose)
  onMessageRef.current = onMessage
  onOpenRef.current = onOpen
  onCloseRef.current = onClose

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const url = `${WS_BASE_URL}/${channel}`
      const ws = new WebSocket(url)

      ws.onopen = () => {
        setIsConnected(true)
        onOpenRef.current?.()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessageRef.current?.(data)
        } catch {
          onMessageRef.current?.(event.data)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        onCloseRef.current?.()

        if (autoReconnect && enabled) {
          reconnectTimerRef.current = setTimeout(connect, reconnectInterval)
        }
      }

      ws.onerror = () => {
        ws.close()
      }

      wsRef.current = ws
    } catch {
      // Connection failed, will retry if autoReconnect
      if (autoReconnect && enabled) {
        reconnectTimerRef.current = setTimeout(connect, reconnectInterval)
      }
    }
  }, [channel, autoReconnect, reconnectInterval, enabled])

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimerRef.current)
    wsRef.current?.close()
    wsRef.current = null
    setIsConnected(false)
  }, [])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data))
    }
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    connect()
  }, [disconnect, connect])

  useEffect(() => {
    if (enabled) {
      connect()
    }
    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return { send, isConnected, disconnect, reconnect }
}

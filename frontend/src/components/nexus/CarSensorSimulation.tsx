import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CarSensorSimulationProps {
  onComplete: (sensorPayload: any) => void
  onClose: () => void
}

type SimPhase = 'driving' | 'spike' | 'gps_lock' | 'reporting' | 'done'

// Generate smooth driving noise
function drivingNoise(t: number): { x: number; y: number; z: number } {
  return {
    x: Math.sin(t * 0.7) * 0.15 + Math.sin(t * 1.3) * 0.08 + (Math.random() - 0.5) * 0.1,
    y: Math.sin(t * 0.5) * 0.2 + Math.cos(t * 0.9) * 0.1 + (Math.random() - 0.5) * 0.15 + 0.98,
    z: Math.cos(t * 0.6) * 0.12 + Math.sin(t * 1.1) * 0.06 + (Math.random() - 0.5) * 0.08,
  }
}

const MAX_POINTS = 120
const GPS_LAT = 19.1196
const GPS_LNG = 72.8467

export default function CarSensorSimulation({ onComplete, onClose }: CarSensorSimulationProps) {
  const [phase, setPhase] = useState<SimPhase>('driving')
  const [speed, setSpeed] = useState(42)
  const [dataPoints, setDataPoints] = useState<{ x: number; y: number; z: number }[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [gpsProgress, setGpsProgress] = useState(0)
  const [reportStatus, setReportStatus] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrame = useRef<number>(0)
  const startTime = useRef(Date.now())
  const spikeTime = useRef(0)

  // Store callbacks in refs so our setTimeout chain never gets stale references
  const onCompleteRef = useRef(onComplete)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // Single master timeline — runs once on mount, never re-runs
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Phase 1: Driving (0-3s) — already default state
    // Phase 2: Spike at 3s
    timers.push(setTimeout(() => {
      setPhase('spike')
      spikeTime.current = Date.now()
    }, 3000))

    // Phase 3: GPS Lock at 4.5s
    timers.push(setTimeout(() => {
      setPhase('gps_lock')
      // Animate GPS progress from 0→100 over ~1.25s
      let p = 0
      const gpsTick = setInterval(() => {
        p += 4
        setGpsProgress(Math.min(p, 100))
        if (p >= 100) clearInterval(gpsTick)
      }, 50)
      // Store interval for cleanup
      timers.push(gpsTick as any)
    }, 4500))

    // Phase 4: Reporting at 6s
    timers.push(setTimeout(() => setPhase('reporting'), 6000))

    // Reporting status messages
    const reportSteps = [
      { text: 'Transmitting sensor data to NEXUS...', delay: 6000 },
      { text: 'COGNOS analyzing jolt signature...', delay: 6800 },
      { text: 'Severity: HIGH — Y-axis jolt 4.8g detected', delay: 7600 },
      { text: 'COMMANDER assigning nearest worker...', delay: 8400 },
      { text: '✅ Pothole reported successfully!', delay: 9200 },
    ]
    reportSteps.forEach(s => {
      timers.push(setTimeout(() => setReportStatus(s.text), s.delay))
    })

    // Phase 5: Done + fire API at 10s
    timers.push(setTimeout(() => {
      setPhase('done')
      onCompleteRef.current({
        source: 'car_sensor',
        raw_data: {
          vehicle_id: 'MH-01-AB-1234',
          timestamp: new Date().toISOString(),
          gps: { lat: GPS_LAT, lng: GPS_LNG, address: 'Western Express Highway, Andheri', city: 'Mumbai', ward: 'K-West' },
          speed_kmh: 45.2,
          accelerometer: { x: 0.1, y: 4.8, z: 0.5 },
          suspension_event: true,
          road_segment: 'WEH-KM-14',
          city: 'Mumbai',
          ward: 'K-West',
        },
        location: { lat: GPS_LAT, lng: GPS_LNG, address: 'Western Express Highway, Andheri', city: 'Mumbai', ward: 'K-West' },
      })
    }, 10000))

    // Phase 6: Close overlay at 11.5s
    timers.push(setTimeout(() => {
      onCloseRef.current()
    }, 11500))

    return () => {
      timers.forEach(t => clearTimeout(t))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty — runs once on mount

  // Data generation loop
  useEffect(() => {
    const tick = () => {
      const t = (Date.now() - startTime.current) / 1000
      setElapsed(t)
      setSpeed(40 + Math.sin(t * 0.3) * 5 + (Math.random() - 0.5) * 2)

      let point: { x: number; y: number; z: number }

      if (phase === 'spike' || (phase !== 'driving' && spikeTime.current > 0)) {
        const dt = (Date.now() - spikeTime.current) / 1000
        if (dt < 0.3) {
          // Sharp spike
          const intensity = Math.sin(dt / 0.3 * Math.PI) * 4.8
          point = {
            x: (Math.random() - 0.5) * 1.2,
            y: intensity,
            z: (Math.random() - 0.5) * 0.8,
          }
        } else if (dt < 0.8) {
          // Ringing down
          const decay = Math.exp(-(dt - 0.3) * 6)
          point = {
            x: Math.sin(dt * 15) * 0.5 * decay,
            y: Math.sin(dt * 20) * 2.0 * decay + 0.98,
            z: Math.cos(dt * 12) * 0.3 * decay,
          }
        } else {
          point = drivingNoise(t)
        }
      } else {
        point = drivingNoise(t)
      }

      setDataPoints(prev => {
        const next = [...prev, point]
        return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next
      })

      animFrame.current = requestAnimationFrame(tick)
    }
    animFrame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrame.current)
  }, [phase])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.fillStyle = '#0a0a12'
    ctx.fillRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let i = 0; i < 10; i++) {
      const y = (h / 10) * i
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
    for (let i = 0; i < 20; i++) {
      const x = (w / 20) * i
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }

    // Y-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.font = '10px monospace'
    const labels = ['+5g', '+2.5g', '0g', '-2.5g', '-5g']
    labels.forEach((lbl, i) => {
      ctx.fillText(lbl, 4, (h / (labels.length - 1)) * i + 10)
    })

    if (dataPoints.length < 2) return

    const drawLine = (extractor: (p: { x: number; y: number; z: number }) => number, color: string, label: string) => {
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'

      const step = w / MAX_POINTS
      for (let i = 0; i < dataPoints.length; i++) {
        const val = extractor(dataPoints[i])
        const px = i * step
        const py = h / 2 - (val / 5) * (h / 2)  // map -5..+5 to canvas
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()

      // Glow for Y-axis during spike
      if (label === 'Y-axis' && phase !== 'driving') {
        ctx.strokeStyle = color.replace('1)', '0.3)')
        ctx.lineWidth = 6
        ctx.stroke()
      }

      // Label at end
      if (dataPoints.length > 2) {
        const lastVal = extractor(dataPoints[dataPoints.length - 1])
        const lx = (dataPoints.length - 1) * step + 4
        const ly = h / 2 - (lastVal / 5) * (h / 2)
        ctx.fillStyle = color
        ctx.font = 'bold 10px monospace'
        ctx.fillText(`${label} ${lastVal.toFixed(2)}g`, Math.min(lx, w - 80), ly - 6)
      }
    }

    drawLine(p => p.x, 'rgba(59,130,246,1)', 'X-axis')
    drawLine(p => p.y, 'rgba(239,68,68,1)', 'Y-axis')
    drawLine(p => p.z, 'rgba(16,185,129,1)', 'Z-axis')

  }, [dataPoints, phase])

  const isAlert = phase !== 'driving'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-[#06060f] flex flex-col"
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b transition-colors duration-500 ${isAlert ? 'border-red-500/30 bg-red-950/20' : 'border-white/5'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isAlert ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`} />
            <div>
              <h2 className="text-white font-bold text-base font-mono">INFRALENS CAR SENSOR</h2>
              <p className="text-white/40 text-[10px] font-mono">Vehicle: MH-01-AB-1234 • OBD-II Module Active</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-white/50">{elapsed.toFixed(1)}s</span>
            <span className="text-blue-400">{speed.toFixed(0)} km/h</span>
            {phase === 'driving' && (
              <button onClick={onClose} className="text-white/30 hover:text-white text-xs">[ESC]</button>
            )}
          </div>
        </div>

        {/* Status strip */}
        <div className={`px-6 py-2 text-xs font-mono flex items-center gap-2 transition-colors duration-500 ${
          isAlert ? 'bg-red-500/10 text-red-400' : 'bg-green-500/5 text-green-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`} />
          {phase === 'driving' && 'MONITORING — Normal driving pattern detected'}
          {phase === 'spike' && '⚠️ ANOMALY DETECTED — Severe jolt on Y-axis (4.8g)'}
          {phase === 'gps_lock' && '📡 LOCKING GPS COORDINATES...'}
          {phase === 'reporting' && '📤 REPORTING TO NEXUS PIPELINE...'}
          {phase === 'done' && '✅ ISSUE REGISTERED — Returning to NEXUS...'}
        </div>

        {/* Main graph area */}
        <div className="flex-1 relative px-4 py-3">
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-xl border border-white/5"
            style={{ imageRendering: 'auto' }}
          />

          {/* Spike alert overlay on the graph */}
          <AnimatePresence>
            {phase === 'spike' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className="bg-red-500/20 backdrop-blur-md border border-red-500/40 rounded-2xl px-8 py-5 text-center">
                  <p className="text-red-400 text-3xl font-bold font-mono mb-1">⚠️ POTHOLE</p>
                  <p className="text-red-300 text-sm font-mono">Y-axis jolt: 4.8g at 45 km/h</p>
                  <p className="text-white/40 text-[10px] font-mono mt-2">Severity threshold exceeded (2.0g)</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom panel */}
        <div className={`px-6 py-4 border-t transition-colors duration-500 ${isAlert ? 'border-red-500/20 bg-[#0a0a12]' : 'border-white/5 bg-[#08080e]'}`}>
          {/* Accelerometer readout */}
          {(phase === 'driving' || phase === 'spike') && (
            <div className="grid grid-cols-3 gap-4 mb-3">
              {['X', 'Y', 'Z'].map((axis, i) => {
                const val = dataPoints.length > 0
                  ? (axis === 'X' ? dataPoints[dataPoints.length - 1].x : axis === 'Y' ? dataPoints[dataPoints.length - 1].y : dataPoints[dataPoints.length - 1].z)
                  : 0
                const colors = ['text-blue-400', 'text-red-400', 'text-emerald-400']
                const isYSpike = axis === 'Y' && phase === 'spike'
                return (
                  <div key={axis} className={`text-center rounded-xl p-3 border transition-all duration-300 ${
                    isYSpike ? 'border-red-500/50 bg-red-500/10' : 'border-white/5 bg-white/[0.02]'
                  }`}>
                    <p className="text-[10px] text-white/30 font-mono mb-1">{axis}-AXIS</p>
                    <p className={`text-2xl font-bold font-mono ${isYSpike ? 'text-red-400 animate-pulse' : colors[i]}`}>
                      {val.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-white/20 font-mono">g-force</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* GPS Lock animation */}
          {phase === 'gps_lock' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs font-mono">📡 Acquiring GPS fix...</span>
                <span className="text-cyan-400 text-xs font-mono">{gpsProgress}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${gpsProgress}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-center">
                  <p className="text-[10px] text-white/30 font-mono mb-1">LATITUDE</p>
                  <p className="text-lg font-bold font-mono text-cyan-400">
                    {gpsProgress > 30 ? GPS_LAT.toFixed(4) : '—.——'}
                  </p>
                </div>
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-center">
                  <p className="text-[10px] text-white/30 font-mono mb-1">LONGITUDE</p>
                  <p className="text-lg font-bold font-mono text-cyan-400">
                    {gpsProgress > 50 ? GPS_LNG.toFixed(4) : '—.——'}
                  </p>
                </div>
              </div>
              {gpsProgress > 70 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-xs text-white/30 font-mono"
                >
                  📍 Western Express Highway, Andheri • Ward: K-West
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Reporting pipeline */}
          {(phase === 'reporting' || phase === 'done') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${phase === 'done' ? 'bg-green-400' : 'bg-primary animate-pulse'}`} />
                  <span className="text-sm font-mono text-white/70">NEXUS PIPELINE</span>
                </div>
                <p className="text-sm font-mono text-primary">
                  {reportStatus}
                </p>
              </div>
              {/* Summary card */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/[0.02] border border-white/5 p-2">
                  <p className="text-[9px] text-white/30 font-mono">SOURCE</p>
                  <p className="text-xs text-white/70 font-mono">🚗 Car Sensor</p>
                </div>
                <div className="rounded-lg bg-white/[0.02] border border-white/5 p-2">
                  <p className="text-[9px] text-white/30 font-mono">SEVERITY</p>
                  <p className="text-xs text-red-400 font-mono font-bold">HIGH</p>
                </div>
                <div className="rounded-lg bg-white/[0.02] border border-white/5 p-2">
                  <p className="text-[9px] text-white/30 font-mono">CATEGORY</p>
                  <p className="text-xs text-white/70 font-mono">Pothole</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

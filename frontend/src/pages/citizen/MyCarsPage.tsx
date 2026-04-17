import { useState } from 'react'
import CitizenLayout from '../../components/citizen/CitizenLayout'
import CarCard from '../../components/citizen/CarCard'
import SeverityBadge from '../../components/shared/SeverityBadge'
import StatusPill from '../../components/shared/StatusPill'
import { cn } from '../../lib/utils'

const MOCK_CARS = [
  { id: '1', regNumber: 'MH-02-AB-1234', model: 'Hyundai Creta', lastTrip: 'Today', issueCount: 3 },
  { id: '2', regNumber: 'MH-04-CD-5678', model: 'Maruti Swift', lastTrip: 'Yesterday', issueCount: 1 },
]

const SENSOR_DETECTIONS = [
  { id: 's1', title: 'Pothole detected — WEH KM 14.2', severity: 'HIGH' as const, time: '10:31 AM', confidence: 'CONFIRMED', reports: 4, status: 'assigned' as const },
  { id: 's2', title: 'Road roughness — Andheri Link Road', severity: 'LOW' as const, time: '10:45 AM', confidence: 'SINGLE', reports: 1, status: 'reported' as const },
  { id: 's3', title: 'Cave-in risk — Goregaon West', severity: 'CRITICAL' as const, time: '11:20 AM', confidence: 'CONFIRMED', reports: 6, status: 'in_progress' as const },
]

const CAPTURES = [
  { id: 'c1', title: 'Fallen road divider', severity: 'CRITICAL' as const, location: 'SV Road, Bandra', time: '11:16 AM', aiResult: 'identified' as const },
  { id: 'c2', title: 'Unclear obstruction', severity: 'MEDIUM' as const, location: 'Hill Road', time: '11:45 AM', aiResult: 'needs_help' as const },
]

export default function MyCarsPage() {
  const [selectedCar, setSelectedCar] = useState('1')
  const [subTab, setSubTab] = useState<'sensor' | '360'>('sensor')

  return (
    <CitizenLayout>
      <div className="px-4 py-3">
        <h1 className="text-lg font-bold font-display text-text-primary mb-4">🚗 My Cars</h1>

        {/* Car selector */}
        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
          {MOCK_CARS.map((car) => (
            <CarCard
              key={car.id}
              regNumber={car.regNumber}
              model={car.model}
              lastTrip={car.lastTrip}
              issueCount={car.issueCount}
              isSelected={selectedCar === car.id}
              onClick={() => setSelectedCar(car.id)}
            />
          ))}
          <button className="flex-shrink-0 w-44 rounded-2xl p-3 border border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary">
            <span className="text-2xl">➕</span>
            <span className="text-xs font-medium">Add Car</span>
          </button>
        </div>

        {/* Sub tabs */}
        <div className="flex gap-1 mt-4 bg-surface-elevated rounded-xl p-1 border border-border">
          <button
            onClick={() => setSubTab('sensor')}
            className={cn(
              'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
              subTab === 'sensor'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Sensor Detections
          </button>
          <button
            onClick={() => setSubTab('360')}
            className={cn(
              'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
              subTab === '360'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            360° Captures
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-3">
          {subTab === 'sensor' ? (
            SENSOR_DETECTIONS.map((det) => (
              <div key={det.id} className="rounded-xl bg-surface-elevated border border-border p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-text-primary flex-1 pr-2">{det.title}</p>
                  <SeverityBadge severity={det.severity} size="sm" />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-text-muted">
                  <span>🕐 {det.time}</span>
                  <span>
                    {det.confidence === 'CONFIRMED'
                      ? `✅ Confirmed by ${det.reports} vehicles`
                      : '⚠️ Single report'}
                  </span>
                </div>
                <div className="mt-2">
                  <StatusPill status={det.status} />
                </div>
              </div>
            ))
          ) : (
            CAPTURES.map((cap) => (
              <div key={cap.id} className="rounded-xl bg-surface-elevated border border-border p-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg bg-surface-hover flex items-center justify-center text-2xl flex-shrink-0">
                    📸
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{cap.title}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{cap.location} • {cap.time}</p>
                    <div className="mt-2">
                      {cap.aiResult === 'identified' ? (
                        <span className="text-[10px] text-green-400 font-medium">
                          ✅ AI Identified — <SeverityBadge severity={cap.severity} size="sm" />
                        </span>
                      ) : (
                        <button className="text-[10px] text-primary font-medium hover:underline">
                          ❓ Needs Your Help — Tap to classify
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats bar */}
        <div className="flex gap-3 mt-6 mb-4">
          {[
            { label: 'Trips Tracked', value: '142' },
            { label: 'Issues Found', value: '8' },
            { label: 'Resolved', value: '5' },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 text-center rounded-xl bg-surface-elevated border border-border p-3">
              <p className="text-lg font-bold text-text-primary font-display">{stat.value}</p>
              <p className="text-[10px] text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </CitizenLayout>
  )
}

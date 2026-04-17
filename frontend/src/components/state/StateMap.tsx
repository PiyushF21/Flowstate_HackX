import MapView from '../shared/MapView'

interface MCRegion {
  id: string
  name: string
  lat: number
  lng: number
  performanceScore: number
}

interface StateMapProps {
  regions: MCRegion[]
}

export default function StateMap({ regions }: StateMapProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22C55E' // Green
    if (score >= 60) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }

  const markers = regions.map(r => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    color: getScoreColor(r.performanceScore),
    label: r.name,
  }))

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-border relative h-[400px]">
      <MapView center={[19.7515, 75.7139]} zoom={6} markers={markers} height="100%" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-md border border-border rounded-lg p-3 text-[10px] space-y-1.5 shadow-lg">
        <p className="font-semibold text-text-primary mb-2">Performance SLA <span className="text-agent-guardian">GUARDIAN</span></p>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> &ge; 80% (On Track)</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> 60-79% (Watch)</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> &lt; 60% (Critical)</div>
      </div>
    </div>
  )
}

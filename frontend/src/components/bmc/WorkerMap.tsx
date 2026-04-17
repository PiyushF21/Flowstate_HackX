import MapView from '../shared/MapView'

interface WorkerMapProps {
  workers: Array<{ id: string; name: string; lat: number; lng: number; status: string; task?: string }>
}

export default function WorkerMap({ workers }: WorkerMapProps) {
  const getWorkerColor = (status: string) => {
    switch (status) {
      case 'on_task': return '#3B82F6' // Agent Commander primary color roughly
      case 'available': return '#22C55E' // Green
      case 'off_duty': return '#6B7280' // Gray
      default: return '#6B7280'
    }
  }

  const markers = workers.map(w => ({
    id: w.id,
    lat: w.lat,
    lng: w.lng,
    color: getWorkerColor(w.status),
    label: w.name,
  }))

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-border relative">
      <MapView center={[19.076, 72.8777]} zoom={11} markers={markers} height="100%" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-md border border-border rounded-lg p-3 text-[10px] space-y-1.5 shadow-lg">
        <p className="font-semibold text-text-primary mb-2">Worker Status</p>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> On Task</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Available</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-gray-500" /> Off Duty</div>
      </div>
    </div>
  )
}

import MapView from './components/shared/MapView'

const demoMarkers = [
  { id: '1', lat: 19.1196, lng: 72.8467, color: '#EF4444', label: 'Pothole — WEH KM 14.2' },
  { id: '2', lat: 19.0760, lng: 72.8777, color: '#F97316', label: 'Fallen divider — SV Road' },
  { id: '3', lat: 19.1334, lng: 72.9133, color: '#22C55E', label: 'Water pipe — Powai (Resolved)' },
  { id: '4', lat: 19.0550, lng: 72.8296, color: '#EAB308', label: 'Street light — Bandra' },
]

function App() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center gap-8">
      {/* Header */}
      <div className="glass-card text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold font-display text-text-primary mb-2">
          🔍 InfraLens
        </h1>
        <p className="text-text-secondary text-sm">
          AI-Powered Civic Infrastructure Intelligence Platform
        </p>
        <div className="mt-4 flex gap-3 justify-center flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-critical/10 text-critical border border-critical/20">
            CRITICAL
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-high/10 text-high border border-high/20">
            HIGH
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-medium/10 text-medium border border-medium/20">
            MEDIUM
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-low/10 text-low border border-low/20">
            LOW
          </span>
        </div>
      </div>

      {/* Map Demo */}
      <div className="w-full max-w-3xl">
        <h2 className="text-lg font-semibold text-text-primary mb-3 font-display">
          📍 Mumbai Infrastructure Map
        </h2>
        <MapView
          center={[19.076, 72.8777]}
          zoom={11.5}
          markers={demoMarkers}
          height="400px"
        />
      </div>

      {/* Status */}
      <p className="text-text-muted text-xs">
        Phase 1 Scaffold — All systems operational ✅
      </p>
    </div>
  )
}

export default App

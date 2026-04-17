import { useRef, useCallback, useState } from 'react'
import Map, { Marker, Popup, NavigationControl, type MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

// CARTO light basemap — no API key needed
const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
const DARK_STYLE  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

export interface MapMarker {
  id: string
  lat: number
  lng: number
  color?: string
  label?: string
  severity?: string
  status?: string
  category?: string
  address?: string
  onClick?: () => void
}

interface MapViewProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  onMapClick?: (lat: number, lng: number) => void
  className?: string
  height?: string
  showControls?: boolean
  theme?: 'light' | 'dark'
  /** Show popup on marker hover/click inline (instead of delegating to parent) */
  showPopups?: boolean
}

export default function MapView({
  center = [19.076, 72.8777],
  zoom = 12,
  markers = [],
  onMapClick,
  className = '',
  height = '400px',
  showControls = true,
  theme = 'dark',
  showPopups = false,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null)
  const [popupMarker, setPopupMarker] = useState<MapMarker | null>(null)

  const handleClick = useCallback(
    (event: maplibregl.MapMouseEvent) => {
      if (onMapClick) {
        onMapClick(event.lngLat.lat, event.lngLat.lng)
      }
    },
    [onMapClick]
  )

  const severityColor = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL': return '#EF4444'
      case 'HIGH': return '#F97316'
      case 'MEDIUM': return '#EAB308'
      case 'LOW': return '#22C55E'
      default: return '#6366F1'
    }
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-[var(--border)] ${className}`} style={{ height }}>
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: center[0],
          longitude: center[1],
          zoom: zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={theme === 'light' ? LIGHT_STYLE : DARK_STYLE}
        onClick={handleClick}
      >
        {showControls && (
          <NavigationControl position="top-right" />
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.lat}
            longitude={marker.lng}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              if (marker.onClick) {
                marker.onClick()
              }
              if (showPopups) {
                setPopupMarker(marker)
              }
            }}
          >
            <div
              className="w-5 h-5 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-150 relative"
              style={{ backgroundColor: marker.color || severityColor(marker.severity) }}
              title={marker.label}
            >
              {/* Pulse ring for critical/high */}
              {(marker.severity === 'CRITICAL' || marker.severity === 'HIGH') && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-40"
                  style={{ backgroundColor: marker.color || severityColor(marker.severity) }}
                />
              )}
            </div>
          </Marker>
        ))}

        {showPopups && popupMarker && (
          <Popup
            latitude={popupMarker.lat}
            longitude={popupMarker.lng}
            anchor="bottom"
            onClose={() => setPopupMarker(null)}
            closeOnClick={false}
            className="issue-popup"
            maxWidth="260px"
          >
            <div className="p-1 text-xs" style={{ minWidth: 180 }}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: severityColor(popupMarker.severity) }}
                />
                <span className="font-bold text-gray-800 text-[11px]">{popupMarker.severity || 'MEDIUM'}</span>
                <span className="ml-auto text-gray-500 text-[10px] capitalize">{popupMarker.status}</span>
              </div>
              <p className="text-gray-800 font-medium text-[11px] leading-snug mb-1">
                {popupMarker.label ? popupMarker.label.split('.')[0] : 'Infrastructure Issue'}
              </p>
              {popupMarker.address && (
                <p className="text-gray-500 text-[10px]">📍 {popupMarker.address}</p>
              )}
              {popupMarker.category && (
                <p className="text-gray-500 text-[10px] capitalize mt-0.5">🏷️ {popupMarker.category.replace('_', ' ')}</p>
              )}
              {popupMarker.onClick && (
                <button
                  onClick={popupMarker.onClick}
                  className="mt-1.5 w-full text-center text-[10px] font-semibold text-blue-600 hover:text-blue-800 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  View Details →
                </button>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}

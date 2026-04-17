import { useRef, useCallback } from 'react'
import Map, { Marker, NavigationControl, type MapRef, type ViewStateChangeEvent } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

// Free CARTO dark basemap tiles — no API key needed
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

export interface MapMarker {
  id: string
  lat: number
  lng: number
  color?: string
  label?: string
  onClick?: () => void
}

interface MapViewProps {
  /** Center coordinates [latitude, longitude] */
  center?: [number, number]
  /** Zoom level (0-22) */
  zoom?: number
  /** Array of markers to display */
  markers?: MapMarker[]
  /** Map click handler */
  onMapClick?: (lat: number, lng: number) => void
  /** Custom CSS class */
  className?: string
  /** Map height */
  height?: string
  /** Whether to show navigation controls */
  showControls?: boolean
}

export default function MapView({
  center = [19.076, 72.8777], // Default: Mumbai
  zoom = 12,
  markers = [],
  onMapClick,
  className = '',
  height = '400px',
  showControls = true,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null)

  const handleClick = useCallback(
    (event: maplibregl.MapMouseEvent) => {
      if (onMapClick) {
        onMapClick(event.lngLat.lat, event.lngLat.lng)
      }
    },
    [onMapClick]
  )

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
        mapStyle={MAP_STYLE}
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
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              marker.onClick?.()
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-125"
              style={{ backgroundColor: marker.color || 'var(--primary)' }}
              title={marker.label}
            />
          </Marker>
        ))}
      </Map>
    </div>
  )
}

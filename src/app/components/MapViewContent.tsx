'use client'

import {
  MapContainer,
  TileLayer,
  Popup,
  useMap,
  CircleMarker,
} from 'react-leaflet'
import type { MapOptions } from 'leaflet'
import type { Incident } from '../store/incidentStore'
import { Button } from '@/components/ui/button'
import { Locate } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import 'leaflet/dist/leaflet.css'
import { formatDate } from '@/app/utils'
import { incidentStore } from '../store/incidentStore'
import type { LeafletEvent, LocationEvent } from 'leaflet'

declare global {
  interface Window {
    filteredAttacks?: Incident[]
  }
}

// Extend Element type to include Leaflet's internal property
declare global {
  interface Element {
    _leaflet_map?: LeafletMap
  }
}

interface LeafletMap {
  locate: (options: { setView: boolean; maxZoom: number }) => LeafletMap
  on: (
    event: 'locationerror' | 'locationfound',
    callback: (e: LeafletEvent | LocationEvent) => void
  ) => LeafletMap
  setView: (latlng: [number, number], zoom: number) => void
}

// Component to handle map updates
function MapController({
  selectedId,
  incidents,
}: {
  selectedId: string | null
  incidents: Incident[]
}) {
  const map = useMap()

  useEffect(() => {
    if (!selectedId) return

    const incident = incidents.find((a) => a.id === selectedId)
    if (!incident?.coordinates) return

    const [lat, lng] = incident.coordinates.split(',').map(Number)
    map.setView([lat, lng], 16)
  }, [selectedId, incidents, map])

  return null
}

interface MapViewContentProps {
  mapOptions: MapOptions
  filteredAttacks: Incident[]
}

export function MapViewContent({
  mapOptions,
  filteredAttacks,
}: MapViewContentProps) {
  const { selectedIncidentId, setSelectedIncidentId } = incidentStore()

  // Group incidents by coordinates to handle overlapping markers
  const markerGroups = useMemo(() => {
    const groups = new Map<string, Incident[]>()
    filteredAttacks.forEach((attack) => {
      if (!attack.coordinates) return
      const key = attack.coordinates
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(attack)
    })
    return groups
  }, [filteredAttacks])

  // Store filteredAttacks in window for LocationControl to access
  if (typeof window !== 'undefined') {
    window.filteredAttacks = filteredAttacks
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        {...mapOptions}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {Array.from(markerGroups.entries()).map(([coords, incidents]) => {
          const [lat, lng] = coords.split(',').map(Number)
          const totalIncidents = incidents.length
          const radius = 0.0001 // Much smaller radius for marker offset

          return incidents.map((incident, index) => {
            // Calculate offset angle and position for multiple markers
            const angle = (index * 2 * Math.PI) / totalIncidents
            const offsetX = totalIncidents > 1 ? Math.cos(angle) * radius : 0
            const offsetY = totalIncidents > 1 ? Math.sin(angle) * radius : 0

            return (
              <CircleMarker
                key={incident.id}
                center={[lat + offsetY, lng + offsetX]}
                radius={8}
                pathOptions={{
                  fillColor:
                    selectedIncidentId === incident.id ? 'blue' : 'red',
                  fillOpacity: 1,
                  color: 'white',
                  weight: 1,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedIncidentId(incident.id)
                  },
                }}
              ></CircleMarker>
            )
          })
        })}
        <MapController
          selectedId={selectedIncidentId}
          incidents={filteredAttacks}
        />
        <LocationControl />
      </MapContainer>
    </div>
  )
}

function LocationControl() {
  const map = useMap()

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 })

    map.on('locationerror', () => {
      console.error('Location access denied')
    })

    map.on('locationfound', (e: LocationEvent) => {
      map.setView([e.latlng.lat, e.latlng.lng], 16)
    })
  }

  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar">
        <Button
          variant="outline"
          size="icon"
          className="bg-background"
          onClick={handleLocate}
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

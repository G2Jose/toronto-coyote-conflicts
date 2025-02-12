'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import type { MapOptions } from 'leaflet'
import type { Incident } from '../store/attackStore'
import { Button } from '@/components/ui/button'
import { Locate } from 'lucide-react'
import { Drawer } from 'vaul'
import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { formatDate } from '@/app/utils'
import { useAttackStore } from '../store/attackStore'

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
    callback: (e: LocationEvent) => void
  ) => LeafletMap
  setView: (latlng: [number, number], zoom: number) => void
}

interface LocationEvent {
  latlng: [number, number]
}

function IncidentDetails({ incident }: { incident: Incident }) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">{incident.location}</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Incident Details</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <p>Date: {formatDate(incident.date)}</p>
            <p>Time: {incident.time}</p>
            <p>Dog Breed: {incident.dogBreed}</p>
            <p>Dog Weight: {incident.dogWeightLb} lbs</p>
            <p>Was Leashed: {incident.wasLeashed}</p>
            <p>Coyotes Involved: {incident.numCoyotes}</p>
          </div>
        </div>
        {incident.notes && (
          <div>
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="whitespace-pre-line">{incident.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
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
  const { selectedIncidentId, setSelectedIncidentId } = useAttackStore()

  // Store map reference when mounted
  const handleMapMount = (map: LeafletMap) => {
    // Implementation of handleMapMount
  }

  // Store filteredAttacks in window for LocationControl to access
  if (typeof window !== 'undefined') {
    window.filteredAttacks = filteredAttacks
  }

  return (
    <>
      <div className="relative h-full">
        <MapContainer
          {...mapOptions}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <MapController
            selectedId={selectedIncidentId}
            incidents={filteredAttacks}
          />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {filteredAttacks.map((attack) => {
            if (!attack.coordinates) return null
            const [lat, lng] = attack.coordinates.split(',').map(Number)
            const isSelected = attack.id === selectedIncidentId

            return (
              <Marker
                key={attack.id}
                position={[lat, lng]}
                eventHandlers={{
                  click: () => {
                    setSelectedIncidentId(attack.id)
                  },
                }}
                opacity={isSelected ? 1 : 0.6}
              >
                <Popup>
                  <div className="text-sm text-center">
                    <p className="font-medium">{formatDate(attack.date)}</p>
                    <p>{attack.time}</p>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
        <div className="absolute bottom-4 right-4 z-[400]">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => {
              const map =
                document.querySelector('.leaflet-container')?._leaflet_map
              if (map) {
                map
                  .locate({
                    setView: true,
                    maxZoom: 13,
                  })
                  .on('locationerror', () => {
                    // If location not found, center on first incident
                    if (filteredAttacks.length > 0) {
                      if (!filteredAttacks[0].coordinates) return
                      const [lat, lng] = filteredAttacks[0].coordinates
                        .split(',')
                        .map(Number)
                      map.setView([lat, lng], 13)
                    }
                  })
                  .on('locationfound', (e: LocationEvent) => {
                    map.setView(e.latlng, 13)
                  })
              }
            }}
            className="h-10 w-10 rounded-full shadow-lg hover:bg-accent"
          >
            <Locate className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

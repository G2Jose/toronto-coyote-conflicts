'use client'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { MapOptions, LocationEvent } from 'leaflet'
import type { Incident } from '../store/attackStore'
import { Button } from '@/components/ui/button'
import { Locate } from 'lucide-react'
import { Drawer } from 'vaul'
import dayjs from 'dayjs'
import { useState } from 'react'
import 'leaflet/dist/leaflet.css'

declare global {
  interface Window {
    filteredAttacks?: Incident[]
  }
}

function IncidentDetails({ incident }: { incident: Incident }) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">{incident.location}</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Incident Details</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <p>Date: {dayjs(incident.date).format('MMM DD YYYY')}</p>
            <p>Time: {incident.time}</p>
            <p>Dog Breed: {incident.dogBreed}</p>
            <p>Dog Weight: {incident.dogWeightLb} lbs</p>
            <p>Was Leashed: {incident.wasLeashed ? 'Yes' : 'No'}</p>
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

function LocationControl() {
  const map = useMap()

  const handleLocate = () => {
    map
      .locate({
        setView: true,
        maxZoom: 13,
      })
      .on('locationerror', () => {
        // If location not found, center on first incident
        const attacks = window.filteredAttacks || []
        if (attacks.length > 0) {
          const firstIncident = attacks[0]
          map.setView([firstIncident.lat, firstIncident.lng], 13)
        }
      })
  }

  useMapEvents({
    locationfound(e: LocationEvent) {
      map.setView(e.latlng, 13)
    },
  })

  return (
    <div className="leaflet-bottom leaflet-right p-4">
      <Button
        variant="secondary"
        size="icon"
        onClick={handleLocate}
        className="h-10 w-10 rounded-full shadow-lg"
      >
        <Locate className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface MapViewContentProps {
  mapOptions: MapOptions
  isDark: boolean
  filteredAttacks: Incident[]
}

export function MapViewContent({
  mapOptions,
  isDark,
  filteredAttacks,
}: MapViewContentProps) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  )

  // Store filteredAttacks in window for LocationControl to access
  if (typeof window !== 'undefined') {
    window.filteredAttacks = filteredAttacks
  }

  return (
    <>
      <div className="relative h-full">
        <MapContainer {...mapOptions} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url={
              isDark
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
            }
          />
          {filteredAttacks.map((attack) => (
            <Marker
              key={attack.id}
              position={[attack.lat, attack.lng]}
              eventHandlers={{
                click: () => setSelectedIncident(attack),
              }}
            >
              <Popup>
                <div className="text-sm text-center">
                  <p className="font-medium">
                    {dayjs(attack.date).format('MMM DD YYYY')}
                  </p>
                  <p>{attack.time}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          <LocationControl />
        </MapContainer>
      </div>

      <Drawer.Root
        open={selectedIncident !== null}
        onOpenChange={(open) => !open && setSelectedIncident(null)}
      >
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 bg-black/40"
            style={{ zIndex: 1000 }}
          />
          <Drawer.Content
            className="fixed bottom-0 right-0 mt-24 flex h-[96%] w-96 flex-col rounded-l-lg border bg-background md:h-full"
            style={{ zIndex: 1000 }}
          >
            <div className="flex-1 overflow-auto">
              <Drawer.Title className="sr-only">
                {selectedIncident
                  ? `Incident at ${selectedIncident.location}`
                  : 'Incident Details'}
              </Drawer.Title>
              {selectedIncident && (
                <IncidentDetails incident={selectedIncident} />
              )}
            </div>
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedIncident(null)}
              >
                Close
              </Button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}

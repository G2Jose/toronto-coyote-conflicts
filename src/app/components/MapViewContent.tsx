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
import 'leaflet/dist/leaflet.css'

declare global {
  interface Window {
    filteredAttacks?: Incident[]
  }
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
  // Store filteredAttacks in window for LocationControl to access
  if (typeof window !== 'undefined') {
    window.filteredAttacks = filteredAttacks
  }

  return (
    <MapContainer {...mapOptions} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url={
          isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        }
      />
      {filteredAttacks.map((attack) => (
        <Marker key={attack.id} position={[attack.lat, attack.lng]}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">Coyote Attack</h3>
              <p>{attack.location}</p>
              <p>Date: {attack.date}</p>
              <p>Dog Breed: {attack.dogBreed}</p>
              <p>Coyotes Involved: {attack.numCoyotes}</p>
            </div>
          </Popup>
        </Marker>
      ))}
      <LocationControl />
    </MapContainer>
  )
} 
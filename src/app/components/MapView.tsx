'use client'

import { useState, useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { type MapOptions, type LocationEvent } from 'leaflet'
import { useAttackStore } from '../store/attackStore'
import { Button } from '@/components/ui/button'
import { Locate } from 'lucide-react'
import { useTheme } from 'next-themes'
import 'leaflet/dist/leaflet.css'

function LocationControl() {
  const map = useMap()
  const { filteredAttacks } = useAttackStore()

  const handleLocate = () => {
    map.locate({
      setView: true,
      maxZoom: 13,
    }).on('locationerror', () => {
      // If location not found, center on first incident
      if (filteredAttacks.length > 0) {
        const firstIncident = filteredAttacks[0]
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

export function MapView() {
  const { filteredAttacks } = useAttackStore()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'

  const mapOptions: MapOptions = {
    center: [43.6532, -79.3832],
    zoom: 13
  }

  return (
    <div className="h-[calc(100vh-120px)] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        {...mapOptions}
        style={{ height: '100%', width: '100%' }}
      >
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
    </div>
  )
}

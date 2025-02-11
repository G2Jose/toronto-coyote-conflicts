'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { Incident } from '../store/attackStore'
import { useTheme } from 'next-themes'
import 'leaflet/dist/leaflet.css'
import type { MapOptions } from 'leaflet'

interface LocationCellProps {
  location: string
  lat: number
  lng: number
  incident: Incident
}

export function LocationCell({
  location,
  lat,
  lng,
  incident,
}: LocationCellProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-64 w-full bg-muted" />
  }

  const isDark = theme === 'dark'

  const mapOptions: MapOptions = {
    center: [lat, lng],
    zoom: 13,
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false
  }

  return (
    <div className="h-64 w-full overflow-hidden rounded">
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
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{location}</p>
              <p>Date: {incident.date}</p>
              <p>Time: {incident.time}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

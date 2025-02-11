'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { Incident } from '../store/attackStore'
import type { MapOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  mapOptions: MapOptions
  style: { height: string; width: string }
  isDark: boolean
  lat: number
  lng: number
  location: string
  incident: Incident
}

export function Map({
  mapOptions,
  style,
  isDark,
  lat,
  lng,
  location,
  incident,
}: MapProps) {
  return (
    <MapContainer {...mapOptions} style={style}>
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
  )
} 
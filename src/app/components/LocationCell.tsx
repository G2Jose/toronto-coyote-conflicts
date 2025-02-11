'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Incident } from '../store/attackStore'
import { useTheme } from 'next-themes'
import type { MapOptions } from 'leaflet'

const Map = dynamic(
  () =>
    import('./Map').then((mod) => mod.Map),
  { ssr: false }
)

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
    doubleClickZoom: false,
  }

  return (
    <div className="h-64 w-full overflow-hidden rounded">
      <Map
        mapOptions={mapOptions}
        style={{ height: '100%', width: '100%' }}
        isDark={isDark}
        lat={lat}
        lng={lng}
        location={location}
        incident={incident}
      />
    </div>
  )
}

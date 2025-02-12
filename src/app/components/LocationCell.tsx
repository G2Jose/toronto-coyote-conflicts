'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Incident } from '../store/attackStore'
import type { MapOptions } from 'leaflet'

const Map = dynamic(() => import('./Map').then((mod) => mod.Map), {
  ssr: false,
})

interface LocationCellProps {
  coordinates: string
  incident: Incident
}

export function LocationCell({ coordinates, incident }: LocationCellProps) {
  const [mounted, setMounted] = useState(false)
  const [lat, lng] = coordinates.split(',').map(Number)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-64 w-full bg-muted" />
  }

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
        coordinates={coordinates}
        incident={incident}
      />
    </div>
  )
}

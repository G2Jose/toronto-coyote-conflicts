'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { MapOptions } from 'leaflet'
import { useAttackStore } from '../store/attackStore'
import { useTheme } from 'next-themes'

const MapWithNoSSR = dynamic(
  () => import('./MapViewContent').then((mod) => mod.MapViewContent),
  { ssr: false }
)

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
    zoom: 13,
  }

  return (
    <div className="h-[calc(100vh-120px)] w-full rounded-lg overflow-hidden shadow-lg">
      <MapWithNoSSR
        mapOptions={mapOptions}
        isDark={isDark}
        filteredAttacks={filteredAttacks}
      />
    </div>
  )
}

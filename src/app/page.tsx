'use client'

import { useState, useEffect } from 'react'
import { MapView } from './components/MapView'
import { DataTable } from './components/DataTable'
import { Toggle } from '@/components/ui/toggle'
import { Map, TableProperties } from 'lucide-react'
import { useAttackStore, fetchAttacks } from './store/attackStore'

export default function Home() {
  const [showMap, setShowMap] = useState(true)
  const { setAttacks, setFilteredAttacks } = useAttackStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const loadAttacks = async () => {
      const attacks = await fetchAttacks()
      setAttacks(attacks)
      setFilteredAttacks(attacks)
    }
    loadAttacks()
    setMounted(true)
  }, [setAttacks, setFilteredAttacks])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            Toronto Coyote Incidents
          </h1>
          <Toggle
            aria-label="Toggle view"
            pressed={showMap}
            onPressedChange={setShowMap}
          >
            {showMap ? (
              <TableProperties className="h-4 w-4" />
            ) : (
              <Map className="h-4 w-4" />
            )}
          </Toggle>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showMap ? <MapView /> : <DataTable />}
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { MapView } from './components/MapView'
import { IncidentList } from './components/IncidentList'
import { useAttackStore, fetchAttacks } from './store/attackStore'
import { cn } from '@/lib/utils'

export default function Home() {
  const {
    setAttacks,
    setFilteredAttacks,
    selectedIncidentId,
    setSelectedIncidentId,
  } = useAttackStore()
  const [mounted, setMounted] = useState(false)
  const [isListExpanded, setIsListExpanded] = useState(false)

  useEffect(() => {
    const loadAttacks = async () => {
      const attacks = await fetchAttacks()
      setAttacks(attacks)
      setFilteredAttacks(attacks)
    }
    loadAttacks()
    setMounted(true)
  }, [setAttacks, setFilteredAttacks])

  // Collapse list when an incident is selected
  useEffect(() => {
    if (selectedIncidentId) {
      setIsListExpanded(false)
    }
  }, [selectedIncidentId])

  const getTranslateY = () => {
    if (isListExpanded) return 'translate-y-0'
    if (selectedIncidentId && !isListExpanded) return 'translate-y-[75%]'
    return 'translate-y-[65%]'
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-md">
        <div className="max-w-[2000px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">
            Toronto Coyote Incidents
          </h1>
        </div>
      </header>
      <main className="max-w-[2000px] mx-auto h-[calc(100vh-88px)]">
        {/* Mobile Layout (map with expanding list) */}
        <div className="block lg:hidden h-full relative">
          <div className="h-full">
            <MapView />
          </div>
          <div
            className={cn(
              'fixed inset-x-0 bottom-0 bg-background transition-all duration-300 ease-in-out',
              'h-[85vh] overflow-hidden',
              getTranslateY()
            )}
            style={{ zIndex: 40 }}
          >
            <div className="sticky top-0 inset-x-0 bg-background pt-2 pb-1 rounded-t-xl border-t">
              <div
                className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto cursor-grab active:cursor-grabbing"
                onPointerDown={() => {
                  setIsListExpanded(!isListExpanded)
                  if (selectedIncidentId && !isListExpanded) {
                    setSelectedIncidentId(null)
                  }
                }}
              />
            </div>
            <div
              className="h-[calc(100%-24px)] overflow-y-auto px-1"
              onScroll={(e) => {
                const target = e.currentTarget
                if (target.scrollTop === 0) {
                  setIsListExpanded(false)
                }
                if (target.scrollTop > 20) {
                  setIsListExpanded(true)
                  if (selectedIncidentId) {
                    setSelectedIncidentId(null)
                  }
                }
              }}
            >
              <IncidentList />
            </div>
          </div>
        </div>

        {/* Desktop Layout (side by side) */}
        <div className="hidden lg:grid lg:grid-cols-2 h-full">
          <div className="overflow-y-auto border-r">
            <IncidentList />
          </div>
          <div className="h-full">
            <MapView />
          </div>
        </div>
      </main>
    </div>
  )
}

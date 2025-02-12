'use client'

import { useState, useEffect } from 'react'
import { MapView } from './components/MapView'
import { IncidentList } from './components/IncidentList'
import { useAttackStore, fetchAttacks } from './store/attackStore'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Home() {
  const {
    setAttacks,
    setFilteredAttacks,
    selectedIncidentId,
    setSelectedIncidentId,
  } = useAttackStore()
  const [mounted, setMounted] = useState(false)
  const [isListExpanded, setIsListExpanded] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Load incidents and handle initial URL params
  useEffect(() => {
    const loadAttacks = async () => {
      const attacks = await fetchAttacks()
      setAttacks(attacks)
      setFilteredAttacks(attacks)

      // Check for incident ID in URL
      const incidentId = searchParams.get('incident')
      if (incidentId && attacks.some((a) => a.id === incidentId)) {
        setSelectedIncidentId(incidentId)
        setIsListExpanded(true)
      }
    }
    loadAttacks()
    setMounted(true)
  }, [setAttacks, setFilteredAttacks, searchParams, setSelectedIncidentId])

  // Update URL when selected incident changes
  useEffect(() => {
    if (!mounted) return

    const url = new URL(window.location.href)
    if (selectedIncidentId) {
      url.searchParams.set('incident', selectedIncidentId)
    } else {
      url.searchParams.delete('incident')
    }
    router.replace(url.pathname + url.search)
  }, [selectedIncidentId, mounted, router])

  // Expand list and scroll to incident when selected from map or URL
  useEffect(() => {
    if (selectedIncidentId) {
      setIsListExpanded(true)
    }
  }, [selectedIncidentId])

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
          <div
            className={cn(
              'absolute inset-x-0 top-0 w-full transition-[height] duration-300',
              isListExpanded ? 'h-[45vh]' : 'h-full'
            )}
          >
            <MapView />
          </div>
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 bg-background transition-[height] duration-300',
              isListExpanded ? 'h-[60vh]' : 'h-[35vh]'
            )}
          >
            <div className="sticky top-0 bg-background pt-2 pb-1 rounded-t-xl border-t">
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    setIsListExpanded(!isListExpanded)
                    if (selectedIncidentId && !isListExpanded) {
                      setSelectedIncidentId(null)
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-accent"
                >
                  {isListExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-40px)] overflow-y-auto incident-list-container px-1">
              <IncidentList />
            </div>
          </div>
        </div>

        {/* Desktop Layout (side by side) */}
        <div className="hidden lg:grid lg:grid-cols-2 h-full">
          <div className="overflow-y-auto incident-list-container border-r">
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

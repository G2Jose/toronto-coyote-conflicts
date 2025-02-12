'use client'

import { useState, useEffect } from 'react'
import { MapView } from './components/MapView'
import { IncidentList } from './components/IncidentList'
import { incidentStore, fetchAttacks } from './store/incidentStore'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Home() {
  const {
    setIncidents: setAttacks,
    selectedIncidentId,
    setSelectedIncidentId,
  } = incidentStore()
  const [mounted, setMounted] = useState(false)
  const [isListExpanded, setIsListExpanded] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Load incidents and handle initial URL params
  useEffect(() => {
    const loadAttacks = async () => {
      const attacks = await fetchAttacks()
      setAttacks(attacks)

      // Check for incident ID in URL
      const incidentId = searchParams.get('incident')
      if (incidentId && attacks.some((a) => a.id === incidentId)) {
        setSelectedIncidentId(incidentId)
        setIsListExpanded(true)
      }
    }
    loadAttacks()
    setMounted(true)
  }, [setAttacks, searchParams, setSelectedIncidentId])

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
      // Add a small delay to ensure the list is expanded before scrolling
      setTimeout(() => {
        const container = document.querySelector('.overflow-y-auto')
        const element = document.getElementById(
          `incident-${selectedIncidentId}`
        )
        if (element && container instanceof HTMLElement) {
          // Set flag for programmatic scroll
          container.dataset.programmaticScroll = 'true'
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
    }
  }, [selectedIncidentId])

  const getTranslateY = () => {
    if (isListExpanded) return 'translate-y-0'
    if (selectedIncidentId && !isListExpanded) return 'translate-y-[60%]'
    return 'translate-y-[45%]'
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
              selectedIncidentId ? 'h-[70vh]' : 'h-[85vh]',
              'overflow-hidden',
              getTranslateY()
            )}
            style={{ zIndex: 1001 }}
          >
            <div className="sticky top-0 inset-x-0 bg-background pt-2 pb-1 rounded-t-xl border-t">
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
            <div
              className="h-[calc(100%-24px)] overflow-y-auto px-1"
              onScroll={(e) => {
                const target = e.currentTarget
                // Only handle scroll events for user-initiated scrolls
                if (!target.dataset.programmaticScroll) {
                  if (target.scrollTop === 0) {
                    setIsListExpanded(false)
                  }
                  if (target.scrollTop > 20) {
                    setIsListExpanded(true)
                  }
                }
                // Clear the flag after handling the event
                delete target.dataset.programmaticScroll
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

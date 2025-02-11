'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { Incident } from '../store/attackStore'
import type { MapOptions } from 'leaflet'
import { Drawer } from 'vaul'
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'
import { useState } from 'react'
import 'leaflet/dist/leaflet.css'

function IncidentDetails({ incident }: { incident: Incident }) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">{incident.location}</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Incident Details</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <p>Date: {dayjs(incident.date).format('MMM DD YYYY')}</p>
            <p>Time: {incident.time}</p>
            <p>Dog Breed: {incident.dogBreed}</p>
            <p>Dog Weight: {incident.dogWeightLb} lbs</p>
            <p>Was Leashed: {incident.wasLeashed ? 'Yes' : 'No'}</p>
            <p>Coyotes Involved: {incident.numCoyotes}</p>
          </div>
        </div>
        {incident.notes && (
          <div>
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="whitespace-pre-line">{incident.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface MapProps {
  mapOptions: MapOptions
  style: { height: string; width: string }
  isDark: boolean
  lat: number
  lng: number
  incident: Incident
  location: string
}

export function Map({
  mapOptions,
  style,
  isDark,
  lat,
  lng,
  incident,
}: MapProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  return (
    <>
      <div className="relative h-full">
        <MapContainer {...mapOptions} style={style}>
          <TileLayer
            url={
              isDark
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
            }
          />
          <Marker
            position={[lat, lng]}
            eventHandlers={{
              click: () => setIsDetailsOpen(true),
            }}
          >
            <Popup>
              <div className="text-sm text-center">
                <p className="font-medium">
                  {dayjs(incident.date).format('MMM DD')}
                </p>
                <p>{incident.time}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <Drawer.Root
        open={isDetailsOpen}
        onOpenChange={(open) => setIsDetailsOpen(open)}
      >
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 bg-black/40"
            style={{ zIndex: 1000 }}
          />
          <Drawer.Content
            className="fixed bottom-0 right-0 mt-24 flex h-[96%] w-96 flex-col rounded-l-lg border bg-background md:h-full"
            style={{ zIndex: 1000 }}
          >
            <div className="flex-1 overflow-auto">
              <Drawer.Title className="sr-only">
                Incident at {incident.location}
              </Drawer.Title>
              <IncidentDetails incident={incident} />
            </div>
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsDetailsOpen(false)}
              >
                Close
              </Button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}

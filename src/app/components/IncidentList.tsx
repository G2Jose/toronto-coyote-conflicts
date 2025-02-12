'use client'

import { incidentStore, getFilteredIncidents } from '../store/incidentStore'
import { formatDate } from '@/app/utils'
import { Input } from '@/components/ui/input'
import { useState, useMemo } from 'react'
import type { Incident, SortField } from '../store/incidentStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

function FilterBar() {
  const {
    incidents: attacks,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    filters,
    setFilters,
  } = incidentStore()

  const uniqueDogBreeds = useMemo(() => {
    const breeds = new Set(attacks.map((i) => i.dogBreed).filter(Boolean))
    return Array.from(breeds).sort()
  }, [attacks])

  const sortOptions = {
    'date-desc': 'Most Recent',
    'date-asc': 'Oldest First',
    'dogBreed-asc': 'Dog Breed (A-Z)',
    'dogBreed-desc': 'Dog Breed (Z-A)',
    'numCoyotes-desc': 'Most Coyotes',
    'numCoyotes-asc': 'Least Coyotes',
  } as const

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <Select
        value={`${sortField}-${sortOrder}`}
        onValueChange={(value: string) => {
          const [field, order] = value.split('-') as [SortField, 'asc' | 'desc']
          setSortField(field)
          setSortOrder(order)
        }}
      >
        <SelectTrigger className="min-w-[160px] flex-1">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent position="popper">
          {Object.entries(sortOptions).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.wasLeashed || 'all'}
        onValueChange={(value: string) =>
          setFilters({
            ...filters,
            wasLeashed: value === 'all' ? undefined : value,
          })
        }
      >
        <SelectTrigger className="min-w-[140px] flex-1">
          <SelectValue placeholder="Leash status..." />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">Leashed & Unleashed</SelectItem>
          <SelectItem value="Yes">Leashed Only</SelectItem>
          <SelectItem value="No">Unleashed Only</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.dogBreed || 'all'}
        onValueChange={(value: string) =>
          setFilters({
            ...filters,
            dogBreed: value === 'all' ? undefined : value,
          })
        }
      >
        <SelectTrigger className="min-w-[160px] flex-1">
          <SelectValue placeholder="Dog breed..." />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">All Breeds</SelectItem>
          {uniqueDogBreeds.map((breed) => (
            <SelectItem key={breed} value={breed}>
              {breed}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.dogInjured || 'all'}
        onValueChange={(value: string) =>
          setFilters({
            ...filters,
            dogInjured: value === 'all' ? undefined : value,
          })
        }
      >
        <SelectTrigger className="min-w-[160px] flex-1">
          <SelectValue placeholder="Dog injured..." />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">All Incidents</SelectItem>
          <SelectItem value="Yes">Dog Injured</SelectItem>
          <SelectItem value="No">Dog Not Injured</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function IncidentCard({ incident }: { incident: Incident }) {
  const { selectedIncidentId, setSelectedIncidentId } = incidentStore()
  const isSelected = selectedIncidentId === incident.id

  return (
    <div
      id={`incident-${incident.id}`}
      className={cn(
        'border rounded-lg p-3 lg:p-4 transition-all cursor-pointer',
        'hover:border-primary/50 hover:bg-muted/50',
        isSelected && [
          'border-2 border-white bg-muted',
          'shadow-[0_0_0_1px] shadow-primary',
        ]
      )}
      onClick={() => setSelectedIncidentId(isSelected ? null : incident.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          {incident.location && (
            <h3 className="font-semibold text-sm lg:text-base">
              {incident.location}
            </h3>
          )}
          {(incident.date || incident.time) && (
            <p className="text-xs lg:text-sm text-muted-foreground">
              {incident.date && formatDate(incident.date)}
              {incident.date && incident.time && ' at '}
              {incident.time}
            </p>
          )}
        </div>
      </div>
      <div
        className={`grid gap-1 lg:gap-2 text-xs lg:text-sm mb-2 lg:mb-3 ${
          isSelected ? 'grid-cols-1' : 'grid-cols-2'
        }`}
      >
        {incident.dogBreed && (
          <div>
            <span className="text-muted-foreground">Dog Breed:</span>{' '}
            {incident.dogBreed}
          </div>
        )}
        {incident.dogWeightLb && (
          <div>
            <span className="text-muted-foreground">Weight:</span>{' '}
            {incident.dogWeightLb}lbs
          </div>
        )}
        {incident.wasLeashed && (
          <div>
            <span className="text-muted-foreground">Leashed:</span>{' '}
            {incident.wasLeashed}
          </div>
        )}
        {incident.numCoyotes && (
          <div>
            <span className="text-muted-foreground">Coyotes:</span>{' '}
            {incident.numCoyotes}
          </div>
        )}
        {incident.dogInjured && (
          <div>
            <span className="text-muted-foreground">Dog Injured:</span>{' '}
            {incident.dogInjured}
          </div>
        )}
      </div>
      {incident.notes && (
        <div
          className={`text-xs lg:text-sm text-muted-foreground ${
            isSelected ? '' : 'line-clamp-2'
          }`}
        >
          {incident.notes}
        </div>
      )}
      {isSelected && incident.coordinates && (
        <div className="text-xs lg:text-sm text-muted-foreground mt-2 lg:mt-3">
          <span className="text-muted-foreground">Location:</span>{' '}
          {incident.coordinates}
        </div>
      )}
    </div>
  )
}

export function IncidentList() {
  const store = incidentStore()
  const filteredAttacks = getFilteredIncidents(store)
  const [searchQuery, setSearchQuery] = useState('')

  const searchFilteredIncidents = filteredAttacks.filter((incident) => {
    if (!incident) return false
    const searchLower = searchQuery.toLowerCase()
    return (
      (incident.location?.toLowerCase().includes(searchLower) ?? false) ||
      (incident.dogBreed?.toLowerCase().includes(searchLower) ?? false) ||
      (incident.notes?.toLowerCase().includes(searchLower) ?? false)
    )
  })

  return (
    <div className="p-3 lg:p-4">
      <div className="mb-3 lg:mb-4">
        <Input
          placeholder="Search incidents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <FilterBar />
      <div className="space-y-3 lg:space-y-4">
        {searchFilteredIncidents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No incidents found
          </div>
        ) : (
          searchFilteredIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))
        )}
      </div>
    </div>
  )
}

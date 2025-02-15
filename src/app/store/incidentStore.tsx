import { create } from 'zustand'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { fetchIncidents } from '@/app/store/fetchData'

dayjs.extend(customParseFormat)

export interface Incident {
  id: string
  date: string // Format: YYYY-MM-DD
  time: string // Format: HH:mm
  dogBreed: string
  wasLeashed: string
  dogWeightLb: number
  numCoyotes: number
  location: string
  coordinates?: string // Format: "lat,lng"
  notes?: string
  dogInjured: string
  source?: string
  published: boolean
  incidentType?: string
}

export type SortField = 'datetime' | 'dogBreed' | 'dogWeightLb' | 'numCoyotes'
type SortOrder = 'asc' | 'desc'
type Filters = {
  wasLeashed?: string
  incidentType?: string
}

type AttackStore = {
  incidents: Incident[]
  setIncidents: (attacks: Incident[]) => void
  selectedIncidentId: string | null
  setSelectedIncidentId: (id: string | null) => void
  sortField: SortField
  setSortField: (field: SortField) => void
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
  filters: Filters
  setFilters: (filters: Filters) => void
}

export const incidentStore = create<AttackStore>((set) => ({
  incidents: [],
  setIncidents: (attacks) => set({ incidents: attacks }),
  selectedIncidentId: null,
  setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),
  sortField: 'datetime',
  setSortField: (field) => set({ sortField: field }),
  sortOrder: 'desc',
  setSortOrder: (order) => set({ sortOrder: order }),
  filters: {},
  setFilters: (filters) => set({ filters }),
}))

// Helper function to combine date and time into a single Date object
export const getDateTime = (incident: Incident): Date | null => {
  if (!incident.date) return null

  // Ensure date is in YYYY-MM-DD format
  const dateStr = incident.date
  const timeStr = incident.time || '00:00' // Default to midnight if no time provided

  // Parse with explicit format
  const date = dayjs(dateStr, 'YYYY-MM-DD')
  if (!date.isValid()) return null

  // Parse time with explicit format
  const time = dayjs(timeStr, 'HH:mm')
  if (!time.isValid()) return null

  // Combine date and time
  const combined = date.hour(time.hour()).minute(time.minute())
  return combined.isValid() ? combined.toDate() : null
}

// Selector function to get filtered and sorted incidents
export const getFilteredIncidents = (state: AttackStore): Incident[] => {
  const { incidents, sortField, sortOrder, filters } = state
  let result = [...incidents]

  // Apply filters
  if (filters.wasLeashed) {
    result = result.filter((i) => i.wasLeashed === filters.wasLeashed)
  }
  if (filters.incidentType) {
    result = result.filter((i) => i.incidentType === filters.incidentType)
  }

  // Apply sorting
  result.sort((a, b) => {
    if (sortField === 'datetime') {
      const aDate = getDateTime(a)
      const bDate = getDateTime(b)

      // If both dates are null/invalid, maintain original order
      if (!aDate && !bDate) return 0
      // Push null/invalid dates to the end
      if (!aDate) return 1
      if (!bDate) return -1

      return sortOrder === 'desc'
        ? bDate.getTime() - aDate.getTime()
        : aDate.getTime() - bDate.getTime()
    }

    const aVal = a[sortField]
    const bVal = b[sortField]

    if (!aVal && !bVal) return 0
    if (!aVal) return 1
    if (!bVal) return -1

    return sortOrder === 'desc'
      ? String(bVal).localeCompare(String(aVal))
      : String(aVal).localeCompare(String(bVal))
  })

  return result
}

export const fetchAttacks = async (): Promise<Incident[]> => {
  try {
    const records = await fetchIncidents()

    return records
      .map((record) => {
        // Ensure date is in YYYY-MM-DD format
        const rawDate = record.get('Date') as string
        const date = rawDate ? dayjs(rawDate).format('YYYY-MM-DD') : ''

        // Ensure time is in HH:mm format
        const rawTime = record.get('Time') as string
        const time = rawTime
          ? dayjs(rawTime, ['h:mm A', 'HH:mm']).format('hh:mm A')
          : ''

        return {
          id: record.id,
          date,
          time,
          location: record.get('Location') as string,
          coordinates: record.get('Coordinates') as string | undefined,
          dogBreed: record.get('Dog breed') as string,
          dogWeightLb: record.get('Dog weight (lbs)') as number,
          wasLeashed: record.get('Leashed') as string,
          numCoyotes: record.get('Number of coyotes') as number,
          notes: record.get('Notes') as string | undefined,
          dogInjured: record.get('Dog injured') as string,
          source: record.get('Source') as string | undefined,
          published: (record.get('Publish') as boolean) || false,
          incidentType: record.get('Incident type') as string | undefined,
        }
      })
      .filter((incident) => incident.published) // Only return published incidents
  } catch (error) {
    console.error('Error fetching data from Airtable:', error)
    return []
  }
}

import { create } from 'zustand'
import Airtable from 'airtable'

export interface Incident {
  id: string
  date: string
  time: string
  dogBreed: string
  wasLeashed: string
  dogWeightLb: number
  numCoyotes: number
  location: string
  coordinates?: string // Format: "lat,lng"
  notes?: string
  dogInjured: string
}

export type SortField = 'date' | 'dogBreed' | 'dogWeightLb' | 'numCoyotes'
type SortOrder = 'asc' | 'desc'
type Filters = {
  dogBreed?: string
  wasLeashed?: string
  dogInjured?: string
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
  sortField: 'date',
  setSortField: (field) => set({ sortField: field }),
  sortOrder: 'desc',
  setSortOrder: (order) => set({ sortOrder: order }),
  filters: {},
  setFilters: (filters) => set({ filters }),
}))

// Selector function to get filtered and sorted incidents
export const getFilteredIncidents = (state: AttackStore): Incident[] => {
  const { incidents, sortField, sortOrder, filters } = state
  let result = [...incidents]

  // Apply filters
  if (filters.dogBreed) {
    result = result.filter((i) =>
      i.dogBreed?.toLowerCase().includes(filters.dogBreed!.toLowerCase())
    )
  }
  if (filters.wasLeashed) {
    result = result.filter((i) => i.wasLeashed === filters.wasLeashed)
  }
  if (filters.dogInjured) {
    result = result.filter((i) => i.dogInjured === filters.dogInjured)
  }

  // Apply sorting
  result.sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]

    if (!aVal && !bVal) return 0
    if (!aVal) return 1
    if (!bVal) return -1

    if (sortField === 'date') {
      return sortOrder === 'desc'
        ? new Date(bVal).getTime() - new Date(aVal).getTime()
        : new Date(aVal).getTime() - new Date(bVal).getTime()
    }

    return sortOrder === 'desc'
      ? String(bVal).localeCompare(String(aVal))
      : String(aVal).localeCompare(String(bVal))
  })

  return result
}

export const fetchAttacks = async (): Promise<Incident[]> => {
  const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
  const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID
  const tableId = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID

  if (!apiKey || !baseId || !tableId) {
    return []
  }

  const base = new Airtable({
    apiKey,
  }).base(baseId)
  try {
    const records = await base(tableId).select().all()
    console.log(records)

    return records.map((record) => {
      return {
        id: record.id,
        date: record.get('Date') as string,
        time: record.get('Time') as string,
        location: record.get('Location') as string,
        coordinates: record.get('Coordinates') as string | undefined,
        dogBreed: record.get('Dog breed') as string,
        dogWeightLb: record.get('Dog weight (lbs)') as number,
        wasLeashed: record.get('Leashed') as string,
        numCoyotes: record.get('Number of coyotes') as number,
        notes: record.get('Notes') as string | undefined,
        dogInjured: record.get('Dog injured') as string,
      }
    })
  } catch (error) {
    console.error('Error fetching data from Airtable:', error)
    return []
  }
}

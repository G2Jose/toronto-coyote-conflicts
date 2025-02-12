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

type AttackStore = {
  attacks: Incident[]
  setAttacks: (attacks: Incident[]) => void
  filteredAttacks: Incident[]
  setFilteredAttacks: (attacks: Incident[]) => void
}

export const useAttackStore = create<AttackStore>((set) => ({
  attacks: [],
  setAttacks: (attacks) => set({ attacks }),
  filteredAttacks: [],
  setFilteredAttacks: (attacks) => set({ filteredAttacks: attacks }),
}))

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

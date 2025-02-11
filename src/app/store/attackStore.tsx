import { create } from 'zustand'

export interface Incident {
  id: number
  date: string
  time: string
  dogBreed: string
  wasLeashed: string
  dogWeightLb: number
  numCoyotes: number
  location: string
  lat: number
  lng: number
  notes: string
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

const INCIDENTS: Incident[] = [
  {
    id: 6,
    date: '2025-02-10',
    time: '20:30',
    dogBreed: 'Terrier Mix',
    wasLeashed: 'Yes, hands-free leash (tied around waist)',
    dogWeightLb: 15,
    numCoyotes: 1,
    location: 'June Callwood Park',
    lat: 43.636717,
    lng: -79.40399,
    notes:
      "Terrier mix dog attacked by coyote at June Callwood Park, about 150m from the condo building where they live. Owner had turned away for a few seconds and when she looked back, a coyote had lunged at the dog and was trying to rip him away. There were about 4 women screaming but it wasn't until a tall man came over that the coyote left.\n\nRushed to the ER and got stitches on one wound and two bite marks. At the emergency vet, she saw two other dogs that were also attacked in the area - a golden doodle and a husky.",
  },
]

export const fetchAttacks = async (): Promise<Incident[]> => {
  return INCIDENTS
}

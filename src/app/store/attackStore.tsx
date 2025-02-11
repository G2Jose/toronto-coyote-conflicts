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
    lat: 43.636876,
    lng: -79.4064777,
    notes: `We were 150 m from our condo building. I turned away for five seconds and when I looked back, the coyote lunged at my dog and was trying to rip him away. There were about four women screaming at it but it wasn't until a tall man came over to help that made the coyote leave.

    My dog was attacked tonight at June park. He was leashed and the coyote literally came out of nowhere. I had to take him to emergency which was $1300 to stitch one wound and two bite marks. The coyote lunged at us and didn't care that four people were screaming and yelling. 

    When I got to the emergency vet, there were two other dogs there, that also got attacked in our area - a golden doodle and a husky. The city patrols are bs and not effective and if anyone has any ideas on how we can get the city to actually act, please leave a comment.`,
  },
]

export const fetchAttacks = async (): Promise<Incident[]> => {
  return INCIDENTS
}

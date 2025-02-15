import Airtable from 'airtable'

const TEST_INCIDENTS_RAW = [
  {
    _table: {
      _base: {
        _airtable: {},
        _id: 'xxx',
      },
      id: null,
      name: 'xxx',
    },
    id: 'xxx',
    _rawJson: {
      id: 'xxx',
      createdTime: '2025-02-11T22:33:39.000Z',
      fields: {
        Notes:
          'Runner at Trillium was attacked by coyote. Passerbys heard a woman screaming for minutes. ',
        Date: '2024-12-03',
        Time: '2:00 PM',
        'Data notes': 'Exact time unknown, sometime in afternoon',
        Coordinates: '43.63010116479813, -79.40977351632922',
        Location: 'Trillium Park',
        ID: 'xxx',
        Publish: true,
        'Incident type': 'Coyote attack on a human',
        'Dog breed': 'Labrador',
        'Dog weight (lbs)': 60,
        Leashed: 'Yes',
        'Number of coyotes': 1,
        'Dog injured': 'Yes',
        Source: 'Cityplace Dog Owners FB group',
      },
    },
    fields: {
      Notes:
        'Runner at Trillium was attacked by coyote. Passerbys heard a woman screaming for minutes. ',
      Date: '2024-12-03',
      Time: '2:00 PM',
      'Data notes': 'Exact time unknown, sometime in afternoon',
      Coordinates: '43.63010116479813, -79.40977351632922',
      Location: 'Trillium Park',
      ID: 'rec0X1GTk6FPq9RCm',
      Publish: true,
      'Incident type': 'Coyote attack on a human',
      'Dog breed': 'Labrador',
      'Dog weight (lbs)': 60,
      Leashed: 'Yes',
      'Number of coyotes': 1,
      'Dog injured': 'Yes',
      Source: 'Toronto Star',
    },
  },
]

const TEST_INCIDENTS_RECORDS = TEST_INCIDENTS_RAW.map((incident) => {
  return {
    ...incident,
    get: (field: keyof (typeof TEST_INCIDENTS_RAW)[number]['fields']) =>
      incident.fields[field as keyof typeof incident.fields],
  }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchTestIncidents = async () => {
  return TEST_INCIDENTS_RECORDS
}

const fetchRealIncidents = async () => {
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
    return records
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return []
  }
}

export const fetchIncidents = fetchRealIncidents // to show test data, change to fetchTestIncidents

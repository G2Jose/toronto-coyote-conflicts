'use client'

import { useEffect, useMemo, useState } from 'react'
import { incidentStore, fetchAttacks } from '../store/incidentStore'
import dayjs from 'dayjs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const INCIDENT_COLORS = {
  'Coyote attack on a dog (attempt)': '#ef4444',
  'Coyote attack on a dog (successful)': '#b91c1c',
  'Stalked by a coyote': '#fbbf24',
  'Coyote attack on a human': '#7f1d1d',
}

type TimeGrouping = 'day' | 'month' | 'year'

export default function FrequencyPage() {
  const { incidents, setIncidents } = incidentStore()
  const [groupBy, setGroupBy] = useState<TimeGrouping>('day')

  useEffect(() => {
    const loadIncidents = async () => {
      const data = await fetchAttacks()
      setIncidents(data)
    }
    loadIncidents()
  }, [setIncidents])

  const chartData = useMemo(() => {
    if (!incidents.length) return []

    // Find date range
    const dates = incidents
      .filter((i) => i.date)
      .map((i) => dayjs(i.date))
      .sort((a, b) => a.valueOf() - b.valueOf())

    const startDate = dates[0]
    const endDate = dates[dates.length - 1]

    // Initialize all dates in range with zero counts
    const allDates = new Map<string, Record<string, number>>()
    let currentDate = startDate.startOf(groupBy)
    const finalDate = endDate.endOf(groupBy)

    while (
      currentDate.isBefore(finalDate) ||
      currentDate.isSame(finalDate, groupBy)
    ) {
      let key: string
      switch (groupBy) {
        case 'day':
          key = currentDate.format('YYYY-MM-DD')
          currentDate = currentDate.add(1, 'day')
          break
        case 'month':
          key = currentDate.format('YYYY-MM')
          currentDate = currentDate.add(1, 'month')
          break
        case 'year':
          key = currentDate.format('YYYY')
          currentDate = currentDate.add(1, 'year')
          break
      }

      allDates.set(key, {})
    }

    // Add actual incident counts
    incidents.forEach((incident) => {
      if (!incident.date || !incident.incidentType) return

      const date = dayjs(incident.date)
      let key: string
      switch (groupBy) {
        case 'day':
          key = date.format('YYYY-MM-DD')
          break
        case 'month':
          key = date.format('YYYY-MM')
          break
        case 'year':
          key = date.format('YYYY')
          break
      }

      // Create the group if it doesn't exist
      if (!allDates.has(key)) {
        allDates.set(key, {})
      }

      const group = allDates.get(key)!
      group[incident.incidentType] = (group[incident.incidentType] || 0) + 1
    })

    // Convert to array and sort by date
    return Array.from(allDates.entries())
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [incidents, groupBy])

  const incidentTypes = useMemo(() => {
    const types = new Set<string>()
    incidents.forEach((incident) => {
      if (incident.incidentType) {
        types.add(incident.incidentType)
      }
    })
    return Array.from(types)
  }, [incidents])

  const formatDate = (value: string) => {
    switch (groupBy) {
      case 'day':
        return dayjs(value).format('MMM D, YYYY')
      case 'month':
        return dayjs(value).format('MMM YYYY')
      case 'year':
        return value
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-md">
        <div className="max-w-[2000px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">
            Incident Frequency
          </h1>
        </div>
      </header>
      <main className="max-w-[2000px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium">Group by:</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as TimeGrouping)}
            className="bg-background border rounded px-2 py-1"
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        <div className="bg-card p-4 rounded-lg shadow-sm">
          <div className="h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ left: 40, right: 20, top: 10, bottom: 20 }}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={formatDate}
                  angle={groupBy === 'day' ? -45 : 0}
                  textAnchor={groupBy === 'day' ? 'end' : 'middle'}
                  height={80}
                  interval={groupBy === 'day' ? 6 : 0}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: 'currentColor' }}
                  label={{
                    value: 'Number of Incidents',
                    angle: -90,
                    position: 'insideLeft',
                    fill: 'currentColor',
                    style: { textAnchor: 'middle' },
                  }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                  formatter={(value: number, name: string) => [value, name]}
                  labelFormatter={formatDate}
                />
                <Legend verticalAlign="top" height={36} />
                {incidentTypes.map((type) => (
                  <Bar
                    key={type}
                    dataKey={type}
                    stackId="a"
                    fill={
                      INCIDENT_COLORS[type as keyof typeof INCIDENT_COLORS] ||
                      '#888888'
                    }
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <h2 className="font-medium text-base mb-2">
            About this visualization
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Shows the frequency of different types of coyote incidents over
              time
            </li>
            <li>
              Incidents are stacked to show both individual type frequencies and
              total incidents
            </li>
            <li>You can toggle between daily, monthly, and yearly views</li>
            <li>Hover over bars to see detailed counts</li>
            <li>Click legend items to toggle visibility of incident types</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

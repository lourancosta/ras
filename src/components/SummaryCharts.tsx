import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTheme } from 'styled-components'
import { formatDate, formatShortDate } from '../lib/dates'

// Two simple bar charts for the admin summary. Each has a single series
// (one colour, brand green), so no legend is needed: the card title names it.
// Style choices: thin bars with rounded ends, light grid, muted axis text,
// a tooltip on hover. Recharts' ResponsiveContainer resizes them with the card.

type SiteRow = { name: string; forms: number }
type DayRow = { date: string; forms: number }

export function FormsPerSiteChart({ data }: { data: SiteRow[] }) {
  const theme = useTheme()
  // Horizontal bars: long site names read better on the left than under the bars.
  const height = Math.max(160, data.length * 44)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 0 }}>
        <CartesianGrid horizontal={false} stroke={theme.colors.border} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: theme.colors.muted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={170}
          tick={{ fill: theme.colors.text, fontSize: 13 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: theme.colors.bg }} formatter={(value) => [value, 'Forms']} />
        <Bar
          dataKey="forms"
          fill={theme.colors.brand}
          radius={[0, 4, 4, 0]}
          barSize={20}
          // Only 4-5 bars, so the number at the end of each is easy to read.
          label={{ position: 'right', fill: theme.colors.text, fontSize: 12 }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function FormsPerDayChart({ data }: { data: DayRow[] }) {
  const theme = useTheme()

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
        <CartesianGrid vertical={false} stroke={theme.colors.border} />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          // Recharts hides labels that would overlap on narrow screens.
          interval="preserveStartEnd"
          tick={{ fill: theme.colors.muted, fontSize: 12 }}
          axisLine={{ stroke: theme.colors.border }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: theme.colors.muted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: theme.colors.bg }}
          labelFormatter={(label) => formatDate(String(label))}
          formatter={(value) => [value, 'Forms']}
        />
        <Bar dataKey="forms" fill={theme.colors.brand} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}

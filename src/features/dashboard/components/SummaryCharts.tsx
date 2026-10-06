import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTheme } from 'styled-components'
import { formatDate, formatShortDate } from '../../../lib/dates'

// Two simple bar charts for the dashboards. Each has a single series
// (one colour, brand green), so no legend is needed: the card title names it.
// Style choices: thin bars with rounded ends, light grid, muted axis text,
// a tooltip on hover. Recharts' ResponsiveContainer resizes them with the card.

// `id` lets a click say which row it was (e.g. the checklist item's key).
type NameRow = { name: string; count: number; id?: string }
type DayRow = { date: string; forms: number }

type HorizontalBarChartProps = {
  data: NameRow[]
  valueLabel: string // shown in the tooltip, e.g. "Forms" or "Issues"
  onBarClick?: (row: NameRow) => void // makes the bars clickable (pointer cursor)
}

// One bar per name: forms per site (admin) or issues per checklist item (framer).
export function HorizontalBarChart({ data, valueLabel, onBarClick }: HorizontalBarChartProps) {
  const theme = useTheme()
  // Horizontal bars: long names read better on the left than under the bars.
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
          width={190} // fits the longest label ("Tools and cords in good condition")
          tick={{ fill: theme.colors.text, fontSize: 13 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: theme.colors.bg }} formatter={(value) => [value, valueLabel]} />
        <Bar
          dataKey="count"
          fill={theme.colors.brand}
          radius={[0, 4, 4, 0]}
          barSize={20}
          // Recharts passes the clicked bar; `payload` is our data row.
          onClick={onBarClick ? (bar) => onBarClick(bar.payload as NameRow) : undefined}
          cursor={onBarClick ? 'pointer' : undefined}
          // Few bars (5 sites / 8 items), so the number at the end of each is easy to read.
          label={{ position: 'right', fill: theme.colors.text, fontSize: 12 }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

type FormsPerDayChartProps = {
  data: DayRow[]
  onBarClick?: (row: DayRow) => void // makes the bars clickable (pointer cursor)
}

export function FormsPerDayChart({ data, onBarClick }: FormsPerDayChartProps) {
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
        <Bar
          dataKey="forms"
          fill={theme.colors.brand}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
          onClick={onBarClick ? (bar) => onBarClick(bar.payload as DayRow) : undefined}
          cursor={onBarClick ? 'pointer' : undefined}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

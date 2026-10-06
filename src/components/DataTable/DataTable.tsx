import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTheme } from 'styled-components'
import { useMediaQuery } from '../../lib/useMediaQuery'
import {
  CardDetails,
  CardList,
  CardMain,
  CardTop,
  ClickableRow,
  EmptyMessage,
  RowCard,
  Table,
  TableCard,
  TableScroll,
} from './DataTable.styles'

// Where a column goes on a phone card:
// 'title' = bold, top left · 'badge' = top right · 'detail' (default) = the small line
// under the title · 'hidden' = only in the table.
export type CardSlot = 'title' | 'badge' | 'detail' | 'hidden'

// One column: its header text, how to draw its cell for a row, and its place on a card.
export type Column<Row> = {
  header: string
  cell: (row: Row) => ReactNode
  card?: CardSlot
}

type DataTableProps<Row> = {
  columns: Column<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string // unique per row (React's `key`)
  // Optional: makes the whole row / card open something (mouse, touch, and the keyboard).
  onRowClick?: (row: Row) => void
  rowLabel?: (row: Row) => string // what screen readers say for a clickable row
  // Shown when there are no rows. Omit it while loading or on error, so the
  // list doesn't say "nothing found" before (or instead of) the real answer.
  emptyMessage?: string
}

// The app's one list component. `<Row>` is a generic type: each page says what a row is
// (a submission, a site, a worker) and TypeScript checks the columns against it.
// - Wide screens: a table (card, sticky header, scrolls sideways if too wide and, inside a
//   fixed-height page, scrolls its rows).
// - Phones: one card per row, built from the same columns (see CardSlot), because a wide
//   table on a small screen means scrolling sideways to read a row.
export function DataTable<Row>(props: DataTableProps<Row>) {
  const theme = useTheme()
  const isWide = useMediaQuery(`(min-width: ${theme.breakpoints.md})`)
  return isWide ? <TableView {...props} /> : <CardView {...props} />
}

function TableView<Row>({ columns, rows, rowKey, onRowClick, rowLabel, emptyMessage }: DataTableProps<Row>) {
  return (
    <TableCard>
      <TableScroll>
        <Table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.header}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && emptyMessage && (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyMessage>{emptyMessage}</EmptyMessage>
                </td>
              </tr>
            )}

            {rows.map((row) => {
              const cells = columns.map((column) => <td key={column.header}>{column.cell(row)}</td>)

              if (!onRowClick) return <tr key={rowKey(row)}>{cells}</tr>

              return (
                // A <tr> can't be a link, so a clickable row gets onClick plus
                // tabIndex/onKeyDown so it also works with the keyboard (Tab, Enter).
                <ClickableRow
                  key={rowKey(row)}
                  onClick={() => onRowClick(row)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') onRowClick(row)
                  }}
                  tabIndex={0}
                  aria-label={rowLabel?.(row)}
                >
                  {cells}
                </ClickableRow>
              )
            })}
          </tbody>
        </Table>
      </TableScroll>
    </TableCard>
  )
}

// Cell values that would only make an empty gap on a card (e.g. "no photos").
function isEmpty(value: ReactNode) {
  return value === null || value === undefined || value === false || value === ''
}

function CardView<Row>({ columns, rows, rowKey, onRowClick, rowLabel, emptyMessage }: DataTableProps<Row>) {
  const slotOf = (column: Column<Row>) => column.card ?? 'detail'
  const titleColumn = columns.find((column) => slotOf(column) === 'title')
  const badgeColumn = columns.find((column) => slotOf(column) === 'badge')
  const detailColumns = columns.filter((column) => slotOf(column) === 'detail')

  if (rows.length === 0) return emptyMessage ? <EmptyMessage>{emptyMessage}</EmptyMessage> : null

  return (
    <CardList>
      {rows.map((row) => {
        const details = detailColumns
          .map((column) => ({ key: column.header, value: column.cell(row) }))
          .filter((detail) => !isEmpty(detail.value))

        const content = (
          <>
            <CardMain>
              <CardTop>
                <span>{titleColumn?.cell(row)}</span>
                {badgeColumn?.cell(row)}
              </CardTop>
              {details.length > 0 && (
                <CardDetails>
                  {details.map((detail) => (
                    <span key={detail.key}>{detail.value}</span>
                  ))}
                </CardDetails>
              )}
            </CardMain>
            {onRowClick && <ChevronRight size={20} aria-hidden="true" />}
          </>
        )

        return (
          <li key={rowKey(row)}>
            {onRowClick ? (
              <RowCard type="button" onClick={() => onRowClick(row)} aria-label={rowLabel?.(row)}>
                {content}
              </RowCard>
            ) : (
              <RowCard as="div">{content}</RowCard>
            )}
          </li>
        )
      })}
    </CardList>
  )
}

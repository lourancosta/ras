import type { ReactNode } from 'react'
import { ClickableRow, EmptyMessage, Table, TableCard, TableScroll } from './DataTable.styles'

// One column: its header text and how to draw its cell for a row.
export type Column<Row> = {
  header: string
  cell: (row: Row) => ReactNode
}

type DataTableProps<Row> = {
  columns: Column<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string // unique per row (React's `key`)
  // Optional: makes the whole row open something (mouse, and Tab + Enter on the keyboard).
  onRowClick?: (row: Row) => void
  rowLabel?: (row: Row) => string // what screen readers say for a clickable row
  // Shown when there are no rows. Omit it while loading or on error, so the
  // table doesn't say "nothing found" before (or instead of) the real answer.
  emptyMessage?: string
}

// The app's one table: card, sticky header, scrolls sideways on phones and, inside a
// fixed-height page, scrolls its rows. `<Row>` is a generic type: each page says what
// a row is (a submission, a site, a worker) and TypeScript checks the columns against it.
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  rowLabel,
  emptyMessage,
}: DataTableProps<Row>) {
  return (
    <TableCard>
      {/* Wide table: scrolls sideways on small screens instead of squashing. */}
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

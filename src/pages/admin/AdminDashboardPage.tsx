import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { AlertTriangle, Camera, CheckCircle2 } from 'lucide-react'
import styled from 'styled-components'
import { StatusBadge } from '../../components/StatusBadge'
import { Card, ErrorMessage, Field, Hint, Input, PageTitle, Select } from '../../components/ui'
import { countIssues } from '../../lib/checklist'
import type { Enums } from '../../lib/database.types'
import { formatDate } from '../../lib/dates'
import {
  ADMIN_ROW_LIMIT,
  fetchFilterOptions,
  fetchSubmissions,
  type AdminSubmission,
  type FilterOptions,
  type SubmissionFilters,
} from '../../lib/submissions'

const STATUSES: Enums<'submission_status'>[] = ['submitted', 'reviewed', 'flagged']
const STATUS_LABELS: Record<Enums<'submission_status'>, string> = {
  submitted: 'Pending review',
  reviewed: 'Reviewed',
  flagged: 'Flagged',
}

// Outcome of one load, tagged with the filters it was for (see `loading` below).
type Result = { key: string; rows: AdminSubmission[]; error: string | null }

export function AdminDashboardPage() {
  // Filters live in the URL (?site=..&worker=..&status=..&from=..&to=..):
  // they survive a refresh, work with Back, and the link can be shared.
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const statusParam = searchParams.get('status')
  const filters: SubmissionFilters = {
    siteId: searchParams.get('site') ?? undefined,
    workerId: searchParams.get('worker') ?? undefined,
    // Only accept a known status (a typo in the URL is ignored, not sent to the DB).
    status: STATUSES.find((s) => s === statusParam),
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
  }
  const filterKey = searchParams.toString()

  const [options, setOptions] = useState<FilterOptions | null>(null)
  const [optionsError, setOptionsError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  // Dropdown options, once.
  useEffect(() => {
    fetchFilterOptions()
      .then(setOptions)
      .catch((err) => {
        console.error('Loading filter options failed:', err)
        setOptionsError('Could not load sites and workers. Please refresh the page.')
      })
  }, [])

  // Submissions, every time the filters (URL) change.
  const { siteId, workerId, status, from, to } = filters
  useEffect(() => {
    let ignore = false // a newer filter change happened: drop this older response
    fetchSubmissions({ siteId, workerId, status, from, to })
      .then((rows) => {
        if (!ignore) setResult({ key: filterKey, rows, error: null })
      })
      .catch((err) => {
        console.error('Loading submissions failed:', err)
        if (!ignore) {
          setResult({ key: filterKey, rows: [], error: 'Could not load forms. Please refresh the page.' })
        }
      })
    return () => {
      ignore = true
    }
  }, [filterKey, siteId, workerId, status, from, to])

  // Derived: loading until we have a result for the *current* filters.
  // Old rows/errors from previous filters are never shown.
  const loading = result?.key !== filterKey
  const rows = loading ? [] : result.rows
  const error = loading ? null : result.error
  const invalidRange = !!from && !!to && from > to

  // Set or remove one URL parameter, keeping the others.
  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    setSearchParams(next, { replace: true })
  }

  const hasFilters = filterKey !== ''

  // Opens a form. state.back = this dashboard URL with its filters, so the detail
  // page's "Back to dashboard" returns to the same filtered list.
  function openSubmission(id: string) {
    navigate(`/admin/forms/${id}`, { state: { back: `/admin${hasFilters ? `?${filterKey}` : ''}` } })
  }

  return (
    <Container>
      <PageTitle>Dashboard</PageTitle>

      <Filters>
        <Field>
          Site
          <Select value={siteId ?? ''} onChange={(e) => setFilter('site', e.target.value)}>
            <option value="">All sites</option>
            {options?.sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
                {site.is_active ? '' : ' (inactive)'}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          Worker
          <Select value={workerId ?? ''} onChange={(e) => setFilter('worker', e.target.value)}>
            <option value="">All workers</option>
            {options?.workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.full_name}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          Status
          <Select value={status ?? ''} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          From
          <Input type="date" value={from ?? ''} max={to} onChange={(e) => setFilter('from', e.target.value)} />
        </Field>

        <Field>
          To
          <Input type="date" value={to ?? ''} min={from} onChange={(e) => setFilter('to', e.target.value)} />
        </Field>
      </Filters>

      <ResultBar>
        <Hint>
          {loading
            ? 'Loading…'
            : `${rows.length} form${rows.length === 1 ? '' : 's'}` +
              (rows.length === ADMIN_ROW_LIMIT ? ` (showing the most recent ${ADMIN_ROW_LIMIT}, narrow the filters)` : '')}
        </Hint>
        {hasFilters && (
          <ClearButton type="button" onClick={() => setSearchParams({}, { replace: true })}>
            Clear filters
          </ClearButton>
        )}
      </ResultBar>

      {invalidRange && <ErrorMessage>The "From" date is after the "To" date.</ErrorMessage>}
      {optionsError && <ErrorMessage>{optionsError}</ErrorMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <TableCard>
        {/* Wide table: scrolls sideways on small screens instead of squashing. */}
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Site</th>
                <th>Checklist</th>
                <th>Photos</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <Hint>No forms match these filters.</Hint>
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const issues = countIssues(row)
                const photoCount = row.submission_photos[0]?.count ?? 0
                return (
                  // The whole row opens the form. A <tr> can't be a link, so it gets
                  // onClick + tabIndex/onKeyDown to also work with the keyboard (Tab, Enter).
                  <ClickableRow
                    key={row.id}
                    onClick={() => openSubmission(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') openSubmission(row.id)
                    }}
                    tabIndex={0}
                    aria-label={`Open form: ${row.worker?.full_name}, ${row.site?.name}, ${formatDate(row.work_date)}`}
                  >
                    <td>{row.worker?.full_name}</td>
                    <td>{row.site?.name}</td>
                    <td>
                      {issues === 0 ? (
                        <Ok>
                          <CheckCircle2 size={16} aria-hidden="true" /> OK
                        </Ok>
                      ) : (
                        <Issue>
                          <AlertTriangle size={16} aria-hidden="true" /> {issues} issue
                          {issues > 1 ? 's' : ''}
                        </Issue>
                      )}
                    </td>
                    <td>
                      {photoCount > 0 && (
                        <IconText>
                          <Camera size={16} aria-hidden="true" /> {photoCount}
                        </IconText>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>{formatDate(row.work_date)}</td>
                  </ClickableRow>
                )
              })}
            </tbody>
          </Table>
        </TableScroll>
      </TableCard>
    </Container>
  )
}

// On wide screens the dashboard is exactly as tall as the window (minus the page
// padding): title and filters stay in place and only the table rows scroll.
// On phones the page scrolls normally (a fixed-height box would leave few rows visible).
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    height: calc(100vh - 2 * ${({ theme }) => theme.pagePaddingDesktop});
    height: calc(100dvh - 2 * ${({ theme }) => theme.pagePaddingDesktop}); /* dvh: correct on tablets with toolbars */
  }
`

const Filters = styled(Card)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  padding: 16px;
`

const ResultBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
`

const ClearButton = styled.button`
  padding: 4px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.brand};
  font-weight: 600;
  cursor: pointer;
`

// flex: 1 = take the height left under the filters. min-height: 0 lets it shrink
// below its content's height (flex items don't by default), so the inside can scroll.
const TableCard = styled(Card)`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
`

// The scrolling area: rows scroll up/down, wide tables scroll sideways.
const TableScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  /* Header row stays visible while the rows scroll under it. */
  th {
    position: sticky;
    top: 0;
    z-index: 1;
    /* A sticky cell loses its collapsed border, so the line is drawn as a shadow. */
    border-bottom: none;
    box-shadow: inset 0 -1px 0 ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`

const ClickableRow = styled.tr`
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.bg};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: -2px;
  }
`

const IconText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`

const Ok = styled(IconText)`
  color: ${({ theme }) => theme.colors.success};
`

const Issue = styled(IconText)`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 600;
`

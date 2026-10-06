import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { AlertTriangle, Camera, CheckCircle2 } from 'lucide-react'
import { DataTable, type Column } from '../../../components/DataTable/DataTable'
import { StatusBadge } from '../components/StatusBadge/StatusBadge'
import {
  ClearFiltersButton,
  ErrorMessage,
  Field,
  FilterCard,
  Hint,
  Input,
  PageTitle,
  ResultBar,
  Select,
} from '../../../components/ui'
import { countIssues } from '../checklist'
import type { Enums } from '../../../lib/database.types'
import { formatDate } from '../../../lib/dates'
import {
  ADMIN_ROW_LIMIT,
  fetchFilterOptions,
  fetchSubmissions,
  type AdminSubmission,
  type FilterOptions,
  type SubmissionFilters,
} from '../submissions'
import { Container, IconText, Ok, Issue } from './AllSubmissionsPage.styles'

const STATUSES: Enums<'submission_status'>[] = ['submitted', 'reviewed', 'flagged']
const STATUS_LABELS: Record<Enums<'submission_status'>, string> = {
  submitted: 'Pending review',
  reviewed: 'Reviewed',
  flagged: 'Flagged',
}

// Table columns. Each cell is drawn from one row (a submission with its worker, site
// and photo count).
const columns: Column<AdminSubmission>[] = [
  { header: 'Worker', cell: (row) => row.worker?.full_name },
  { header: 'Site', cell: (row) => row.site?.name },
  {
    header: 'Checklist',
    cell: (row) => {
      const issues = countIssues(row)
      return issues === 0 ? (
        <Ok>
          <CheckCircle2 size={16} aria-hidden="true" /> OK
        </Ok>
      ) : (
        <Issue>
          <AlertTriangle size={16} aria-hidden="true" /> {issues} issue{issues > 1 ? 's' : ''}
        </Issue>
      )
    },
  },
  {
    header: 'Photos',
    cell: (row) => {
      // `submission_photos(count)` comes back as [{ count: n }].
      const photoCount = row.submission_photos[0]?.count ?? 0
      return (
        photoCount > 0 && (
          <IconText>
            <Camera size={16} aria-hidden="true" /> {photoCount}
          </IconText>
        )
      )
    },
  },
  { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  { header: 'Date', cell: (row) => formatDate(row.work_date) },
]

// Outcome of one load, tagged with the filters it was for (see `loading` below).
type Result = { key: string; rows: AdminSubmission[]; error: string | null }

// /submissions ("All Submissions"): every submitted form in a filterable table.
export function AllSubmissionsPage() {
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

  // Opens a form. state.back = this page's URL with its filters, so the detail
  // page's "Back to all submissions" returns to the same filtered list.
  function openSubmission(id: string) {
    navigate(`/submissions/${id}`, { state: { back: `/submissions${hasFilters ? `?${filterKey}` : ''}` } })
  }

  return (
    <Container>
      <PageTitle>All Submissions</PageTitle>

      <FilterCard>
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
                {worker.is_active ? '' : ' (inactive)'}
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
      </FilterCard>

      <ResultBar>
        <Hint>
          {loading
            ? 'Loading…'
            : `${rows.length} form${rows.length === 1 ? '' : 's'}` +
              (rows.length === ADMIN_ROW_LIMIT ? ` (showing the most recent ${ADMIN_ROW_LIMIT}, narrow the filters)` : '')}
        </Hint>
        {hasFilters && (
          <ClearFiltersButton type="button" onClick={() => setSearchParams({}, { replace: true })}>
            Clear filters
          </ClearFiltersButton>
        )}
      </ResultBar>

      {invalidRange && <ErrorMessage>The "From" date is after the "To" date.</ErrorMessage>}
      {optionsError && <ErrorMessage>{optionsError}</ErrorMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        onRowClick={(row) => openSubmission(row.id)}
        rowLabel={(row) =>
          `Open form: ${row.worker?.full_name}, ${row.site?.name}, ${formatDate(row.work_date)}`
        }
        emptyMessage={!loading && !error ? 'No forms match these filters.' : undefined}
      />
    </Container>
  )
}

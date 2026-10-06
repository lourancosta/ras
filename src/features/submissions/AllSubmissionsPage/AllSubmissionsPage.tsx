import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { DataTable, type Column } from '../../../components/DataTable/DataTable'
import { ReviewQueue, type QueueReview } from '../components/ReviewQueue/ReviewQueue'
import { StatusBadge } from '../components/StatusBadge/StatusBadge'
import { ChecklistResult, PhotoCount } from '../components/SubmissionCells/SubmissionCells'
import { ListChecks } from 'lucide-react'
import {
  Button,
  ClearFiltersButton,
  ErrorMessage,
  Field,
  FilterCard,
  Hint,
  Input,
  ListPage,
  PageTitle,
  ResultActions,
  ResultBar,
  Select,
} from '../../../components/ui'
import type { Enums } from '../../../lib/database.types'
import { formatDate } from '../../../lib/dates'
import {
  ADMIN_ROW_LIMIT,
  fetchFilterOptions,
  fetchSubmissions,
  photoCountOf,
  type AdminSubmission,
  type FilterOptions,
  type SubmissionFilters,
} from '../submissions'

const STATUSES: Enums<'submission_status'>[] = ['submitted', 'reviewed', 'flagged']
const STATUS_LABELS: Record<Enums<'submission_status'>, string> = {
  submitted: 'Pending review',
  reviewed: 'Reviewed',
  flagged: 'Flagged',
}

// Columns (table on wide screens). `card` = where each one goes on a phone card;
// unmarked columns are the card's detail line.
const columns: Column<AdminSubmission>[] = [
  { header: 'Worker', cell: (row) => row.worker?.full_name, card: 'title' },
  { header: 'Site', cell: (row) => row.site?.name },
  { header: 'Checklist', cell: (row) => <ChecklistResult answers={row} /> },
  {
    header: 'Photos',
    cell: (row) => {
      const count = photoCountOf(row.submission_photos)
      return count > 0 && <PhotoCount count={count} />
    },
  },
  { header: 'Status', cell: (row) => <StatusBadge status={row.status} />, card: 'badge' },
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
  // The review queue's forms (ids), fixed when it opens; null = closed.
  const [queueIds, setQueueIds] = useState<string[] | null>(null)

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

  // Review queue: the pending forms in the current list (so it follows the filters),
  // oldest first, the usual order for working through a backlog.
  const pending = rows
    .filter((row) => row.status === 'submitted')
    .sort((a, b) => a.work_date.localeCompare(b.work_date) || a.created_at.localeCompare(b.created_at))

  // A form was saved in the queue: update its row here too, so the table is right when
  // the queue closes (no reload needed).
  function handleQueueReviewed({ id, ...saved }: QueueReview) {
    setResult((current) =>
      current && { ...current, rows: current.rows.map((row) => (row.id === id ? { ...row, ...saved } : row)) },
    )
  }

  // Opens a form. state.back = this page's URL with its filters, so the detail
  // page's "Back to all submissions" returns to the same filtered list.
  function openSubmission(id: string) {
    navigate(`/submissions/${id}`, { state: { back: `/submissions${hasFilters ? `?${filterKey}` : ''}` } })
  }

  return (
    <ListPage>
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
        <ResultActions>
          {hasFilters && (
            <ClearFiltersButton type="button" onClick={() => setSearchParams({}, { replace: true })}>
              Clear filters
            </ClearFiltersButton>
          )}
          {/* Only when there's something to review. */}
          {pending.length > 0 && (
            <Button type="button" onClick={() => setQueueIds(pending.map((row) => row.id))}>
              <ListChecks size={18} aria-hidden="true" /> Review queue ({pending.length})
            </Button>
          )}
        </ResultActions>
      </ResultBar>

      {queueIds && (
        <ReviewQueue ids={queueIds} onReviewed={handleQueueReviewed} onClose={() => setQueueIds(null)} />
      )}

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
    </ListPage>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { DataTable, type Column } from '../../../components/DataTable/DataTable'
import { FilterPanel } from '../../../components/FilterPanel/FilterPanel'
import { ReviewQueue, type QueueReview } from '../components/ReviewQueue/ReviewQueue'
import { StatusBadge } from '../components/StatusBadge/StatusBadge'
import { StatusSelect } from '../components/StatusSelect/StatusSelect'
import { parseStatus } from '../status'
import { ChecklistResult, PhotoCount } from '../components/SubmissionCells/SubmissionCells'
import { ListChecks } from 'lucide-react'
import {
  Button,
  ClearFiltersButton,
  ErrorMessage,
  Field,
  Hint,
  Input,
  ListPage,
  PageTitle,
  ResultActions,
  ResultBar,
  Select,
} from '../../../components/ui'
import { useAsync } from '../../../lib/useAsync'
import { useUrlFilters } from '../../../lib/useUrlFilters'
import { formatDate } from '../../../lib/dates'
import {
  ADMIN_ROW_LIMIT,
  fetchFilterOptions,
  fetchSubmissions,
  photoCountOf,
  type AdminSubmission,
  type SubmissionFilters,
} from '../submissions'

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

// /submissions ("All Submissions"): every submitted form in a filterable table.
export function AllSubmissionsPage() {
  // Filters live in the URL (?site=..&worker=..&status=..&from=..&to=..), see useUrlFilters.
  const { params, key: filterKey, hasFilters, activeCount, listUrl, setFilter, clear } = useUrlFilters()
  const navigate = useNavigate()
  const filters: SubmissionFilters = {
    siteId: params.get('site') ?? undefined,
    workerId: params.get('worker') ?? undefined,
    status: parseStatus(params.get('status')), // unknown values are ignored
    from: params.get('from') ?? undefined,
    to: params.get('to') ?? undefined,
  }

  // The review queue's forms (ids), fixed when it opens; null = closed.
  const [queueIds, setQueueIds] = useState<string[] | null>(null)

  // Dropdown options, once (fixed key).
  const { data: options, error: optionsError } = useAsync(
    'filter-options',
    fetchFilterOptions,
    'Could not load sites and workers. Please refresh the page.',
  )

  // Submissions, again every time the filters (URL) change: the key is the URL's query string.
  // While loading, `rows` is empty: old rows from previous filters are never shown.
  const submissions = useAsync(
    filterKey,
    () => fetchSubmissions(filters),
    'Could not load forms. Please refresh the page.',
  )
  const { loading, error } = submissions
  const rows = submissions.data ?? []
  const { siteId, workerId, from, to } = filters
  const invalidRange = !!from && !!to && from > to

  // Review queue: the pending forms in the current list (so it follows the filters),
  // oldest first, the usual order for working through a backlog.
  const pending = rows
    .filter((row) => row.status === 'submitted')
    .sort((a, b) => a.work_date.localeCompare(b.work_date) || a.created_at.localeCompare(b.created_at))

  // A form was saved in the queue: update its row here too, so the table is right when
  // the queue closes (no reload needed).
  function handleQueueReviewed({ id, ...saved }: QueueReview) {
    submissions.setData((current) => current.map((row) => (row.id === id ? { ...row, ...saved } : row)))
  }

  // Opens a form. state.back = this page's URL with its filters, so the detail
  // page's "Back to all submissions" returns to the same filtered list.
  function openSubmission(id: string) {
    navigate(`/submissions/${id}`, { state: { back: listUrl } })
  }

  return (
    <ListPage>
      <PageTitle>All Submissions</PageTitle>

      {/* activeCount: one per filter set in the URL ("Show filters (2)" on phones). */}
      <FilterPanel activeCount={activeCount}>
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
          <StatusSelect value={filters.status} onChange={(value) => setFilter('status', value)} />
        </Field>

        <Field>
          From
          <Input
            type="date"
            value={from ?? ''}
            max={to}
            onChange={(e) => setFilter('from', e.target.value)}
          />
        </Field>

        <Field>
          To
          <Input type="date" value={to ?? ''} min={from} onChange={(e) => setFilter('to', e.target.value)} />
        </Field>
      </FilterPanel>

      <ResultBar>
        <Hint>
          {loading
            ? 'Loading…'
            : `${rows.length} form${rows.length === 1 ? '' : 's'}` +
              (rows.length === ADMIN_ROW_LIMIT
                ? ` (showing the most recent ${ADMIN_ROW_LIMIT}, narrow the filters)`
                : '')}
        </Hint>
        <ResultActions>
          {hasFilters && (
            <ClearFiltersButton type="button" onClick={clear}>
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

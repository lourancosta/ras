import { Link, useNavigate, useSearchParams } from 'react-router'
import { FilePlus } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { can } from '../../../lib/permissions'
import { DataTable, type Column } from '../../../components/DataTable/DataTable'
import { FilterPanel } from '../../../components/FilterPanel/FilterPanel'
import { StatusBadge } from '../components/StatusBadge/StatusBadge'
import { ChecklistResult, PhotoCount } from '../components/SubmissionCells/SubmissionCells'
import {
  Button,
  ClearFiltersButton,
  ErrorMessage,
  Field,
  Hint,
  ListPage,
  PageHeader,
  PageTitle,
  ResultBar,
  Select,
} from '../../../components/ui'
import { checklistGroups } from '../checklist'
import { formatDate, todayInVancouver } from '../../../lib/dates'
import { useAsync } from '../../../lib/useAsync'
import {
  fetchMySubmissions,
  fetchSiteOptions,
  fetchSubmittedToday,
  MY_ROW_LIMIT,
  photoCountOf,
  type MySubmission,
} from '../submissions'
import { DATE_PRESET_LABELS, DATE_PRESETS, dateRangeFor, parseMyFilters } from '../myFilters'
import { Reminder } from './MySubmissionsPage.styles'

// Columns (table on wide screens). `card` = where each one goes on a phone card;
// unmarked columns are the card's detail line.
const columns: Column<MySubmission>[] = [
  { header: 'Site', cell: (row) => row.site?.name, card: 'title' },
  { header: 'Date', cell: (row) => formatDate(row.work_date) },
  { header: 'Checklist', cell: (row) => <ChecklistResult answers={row} /> },
  {
    header: 'Photos',
    cell: (row) => {
      const count = photoCountOf(row.submission_photos)
      return count > 0 && <PhotoCount count={count} />
    },
  },
  { header: 'Status', cell: (row) => <StatusBadge status={row.status} />, card: 'badge' },
]

// /my-submissions: the framer's home page. Lists their forms, newest first, with filters
// (site, status, date, checklist), and is the way to start a new one.
export function MySubmissionsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const userId = profile?.id
  const today = todayInVancouver()
  const canCreate = can(profile?.role, 'submissions.create')

  // Filters live in the URL (see myFilters.ts): they survive a refresh, work with Back,
  // and the dashboard can link straight to a filtered list. No filter state here.
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseMyFilters(searchParams)
  const filterKey = searchParams.toString()
  const hasFilters = filterKey !== ''
  const listUrl = `/my-submissions${hasFilters ? `?${filterKey}` : ''}`

  // Site options, once. If it fails, the dropdown only has "All sites" (the list still works).
  const { data: sites } = useAsync('sites', fetchSiteOptions, 'Loading sites failed.')

  // Daily reminder: its own small query, so it's right whatever the filters show.
  // null key until the user is known; if it fails: no reminder rather than a wrong one.
  // `userId!`: the request only runs when the key isn't null, i.e. when userId is set.
  const { data: submittedToday } = useAsync(
    userId ? `${userId}:${today}` : null,
    () => fetchSubmittedToday(userId!, today),
    'Checking today failed.',
  )

  // Forms, again every time the filters (URL) change. The key holds everything the
  // query depends on: the user and the filters (dates are resolved from `today`).
  const { from, to } = dateRangeFor(filters, today)
  const list = useAsync(
    userId ? `${userId}:${today}?${filterKey}` : null,
    () =>
      fetchMySubmissions(userId!, {
        siteId: filters.siteId,
        status: filters.status,
        from,
        to,
        issue: filters.issue,
      }),
    'Could not load your submissions. Please refresh the page.',
  )
  const { loading, error } = list
  const submissions = list.data

  // Set or remove one URL parameter, keeping the others.
  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    setSearchParams(next, { replace: true })
  }

  // The date dropdown covers two parameters: a preset (`period`) or one exact day
  // (`date`, only when you came from a dashboard chart bar). Picking one clears the other.
  const dateValue = filters.date ? `day:${filters.date}` : filters.period ?? ''
  function setDateFilter(value: string) {
    if (value.startsWith('day:')) return // the exact day is already selected
    const next = new URLSearchParams(searchParams)
    next.delete('date')
    if (value) next.set('period', value)
    else next.delete('period')
    setSearchParams(next, { replace: true })
  }

  const count = submissions?.length ?? 0
  const countText = loading
    ? 'Loading…'
    : `${count} form${count === 1 ? '' : 's'}` +
      (count === MY_ROW_LIMIT ? ` (showing the most recent ${MY_ROW_LIMIT}, narrow the filters)` : '')

  return (
    <ListPage>
      <PageHeader>
        <PageTitle>My submissions</PageTitle>
        {canCreate && (
          <Button as={Link} to="/my-submissions/new">
            <FilePlus size={18} aria-hidden="true" /> New form
          </Button>
        )}
      </PageHeader>

      {/* Reminder: a form is expected before starting work each day. */}
      {canCreate && submittedToday === false && (
        <Reminder>
          <span>You haven't submitted today's safety form yet.</span>
          <Button as={Link} to="/my-submissions/new">
            Fill in today's form
          </Button>
        </Reminder>
      )}

      {/* activeCount: one per filter set in the URL ("Show filters (2)" on phones). */}
      <FilterPanel activeCount={[...searchParams.keys()].length}>
        <Field>
          Site
          <Select value={filters.siteId ?? ''} onChange={(e) => setFilter('site', e.target.value)}>
            <option value="">All sites</option>
            {sites?.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
                {site.is_active ? '' : ' (inactive)'}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          Status
          <Select value={filters.status ?? ''} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="submitted">Pending review</option>
            <option value="reviewed">Reviewed</option>
            <option value="flagged">Flagged</option>
          </Select>
        </Field>

        <Field>
          Date
          <Select value={dateValue} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="">All dates</option>
            {DATE_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {DATE_PRESET_LABELS[preset]}
              </option>
            ))}
            {filters.date && <option value={dateValue}>{formatDate(filters.date)}</option>}
          </Select>
        </Field>

        <Field>
          Checklist
          <Select value={filters.issue ?? ''} onChange={(e) => setFilter('issue', e.target.value)}>
            <option value="">Any</option>
            <option value="any">With issues</option>
            {checklistGroups.map((group) => (
              <optgroup key={group.title} label={`"No" on: ${group.title}`}>
                {group.items.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>
      </FilterPanel>

      <ResultBar>
        <Hint>{countText}</Hint>
        {hasFilters && (
          <ClearFiltersButton type="button" onClick={() => setSearchParams({}, { replace: true })}>
            Clear filters
          </ClearFiltersButton>
        )}
      </ResultBar>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <DataTable
        columns={columns}
        rows={submissions ?? []}
        rowKey={(submission) => submission.id}
        // state.back = this list's URL with its filters, so the detail page's
        // "Back to my submissions" returns to the same filtered list.
        onRowClick={(submission) =>
          navigate(`/my-submissions/${submission.id}`, { state: { back: listUrl } })
        }
        rowLabel={(submission) => `Open form: ${submission.site?.name}, ${formatDate(submission.work_date)}`}
        emptyMessage={
          loading || error
            ? undefined
            : hasFilters
              ? 'No forms match these filters.'
              : "You haven't submitted any forms yet."
        }
      />
    </ListPage>
  )
}

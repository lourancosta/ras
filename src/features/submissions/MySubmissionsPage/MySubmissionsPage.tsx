import { Link, useLocation, useMatch, useNavigate } from 'react-router'
import { FilePlus } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { can } from '../../../lib/permissions'
import { DataTable, type Column } from '../../../components/DataTable/DataTable'
import { FilterPanel } from '../../../components/FilterPanel/FilterPanel'
import { NewSubmissionModal } from '../components/NewSubmissionModal/NewSubmissionModal'
import { StatusBadge } from '../components/StatusBadge/StatusBadge'
import { StatusSelect } from '../components/StatusSelect/StatusSelect'
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
import { useUrlFilters } from '../../../lib/useUrlFilters'
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
// /my-submissions/new shows this same page with the new form open in a modal on top, so
// the dashboard can link to it, Back closes it and a refresh keeps it open.
export function MySubmissionsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const userId = profile?.id
  const today = todayInVancouver()
  const canCreate = can(profile?.role, 'submissions.create')
  const location = useLocation()
  const newFormOpen = useMatch('/my-submissions/new') !== null && canCreate

  // Filters live in the URL (useUrlFilters; rules in myFilters.ts), so the dashboard can
  // link straight to a filtered list. No filter state here.
  const { params, key: filterKey, hasFilters, activeCount, setFilter, setFilters, clear } = useUrlFilters()
  const filters = parseMyFilters(params)
  // This list with its filters (not `listUrl`: on /my-submissions/new that would include "/new").
  const listUrl = `/my-submissions${location.search}`
  // Opening the form keeps the filters in the URL; `fromList` tells closing it to go Back.
  const newFormLink = { pathname: '/my-submissions/new', search: location.search }

  // Back if we opened it from here (so Back afterwards doesn't reopen it), otherwise
  // (opened from a link or a refresh) replace /new with the list.
  function closeNewForm() {
    if ((location.state as { fromList?: boolean } | null)?.fromList) navigate(-1)
    else navigate(listUrl, { replace: true })
  }

  // Site options, once. If it fails, the dropdown only has "All sites" (the list still works).
  const { data: sites } = useAsync('sites', fetchSiteOptions, 'Loading sites failed.')

  // Daily reminder: its own small query, so it's right whatever the filters show.
  // null key until the user is known; if it fails: no reminder rather than a wrong one.
  // `userId!`: the request only runs when the key isn't null, i.e. when userId is set.
  const { data: submittedToday, reload: reloadToday } = useAsync(
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

  // A new form was saved: show it in the list and update the reminder.
  function handleSubmitted() {
    list.reload()
    reloadToday()
  }
  const submissions = list.data

  // The date dropdown covers two parameters: a preset (`period`) or one exact day
  // (`date`, only when you came from a dashboard chart bar). Picking one clears the other.
  const dateValue = filters.date ? `day:${filters.date}` : filters.period ?? ''
  function setDateFilter(value: string) {
    if (value.startsWith('day:')) return // the exact day is already selected
    setFilters({ date: null, period: value })
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
          <Button as={Link} to={newFormLink} state={{ fromList: true }}>
            <FilePlus size={18} aria-hidden="true" /> New form
          </Button>
        )}
      </PageHeader>

      {newFormOpen && <NewSubmissionModal onClose={closeNewForm} onSubmitted={handleSubmitted} />}

      {/* Reminder: a form is expected before starting work each day. */}
      {canCreate && submittedToday === false && (
        <Reminder>
          <span>You haven't submitted today's safety form yet.</span>
          <Button as={Link} to={newFormLink} state={{ fromList: true }}>
            Fill in today's form
          </Button>
        </Reminder>
      )}

      {/* activeCount: one per filter set in the URL ("Show filters (2)" on phones). */}
      <FilterPanel activeCount={activeCount}>
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
          <StatusSelect value={filters.status} onChange={(value) => setFilter('status', value)} />
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
          <ClearFiltersButton type="button" onClick={clear}>
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

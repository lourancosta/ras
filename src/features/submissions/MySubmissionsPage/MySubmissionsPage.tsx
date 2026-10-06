import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AlertTriangle, Camera, CheckCircle2, ChevronRight, FilePlus } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { can } from '../../../lib/permissions'
import { StatusBadge } from '../components/StatusBadge/StatusBadge'
import {
  Button,
  ClearFiltersButton,
  ErrorMessage,
  Field,
  FilterCard,
  Hint,
  PageTitle,
  ResultBar,
  Select,
} from '../../../components/ui'
import { checklistGroups, countIssues } from '../checklist'
import { formatDate, todayInVancouver } from '../../../lib/dates'
import {
  fetchMySubmissions,
  fetchSiteOptions,
  fetchSubmittedToday,
  MY_ROW_LIMIT,
  type MySubmission,
} from '../submissions'
import {
  DATE_PRESET_LABELS,
  DATE_PRESETS,
  dateRangeFor,
  parseMyFilters,
} from '../myFilters'
import {
  Container,
  Header,
  Reminder,
  List,
  Row,
  RowMain,
  RowTop,
  RowInfo,
  Ok,
  Issue,
} from './MySubmissionsPage.styles'

type SiteOption = Awaited<ReturnType<typeof fetchSiteOptions>>[number]

// Outcome of one load, tagged with the filters it was for (see `loading` below).
type Result = { key: string; rows: MySubmission[]; error: string | null }

// /my-submissions: the framer's home page. Lists their forms, newest first, with filters
// (site, status, date, checklist), and is the way to start a new one.
export function MySubmissionsPage() {
  const { profile } = useAuth()
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

  const [sites, setSites] = useState<SiteOption[] | null>(null)
  const [submittedToday, setSubmittedToday] = useState<boolean | null>(null) // null = unknown
  const [result, setResult] = useState<Result | null>(null)

  // Site options, once.
  useEffect(() => {
    fetchSiteOptions()
      .then(setSites)
      .catch((err) => console.error('Loading sites failed:', err)) // the list still works without it
  }, [])

  // Daily reminder: its own small query, so it's right whatever the filters show.
  useEffect(() => {
    if (!userId) return
    fetchSubmittedToday(userId, today)
      .then(setSubmittedToday)
      .catch((err) => console.error('Checking today failed:', err)) // no reminder rather than a wrong one
  }, [userId, today])

  // Forms, every time the filters (URL) change.
  const { siteId, status, issue } = filters
  const { from, to } = dateRangeFor(filters, today)
  useEffect(() => {
    if (!userId) return
    let ignore = false // a newer filter change happened: drop this older response
    fetchMySubmissions(userId, { siteId, status, from, to, issue })
      .then((rows) => {
        if (!ignore) setResult({ key: filterKey, rows, error: null })
      })
      .catch((err) => {
        console.error('Loading submissions failed:', err)
        if (!ignore) {
          setResult({ key: filterKey, rows: [], error: 'Could not load your submissions. Please refresh the page.' })
        }
      })
    return () => {
      ignore = true
    }
  }, [userId, siteId, status, from, to, issue, filterKey])

  // Derived: loading until we have a result for the *current* filters.
  const loading = result?.key !== filterKey
  const submissions = loading ? null : result.rows
  const error = loading ? null : result.error

  // Set or remove one URL parameter, keeping the others.
  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    setSearchParams(next, { replace: true })
  }

  // The date dropdown covers two parameters: a preset (`period`) or one exact day
  // (`date`, only when you came from a dashboard chart bar). Picking one clears the other.
  const dateValue = filters.date ? `day:${filters.date}` : (filters.period ?? '')
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
    <Container>
      <Header>
        <PageTitle>My submissions</PageTitle>
        {canCreate && (
          <Button as={Link} to="/my-submissions/new">
            <FilePlus size={18} aria-hidden="true" /> New form
          </Button>
        )}
      </Header>

      {/* Reminder: a form is expected before starting work each day. */}
      {canCreate && submittedToday === false && (
        <Reminder>
          <span>You haven't submitted today's safety form yet.</span>
          <Button as={Link} to="/my-submissions/new">
            Fill in today's form
          </Button>
        </Reminder>
      )}

      <FilterCard>
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
      </FilterCard>

      <ResultBar>
        <Hint>{countText}</Hint>
        {hasFilters && (
          <ClearFiltersButton type="button" onClick={() => setSearchParams({}, { replace: true })}>
            Clear filters
          </ClearFiltersButton>
        )}
      </ResultBar>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!loading && !error && count === 0 && (
        <Hint>{hasFilters ? 'No forms match these filters.' : "You haven't submitted any forms yet."}</Hint>
      )}

      <List>
        {submissions?.map((submission) => {
          const issues = countIssues(submission)
          // `submission_photos(count)` comes back as [{ count: n }].
          const photoCount = submission.submission_photos[0]?.count ?? 0
          return (
            <li key={submission.id}>
              {/* state.back = this list's URL with its filters, so the detail page's
                  "Back to my submissions" returns to the same filtered list. */}
              <Row to={`/my-submissions/${submission.id}`} state={{ back: listUrl }}>
                <RowMain>
                  <RowTop>
                    <strong>{submission.site?.name}</strong>
                    <StatusBadge status={submission.status} />
                  </RowTop>
                  <RowInfo>
                    <span>{formatDate(submission.work_date)}</span>
                    {issues === 0 ? (
                      <Ok>
                        <CheckCircle2 size={16} aria-hidden="true" /> All checks OK
                      </Ok>
                    ) : (
                      <Issue>
                        <AlertTriangle size={16} aria-hidden="true" /> {issues} issue
                        {issues > 1 ? 's' : ''}
                      </Issue>
                    )}
                    {photoCount > 0 && (
                      <span>
                        <Camera size={16} aria-hidden="true" /> {photoCount}
                      </span>
                    )}
                  </RowInfo>
                </RowMain>
                <ChevronRight size={20} aria-hidden="true" />
              </Row>
            </li>
          )
        })}
      </List>
    </Container>
  )
}

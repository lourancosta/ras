import { useNavigate } from 'react-router'
import { AlertTriangle, CheckCircle2, ClipboardList, Flag } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { FormsPerDayChart, HorizontalBarChart } from '../components/SummaryCharts'
import { Tile, Tiles } from '../components/Tile/Tile'
import { ErrorMessage, GoodNews, Hint, PageTitle, Panel, PanelGrid, PanelTitle } from '../../../components/ui'
import { formatDate, todayInVancouver } from '../../../lib/dates'
import { fetchMySummary, SUMMARY_DAYS } from '../summary'
import type { ChecklistKey } from '../../submissions/checklist'
import { mySubmissionsLink } from '../../submissions/myFilters'
import { Container } from './PersonalDashboard.styles'
import { useAsync } from '../../../lib/useAsync'

// /dashboard (framer): the signed-in framer's own numbers, never anyone else's.
// Same layout as the admin dashboard: tiles for today, charts for the last 14 days.
// Every tile and chart bar opens My submissions with the matching filters (myFilters.ts).
export function PersonalDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const today = todayInVancouver()
  const userId = profile?.id
  // null key until the user is known (`userId!` is safe: the request only runs with a key).
  const { data: summary, error } = useAsync(
    userId ? `${userId}:${today}` : null,
    () => fetchMySummary(userId!, today),
    'Could not load your dashboard. Please refresh the page.',
  )

  return (
    <Container>
      <div>
        <PageTitle>Dashboard</PageTitle>
        <Hint>Today is {formatDate(today)}</Hint>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!error && !summary && <Hint>Loading…</Hint>}

      {summary && (
        <>
          <Tiles>
            {/* Not submitted yet: the tile goes straight to the form. */}
            <Tile
              to={summary.submittedToday ? mySubmissionsLink({ period: 'today' }) : '/my-submissions/new'}
              icon={summary.submittedToday ? CheckCircle2 : AlertTriangle}
              value={summary.submittedToday ? 'Yes' : 'No'}
              label="Submitted today"
              tone={summary.submittedToday ? 'success' : 'danger'}
            />
            <Tile
              to={mySubmissionsLink({ period: 'recent' })}
              icon={ClipboardList}
              value={String(summary.formsCount)}
              label={`Forms, last ${SUMMARY_DAYS} days`}
            />
            <Tile
              to={mySubmissionsLink({ period: 'recent', issue: 'any' })}
              icon={AlertTriangle}
              value={String(summary.issuesCount)}
              label={`Issues reported, last ${SUMMARY_DAYS} days`}
            />
            <Tile
              to={mySubmissionsLink({ status: 'flagged' })}
              icon={Flag}
              value={String(summary.flaggedCount)}
              label="Flagged by an admin"
              tone={summary.flaggedCount > 0 ? 'danger' : undefined}
            />
          </Tiles>

          <PanelGrid>
            <Panel>
              <PanelTitle>My forms per day</PanelTitle>
              <Hint>Last {SUMMARY_DAYS} days. Click a bar to see that day's forms.</Hint>
              <FormsPerDayChart
                data={summary.perDay}
                // Days with no forms have nothing to show.
                onBarClick={(day) => {
                  if (day.forms > 0) navigate(mySubmissionsLink({ date: day.date }))
                }}
              />
            </Panel>

            <Panel>
              <PanelTitle>Issues by checklist item</PanelTitle>
              <Hint>Times answered "No", last {SUMMARY_DAYS} days. Click a bar to see those forms.</Hint>
              {/* An all-zero chart says nothing: show a clear message instead. */}
              {summary.issuesCount === 0 ? (
                <GoodNews>
                  <CheckCircle2 size={18} aria-hidden="true" /> No issues reported.
                </GoodNews>
              ) : (
                <HorizontalBarChart
                  data={summary.perItem}
                  valueLabel="Times"
                  onBarClick={(item) => {
                    // id = the checklist item's key (see fetchMySummary).
                    if (item.count > 0) {
                      navigate(mySubmissionsLink({ period: 'recent', issue: item.id as ChecklistKey }))
                    }
                  }}
                />
              )}
            </Panel>
          </PanelGrid>
        </>
      )}
    </Container>
  )
}

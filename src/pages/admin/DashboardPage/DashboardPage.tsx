import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AlertTriangle, CheckCircle2, Clock, Flag, Users } from 'lucide-react'
import { FormsPerDayChart, HorizontalBarChart } from '../../../components/SummaryCharts'
import { Tile, Tiles } from '../../../components/Tile/Tile'
import {
  ErrorMessage,
  GoodNews,
  Hint,
  PageTitle,
  Panel,
  PanelGrid,
  PanelTitle,
} from '../../../components/ui'
import { formatDate, todayInVancouver } from '../../../lib/dates'
import { fetchSummary, SUMMARY_DAYS, type Summary } from '../../../lib/summary'
import { Container, NameList, SiteGroup } from './DashboardPage.styles'

// /dashboard (admin): today's submissions at a glance + the last 14 days in charts.
export function DashboardPage() {
  const today = todayInVancouver()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSummary(today)
      .then(setSummary)
      .catch((err) => {
        console.error('Loading summary failed:', err)
        setError('Could not load the summary. Please refresh the page.')
      })
  }, [today])

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
          {/* Each tile opens the submissions table with the matching filter. */}
          <Tiles>
            <Tile
              to={`/submissions?from=${today}&to=${today}`}
              icon={Users}
              value={`${summary.submittedTodayCount} / ${summary.framerCount}`}
              label="Workers submitted today"
            />
            <Tile
              to={`/submissions?from=${today}&to=${today}`}
              icon={summary.notSubmittedToday.length > 0 ? AlertTriangle : CheckCircle2}
              value={String(summary.notSubmittedToday.length)}
              label="Not submitted today"
              tone={summary.notSubmittedToday.length > 0 ? 'danger' : 'success'}
            />
            <Tile
              to="/submissions?status=submitted"
              icon={Clock}
              value={String(summary.pendingCount)}
              label="Pending review"
            />
            <Tile
              to="/submissions?status=flagged"
              icon={Flag}
              value={String(summary.flaggedCount)}
              label="Flagged"
              tone={summary.flaggedCount > 0 ? 'danger' : undefined}
            />
          </Tiles>

          <PanelGrid>
            <Panel>
              <PanelTitle>Not submitted today</PanelTitle>
              {summary.notSubmittedToday.length === 0 ? (
                <GoodNews>
                  <CheckCircle2 size={18} aria-hidden="true" /> Everyone has submitted today.
                </GoodNews>
              ) : (
                <NameList>
                  {summary.notSubmittedToday.map((framer) => (
                    <li key={framer.id}>
                      {/* Opens that worker's forms in the submissions table. */}
                      <Link to={`/submissions?worker=${framer.id}`}>{framer.full_name}</Link>
                    </li>
                  ))}
                </NameList>
              )}
            </Panel>

            <Panel>
              <PanelTitle>Submitted today, by site</PanelTitle>
              {summary.todayBySite.length === 0 ? (
                <Hint>No forms submitted yet today.</Hint>
              ) : (
                summary.todayBySite.map((group) => (
                  <SiteGroup key={group.site}>
                    <strong>
                      {group.site} ({group.workers.length})
                    </strong>
                    <Hint>{group.workers.join(', ')}</Hint>
                  </SiteGroup>
                ))
              )}
            </Panel>

            <Panel>
              <PanelTitle>Forms per site</PanelTitle>
              <Hint>Last {SUMMARY_DAYS} days</Hint>
              <HorizontalBarChart data={summary.perSite} valueLabel="Forms" />
            </Panel>

            <Panel>
              <PanelTitle>Forms per day</PanelTitle>
              <Hint>Last {SUMMARY_DAYS} days, all sites</Hint>
              <FormsPerDayChart data={summary.perDay} />
            </Panel>
          </PanelGrid>
        </>
      )}
    </Container>
  )
}

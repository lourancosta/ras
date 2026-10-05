import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Flag } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { FormsPerDayChart, HorizontalBarChart } from '../components/SummaryCharts'
import { Tile, Tiles } from '../components/Tile/Tile'
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
import { fetchMySummary, SUMMARY_DAYS, type MySummary } from '../summary'
import { Container } from './PersonalDashboard.styles'

// /dashboard (framer): the signed-in framer's own numbers, never anyone else's.
// Same layout as the admin dashboard: tiles for today, charts for the last 14 days.
export function PersonalDashboard() {
  const { profile } = useAuth()
  const today = todayInVancouver()
  const [summary, setSummary] = useState<MySummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const userId = profile?.id
  useEffect(() => {
    if (!userId) return
    fetchMySummary(userId, today)
      .then(setSummary)
      .catch((err) => {
        console.error('Loading my summary failed:', err)
        setError('Could not load your dashboard. Please refresh the page.')
      })
  }, [userId, today])

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
              to={summary.submittedToday ? '/my-submissions' : '/my-submissions/new'}
              icon={summary.submittedToday ? CheckCircle2 : AlertTriangle}
              value={summary.submittedToday ? 'Yes' : 'No'}
              label="Submitted today"
              tone={summary.submittedToday ? 'success' : 'danger'}
            />
            <Tile
              to="/my-submissions"
              icon={ClipboardList}
              value={String(summary.formsCount)}
              label={`Forms, last ${SUMMARY_DAYS} days`}
            />
            <Tile
              to="/my-submissions"
              icon={AlertTriangle}
              value={String(summary.issuesCount)}
              label={`Issues reported, last ${SUMMARY_DAYS} days`}
            />
            <Tile
              to="/my-submissions"
              icon={Flag}
              value={String(summary.flaggedCount)}
              label="Flagged by an admin"
              tone={summary.flaggedCount > 0 ? 'danger' : undefined}
            />
          </Tiles>

          <PanelGrid>
            <Panel>
              <PanelTitle>My forms per day</PanelTitle>
              <Hint>Last {SUMMARY_DAYS} days</Hint>
              <FormsPerDayChart data={summary.perDay} />
            </Panel>

            <Panel>
              <PanelTitle>Issues by checklist item</PanelTitle>
              <Hint>Times answered "No", last {SUMMARY_DAYS} days</Hint>
              {/* An all-zero chart says nothing: show a clear message instead. */}
              {summary.issuesCount === 0 ? (
                <GoodNews>
                  <CheckCircle2 size={18} aria-hidden="true" /> No issues reported.
                </GoodNews>
              ) : (
                <HorizontalBarChart data={summary.perItem} valueLabel="Times" />
              )}
            </Panel>
          </PanelGrid>
        </>
      )}
    </Container>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AlertTriangle, CheckCircle2, Clock, Flag, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styled from 'styled-components'
import { FormsPerDayChart, FormsPerSiteChart } from '../../components/SummaryCharts'
import { Card, ErrorMessage, Hint, PageTitle } from '../../components/ui'
import { formatDate, todayInVancouver } from '../../lib/dates'
import { fetchSummary, SUMMARY_DAYS, type Summary } from '../../lib/summary'

// /admin/summary: today's submissions at a glance + the last 14 days in charts.
export function SummaryPage() {
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
        <PageTitle>Summary</PageTitle>
        <Hint>Today is {formatDate(today)}</Hint>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!error && !summary && <Hint>Loading…</Hint>}

      {summary && (
        <>
          {/* Each tile opens the dashboard table with the matching filter. */}
          <Tiles>
            <Tile
              to={`/admin?from=${today}&to=${today}`}
              icon={Users}
              value={`${summary.submittedTodayCount} / ${summary.framerCount}`}
              label="Workers submitted today"
            />
            <Tile
              to={`/admin?from=${today}&to=${today}`}
              icon={summary.notSubmittedToday.length > 0 ? AlertTriangle : CheckCircle2}
              value={String(summary.notSubmittedToday.length)}
              label="Not submitted today"
              tone={summary.notSubmittedToday.length > 0 ? 'danger' : 'success'}
            />
            <Tile
              to="/admin?status=submitted"
              icon={Clock}
              value={String(summary.pendingCount)}
              label="Pending review"
            />
            <Tile
              to="/admin?status=flagged"
              icon={Flag}
              value={String(summary.flaggedCount)}
              label="Flagged"
              tone={summary.flaggedCount > 0 ? 'danger' : undefined}
            />
          </Tiles>

          <Grid>
            <Panel>
              <PanelTitle>Not submitted today</PanelTitle>
              {summary.notSubmittedToday.length === 0 ? (
                <Good>
                  <CheckCircle2 size={18} aria-hidden="true" /> Everyone has submitted today.
                </Good>
              ) : (
                <NameList>
                  {summary.notSubmittedToday.map((framer) => (
                    <li key={framer.id}>
                      {/* Opens that worker's forms in the dashboard. */}
                      <Link to={`/admin?worker=${framer.id}`}>{framer.full_name}</Link>
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
              <FormsPerSiteChart data={summary.perSite} />
            </Panel>

            <Panel>
              <PanelTitle>Forms per day</PanelTitle>
              <Hint>Last {SUMMARY_DAYS} days, all sites</Hint>
              <FormsPerDayChart data={summary.perDay} />
            </Panel>
          </Grid>
        </>
      )}
    </Container>
  )
}

type TileProps = {
  to: string
  icon: LucideIcon
  value: string
  label: string
  tone?: 'success' | 'danger'
}

// A big number with a label. Colour is never the only signal: the icon and
// label say the same thing (good for colour-blind users).
function Tile({ to, icon: Icon, value, label, tone }: TileProps) {
  return (
    <TileLink to={to} $tone={tone}>
      <Icon size={22} aria-hidden="true" />
      <TileValue>{value}</TileValue>
      <TileLabel>{label}</TileLabel>
    </TileLink>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`

const TileLink = styled(Link)<{ $tone?: 'success' | 'danger' }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme, $tone }) => ($tone ? theme.colors[$tone] : theme.colors.brand)};
  text-decoration: none;

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.brand};
  }
`

const TileValue = styled.span`
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.1;
`

const TileLabel = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`

// Two columns on wide screens, one on phones.
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const Panel = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  min-width: 0; /* lets the chart shrink with the card */
`

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.brand};
`

const Good = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
`

const NameList = styled.ul`
  margin: 0;
  padding-left: 20px;

  a {
    color: ${({ theme }) => theme.colors.text};
  }
`

const SiteGroup = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`

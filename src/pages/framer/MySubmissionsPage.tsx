import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AlertTriangle, Camera, CheckCircle2, ChevronRight } from 'lucide-react'
import styled from 'styled-components'
import { useAuth } from '../../auth/auth-context'
import { StatusBadge } from '../../components/StatusBadge'
import { Button, Card, ErrorMessage, Hint, PageTitle } from '../../components/ui'
import { countIssues } from '../../lib/checklist'
import { formatDate, todayInVancouver } from '../../lib/dates'
import { fetchMySubmissions, type MySubmission } from '../../lib/submissions'

export function MySubmissionsPage() {
  const { profile } = useAuth()
  // null = loading.
  const [submissions, setSubmissions] = useState<MySubmission[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const userId = profile?.id
  useEffect(() => {
    if (!userId) return
    fetchMySubmissions(userId)
      .then(setSubmissions)
      .catch((err) => {
        console.error('Loading submissions failed:', err)
        setError('Could not load your forms. Please refresh the page.')
      })
  }, [userId])

  const today = todayInVancouver()
  const submittedToday = submissions?.some((s) => s.work_date === today) ?? false

  return (
    <Container>
      <PageTitle>My forms</PageTitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!error && submissions === null && <Hint>Loading…</Hint>}

      {/* Reminder: a form is expected before starting work each day. */}
      {submissions && !submittedToday && (
        <Reminder>
          <span>You haven't submitted today's safety form yet.</span>
          <Button as={Link} to="/new">
            Fill in today's form
          </Button>
        </Reminder>
      )}

      {submissions?.length === 0 && <Hint>You haven't submitted any forms yet.</Hint>}

      <List>
        {submissions?.map((submission) => {
          const issues = countIssues(submission)
          // `submission_photos(count)` comes back as [{ count: n }].
          const photoCount = submission.submission_photos[0]?.count ?? 0
          return (
            <li key={submission.id}>
              <Row to={`/forms/${submission.id}`}>
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

const Container = styled.div`
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Reminder = styled(Card)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-left: 4px solid ${({ theme }) => theme.colors.accent};
  font-weight: 600;
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

// The whole card is the link (big tap target on phones).
const Row = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  color: inherit;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.brand};
  }
`

const RowMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const RowTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const RowInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
`

const Ok = styled.span`
  color: ${({ theme }) => theme.colors.success};
`

const Issue = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 600;
`

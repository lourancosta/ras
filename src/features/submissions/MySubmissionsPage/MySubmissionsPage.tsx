import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AlertTriangle, Camera, CheckCircle2, ChevronRight, FilePlus } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { can } from '../../../lib/permissions'
import { StatusBadge } from '../components/StatusBadge/StatusBadge'
import { Button, ErrorMessage, Hint, PageTitle } from '../../../components/ui'
import { countIssues } from '../checklist'
import { formatDate, todayInVancouver } from '../../../lib/dates'
import { fetchMySubmissions, type MySubmission } from '../submissions'
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

// /my-submissions: the framer's home page. Lists all their forms, newest first, and is the way
// to start a new one (there's no separate menu item for it).
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
        setError('Could not load your submissions. Please refresh the page.')
      })
  }, [userId])

  const today = todayInVancouver()
  const submittedToday = submissions?.some((s) => s.work_date === today) ?? false
  const canCreate = can(profile?.role, 'submissions.create')

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

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!error && submissions === null && <Hint>Loading…</Hint>}

      {/* Reminder: a form is expected before starting work each day. */}
      {canCreate && submissions && !submittedToday && (
        <Reminder>
          <span>You haven't submitted today's safety form yet.</span>
          <Button as={Link} to="/my-submissions/new">
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
              <Row to={`/my-submissions/${submission.id}`}>
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

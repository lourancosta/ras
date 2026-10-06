import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { useAuth } from '../../../auth/auth-context'
import { can } from '../../../../lib/permissions'
import { checklistGroups } from '../../checklist'
import { formatDate, formatDateTime } from '../../../../lib/dates'
import { fetchSubmissionDetail, type SubmissionDetailData } from '../../submissions'
import { ReviewPanel, type ReviewUpdate } from '../ReviewPanel/ReviewPanel'
import { StatusBadge } from '../StatusBadge/StatusBadge'
import { ErrorMessage, Hint } from '../../../../components/ui'
import {
  Wrapper,
  Section,
  HeaderRow,
  Title,
  Meta,
  SectionTitle,
  List,
  Item,
  Answer,
  Notes,
  PhotoGrid,
} from './SubmissionDetail.styles'

type SubmissionDetailProps = {
  id: string
  // false = never show the review panel (the review queue has its own buttons).
  showReviewPanel?: boolean
}

// Loads and shows one submission: header, checklist answers, notes and photos.
// Used by both detail pages and the review queue; users with 'submissions.review' also
// get the review actions. Render it with key={id} so a different id starts with fresh state.
export function SubmissionDetail({ id, showReviewPanel = true }: SubmissionDetailProps) {
  const { profile } = useAuth()
  const canReview = showReviewPanel && can(profile?.role, 'submissions.review')
  // undefined = loading, null = not found / not allowed.
  const [data, setData] = useState<SubmissionDetailData | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubmissionDetail(id)
      .then(setData)
      .catch((err) => {
        console.error('Loading submission failed:', err)
        setError('Could not load this form. Please refresh the page.')
      })
  }, [id])

  if (error) return <ErrorMessage>{error}</ErrorMessage>
  if (data === undefined) return <Hint>Loading…</Hint>
  if (data === null) return <ErrorMessage>Form not found.</ErrorMessage>

  const { submission, photos } = data

  // After a review, update the data we already have instead of reloading
  // (reloading would also re-create the photo links).
  function handleReviewed({ reviewerName, ...saved }: ReviewUpdate) {
    setData((current) => {
      if (!current) return current
      const submission = { ...current.submission, ...saved, reviewer: { full_name: reviewerName } }
      return { ...current, submission }
    })
  }

  return (
    <Wrapper>
      <Section>
        <HeaderRow>
          <Title>{submission.site?.name}</Title>
          <StatusBadge status={submission.status} />
        </HeaderRow>
        <Meta>
          <span>
            <strong>Date:</strong> {formatDate(submission.work_date)}
          </span>
          <span>
            <strong>Worker:</strong> {submission.worker?.full_name}
          </span>
          <span>
            <strong>Submitted:</strong> {formatDateTime(submission.created_at)}
          </span>
          {submission.reviewed_at && (
            <span>
              <strong>Reviewed:</strong> {formatDateTime(submission.reviewed_at)}
              {/* Only admins can read the reviewer's name (profiles RLS). */}
              {submission.reviewer && ` by ${submission.reviewer.full_name}`}
            </span>
          )}
        </Meta>
      </Section>

      {canReview && (
        <ReviewPanel
          submissionId={submission.id}
          status={submission.status}
          onReviewed={handleReviewed}
        />
      )}

      {checklistGroups.map((group) => (
        <Section key={group.title}>
          <SectionTitle>{group.title}</SectionTitle>
          <List>
            {group.items.map((item) => {
              const ok = submission[item.key]
              return (
                <Item key={item.key}>
                  <span>{item.label}</span>
                  <Answer $ok={ok}>
                    {ok ? <Check size={18} aria-hidden="true" /> : <X size={18} aria-hidden="true" />}
                    {ok ? 'Yes' : 'No'}
                  </Answer>
                </Item>
              )
            })}
          </List>
        </Section>
      ))}

      <Section>
        <SectionTitle>Notes</SectionTitle>
        {submission.notes ? <Notes>{submission.notes}</Notes> : <Hint>No notes.</Hint>}
      </Section>

      <Section>
        <SectionTitle>Photos</SectionTitle>
        {photos.length === 0 ? (
          <Hint>No photos.</Hint>
        ) : (
          <>
            <PhotoGrid>
              {photos.map((photo, index) => (
                // Opens the full-size photo in a new tab.
                <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
                  <img src={photo.url} alt={`Photo ${index + 1} of ${photos.length}`} />
                </a>
              ))}
            </PhotoGrid>
            <Hint>Tap a photo to open it full size. Links expire after 1 hour (reload the page).</Hint>
          </>
        )}
      </Section>
    </Wrapper>
  )
}

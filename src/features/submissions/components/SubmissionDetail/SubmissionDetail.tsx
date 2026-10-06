import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useAuth } from '../../../auth/auth-context'
import { can } from '../../../../lib/permissions'
import { checklistGroups } from '../../checklist'
import { formatDate, formatDateTime } from '../../../../lib/dates'
import { useAsync } from '../../../../lib/useAsync'
import { fetchSubmissionDetail } from '../../submissions'
import { PhotoViewer } from '../../../../components/PhotoViewer/PhotoViewer'
import { ReviewPanel, type ReviewUpdate } from '../ReviewPanel/ReviewPanel'
import { StatusBadge } from '../StatusBadge/StatusBadge'
import { ErrorMessage, Hint } from '../../../../components/ui'
import {
  Wrapper,
  Layout,
  Area,
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
  PhotoButton,
} from './SubmissionDetail.styles'

type SubmissionDetailProps = {
  id: string
  // false = never show the review panel (the review queue has its own buttons).
  showReviewPanel?: boolean
}

// Loads and shows one submission: header, checklist answers, notes and photos.
// Wide: two columns (checklist | notes + photos); narrow: one column (see the styles).
// Used by both detail pages and the review queue; users with 'submissions.review' also
// get the review actions. Render it with key={id} so a different id starts with fresh state.
export function SubmissionDetail({ id, showReviewPanel = true }: SubmissionDetailProps) {
  const { profile } = useAuth()
  const canReview = showReviewPanel && can(profile?.role, 'submissions.review')
  // data: null = not found / not allowed (once loading is over).
  const { data, error, loading, setData } = useAsync(
    id,
    () => fetchSubmissionDetail(id),
    'Could not load this form. Please refresh the page.',
  )
  const [viewing, setViewing] = useState<number | null>(null) // index of the photo open full screen

  if (error) return <ErrorMessage>{error}</ErrorMessage>
  if (loading) return <Hint>Loading…</Hint>
  if (data === null) return <ErrorMessage>Form not found.</ErrorMessage>

  const { submission, photos } = data

  // After a review, update the data we already have instead of reloading
  // (reloading would also re-create the photo links).
  function handleReviewed({ reviewerName, ...saved }: ReviewUpdate) {
    setData((current) => {
      if (!current) return current // not found: nothing to update
      const submission = { ...current.submission, ...saved, reviewer: { full_name: reviewerName } }
      return { ...current, submission }
    })
  }

  return (
    <Wrapper>
      <Layout>
        <Area $area="header">
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
        </Area>

        {canReview && (
          <Area $area="review">
            <ReviewPanel
              submissionId={submission.id}
              status={submission.status}
              onReviewed={handleReviewed}
            />
          </Area>
        )}

        <Area $area="checks">
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
        </Area>

        <Area $area="media">
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
                    <PhotoButton
                      key={photo.id}
                      type="button"
                      onClick={() => setViewing(index)}
                      aria-label={`Open photo ${index + 1} of ${photos.length}`}
                    >
                      <img src={photo.url} alt="" />
                    </PhotoButton>
                  ))}
                </PhotoGrid>
                <Hint>Tap a photo to see it full screen. Links expire after 1 hour (reload the page).</Hint>
                {viewing !== null && (
                  <PhotoViewer photos={photos} startIndex={viewing} onClose={() => setViewing(null)} />
                )}
              </>
            )}
          </Section>
        </Area>
      </Layout>
    </Wrapper>
  )
}

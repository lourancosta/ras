import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import styled from 'styled-components'
import { checklistGroups } from '../lib/checklist'
import { formatDate, formatDateTime } from '../lib/dates'
import { fetchSubmissionDetail, type SubmissionDetailData } from '../lib/submissions'
import { ReviewPanel, type ReviewUpdate } from './ReviewPanel'
import { StatusBadge } from './StatusBadge'
import { Card, ErrorMessage, Hint } from './ui'

// Loads and shows one submission: header, checklist answers, notes and photos.
// Used by the framer's and the admin's detail pages; `canReview` adds the admin's
// review actions. Render it with key={id} so a different id starts with fresh state.
export function SubmissionDetail({ id, canReview = false }: { id: string; canReview?: boolean }) {
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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Section = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.brand};
`

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.95rem;
`

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.brand};
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

const Item = styled.li`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`

const Answer = styled.span<{ $ok: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: ${({ theme, $ok }) => ($ok ? theme.colors.success : theme.colors.danger)};
`

// pre-wrap keeps the line breaks the framer typed.
const Notes = styled.p`
  margin: 0;
  white-space: pre-wrap;
`

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;

  img {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radius};
  }
`

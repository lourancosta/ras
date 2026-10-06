import { useState } from 'react'
import { useAuth } from '../../../auth/auth-context'
import type { Enums } from '../../../../lib/database.types'
import { reviewSubmission } from '../../submissions'
import { ButtonPair, ErrorMessage, Hint, SuccessMessage } from '../../../../components/ui'
import { DecisionButtons, type ReviewDecision } from '../DecisionButtons/DecisionButtons'
import { Panel, Title } from './ReviewPanel.styles'

type ReviewStatus = ReviewDecision

// What changed, so the parent can update the page without reloading.
export type ReviewUpdate = {
  status: Enums<'submission_status'>
  reviewed_by: string | null
  reviewed_at: string | null
  reviewerName: string
}

type ReviewPanelProps = {
  submissionId: string
  status: Enums<'submission_status'>
  onReviewed: (update: ReviewUpdate) => void
}

const DONE_MESSAGE: Record<ReviewStatus, string> = {
  reviewed: 'Reviewed.',
  flagged: 'Flagged for follow-up.',
}

// Admin-only actions on a form: review it (all fine) or flag it (needs follow-up).
// Same Flag / Review buttons as the review queue (DecisionButtons): the saved status is solid.
// The status can be changed again later, e.g. flagged -> reviewed once the issue is fixed.
export function ReviewPanel({ submissionId, status, onReviewed }: ReviewPanelProps) {
  const { profile } = useAuth()
  const [saving, setSaving] = useState<ReviewStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleReview(newStatus: ReviewStatus) {
    if (!profile) return
    setError(null)
    setMessage(null)
    setSaving(newStatus)
    try {
      const saved = await reviewSubmission(submissionId, newStatus, profile.id)
      onReviewed({ ...saved, reviewerName: profile.full_name })
      setMessage(DONE_MESSAGE[newStatus])
    } catch (err) {
      console.error('Review failed:', err)
      setError('Could not save the review. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <Panel>
      <Title>Review</Title>
      <Hint>
        Review it if everything is fine, or flag it if something needs follow-up.
      </Hint>
      <ButtonPair>
        <DecisionButtons
          selected={status === 'submitted' ? undefined : status}
          saving={saving}
          onChoose={handleReview}
        />
      </ButtonPair>
      {message && <SuccessMessage>{message}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Panel>
  )
}

import { useState } from 'react'
import { CheckCircle2, Flag } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import type { Enums } from '../../lib/database.types'
import { reviewSubmission } from '../../lib/submissions'
import { ErrorMessage, Hint, SuccessMessage } from '../ui'
import { Panel, Title, Actions, ReviewedButton, FlagButton } from './ReviewPanel.styles'

type ReviewStatus = Exclude<Enums<'submission_status'>, 'submitted'>

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
  reviewed: 'Marked as reviewed.',
  flagged: 'Flagged for follow-up.',
}

// Admin-only actions on a form: mark it reviewed (all fine) or flag it (needs follow-up).
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
        Mark as reviewed if everything is fine, or flag it if something needs follow-up.
      </Hint>
      <Actions>
        <ReviewedButton
          type="button"
          onClick={() => handleReview('reviewed')}
          // The current status is disabled: clicking it again would change nothing.
          disabled={saving !== null || status === 'reviewed'}
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          {saving === 'reviewed' ? 'Saving…' : status === 'reviewed' ? 'Reviewed' : 'Mark reviewed'}
        </ReviewedButton>
        <FlagButton
          type="button"
          onClick={() => handleReview('flagged')}
          disabled={saving !== null || status === 'flagged'}
        >
          <Flag size={18} aria-hidden="true" />
          {saving === 'flagged' ? 'Saving…' : status === 'flagged' ? 'Flagged' : 'Flag'}
        </FlagButton>
      </Actions>
      {message && <SuccessMessage>{message}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Panel>
  )
}

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, Flag } from 'lucide-react'
import { Modal } from '../../../../components/Modal/Modal'
import { Button, ErrorMessage, Hint, SecondaryButton, SuccessMessage } from '../../../../components/ui'
import { useAuth } from '../../../auth/auth-context'
import { reviewSubmission } from '../../submissions'
import { SubmissionDetail } from '../SubmissionDetail/SubmissionDetail'
import {
  ActionsFooter,
  ButtonPair,
  Counter,
  Fill,
  DecisionButton,
  FooterRow,
  Progress,
  Summary,
  Track,
} from './ReviewQueue.styles'

type Decision = 'reviewed' | 'flagged'

// What was saved for one form, so the page behind can update its table.
export type QueueReview = {
  id: string
  status: Decision
  reviewed_by: string | null
  reviewed_at: string | null
}

type ReviewQueueProps = {
  ids: string[] // the forms to review, in order (fixed when the queue opens)
  onReviewed: (review: QueueReview) => void
  onClose: () => void
}

const DECISION_LABELS: Record<Decision, string> = { reviewed: 'Reviewed', flagged: 'Flagged' }

// Review pending forms one by one in a modal: the full form (same view as the detail
// page), "3 / 8", Flag / Review to save a decision (you stay on the form, the chosen
// button turns solid), and Previous / Next to move. After the last one: a summary.
export function ReviewQueue({ ids, onReviewed, onClose }: ReviewQueueProps) {
  const { profile } = useAuth()
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  // What was saved in this queue, per form id (a form can be changed again by going back).
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [saving, setSaving] = useState<Decision | null>(null)
  const [error, setError] = useState<string | null>(null)

  const total = ids.length
  const currentId = ids[index]
  const isLast = index === total - 1
  const saved = decisions[currentId]

  function goTo(nextIndex: number) {
    setError(null)
    if (nextIndex >= total) setFinished(true)
    else setIndex(Math.max(0, nextIndex))
  }

  // Save the decision for the current form. It doesn't move on: Next does that.
  async function saveDecision(decision: Decision) {
    if (!profile || saved === decision) return // already saved as this: nothing to do
    setSaving(decision)
    setError(null)
    try {
      const result = await reviewSubmission(currentId, decision, profile.id)
      setDecisions((current) => ({ ...current, [currentId]: decision }))
      onReviewed({ id: currentId, ...result, status: decision })
    } catch (err) {
      console.error('Review failed:', err)
      setError('Could not save the review. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  // ---- End of the queue ----
  if (finished) {
    const values = Object.values(decisions)
    const reviewed = values.filter((d) => d === 'reviewed').length
    const flagged = values.filter((d) => d === 'flagged').length
    const skipped = total - values.length
    return (
      <Modal
        title="Review queue"
        size="medium"
        onClose={onClose}
        footer={
          <FooterRow>
            <SecondaryButton type="button" onClick={() => setFinished(false)}>
              <ChevronLeft size={18} aria-hidden="true" /> Back to the queue
            </SecondaryButton>
            <Button type="button" onClick={onClose}>
              Close queue
            </Button>
          </FooterRow>
        }
      >
        <SuccessMessage>End of the queue.</SuccessMessage>
        <Summary>
          <li>
            <strong>{reviewed}</strong> marked reviewed
          </li>
          <li>
            <strong>{flagged}</strong> flagged
          </li>
          <li>
            <strong>{skipped}</strong> skipped (still pending)
          </li>
        </Summary>
      </Modal>
    )
  }

  // ---- One form ----
  const busy = saving !== null
  return (
    <Modal
      title="Review queue"
      size="medium"
      onClose={onClose}
      scrollKey={index}
      footer={
        // Save buttons first: left on wide screens, top row on phones (see ActionsFooter).
        <ActionsFooter>
          <ButtonPair>
            {/* Label: the action (Flag / Review) until chosen, then the result (Flagged / Reviewed).
                aria-pressed: screen readers say which one is chosen (the solid one). */}
            <DecisionButton
              type="button"
              $tone="danger"
              $selected={saved === 'flagged'}
              aria-pressed={saved === 'flagged'}
              onClick={() => saveDecision('flagged')}
              disabled={busy}
            >
              <Flag size={18} aria-hidden="true" />
              {saving === 'flagged' ? 'Saving…' : saved === 'flagged' ? 'Flagged' : 'Flag'}
            </DecisionButton>
            <DecisionButton
              type="button"
              $tone="brand"
              $selected={saved === 'reviewed'}
              aria-pressed={saved === 'reviewed'}
              onClick={() => saveDecision('reviewed')}
              disabled={busy}
            >
              <CheckCircle2 size={18} aria-hidden="true" />
              {saving === 'reviewed' ? 'Saving…' : saved === 'reviewed' ? 'Reviewed' : 'Review'}
            </DecisionButton>
          </ButtonPair>
          <ButtonPair>
            <SecondaryButton type="button" onClick={() => goTo(index - 1)} disabled={busy || index === 0}>
              <ChevronLeft size={18} aria-hidden="true" /> Previous
            </SecondaryButton>
            {/* Next: go on (a form with no decision stays pending). On the last one it opens the summary. */}
            <SecondaryButton type="button" onClick={() => goTo(index + 1)} disabled={busy}>
              {isLast ? 'Finish' : 'Next'} <ChevronRight size={18} aria-hidden="true" />
            </SecondaryButton>
          </ButtonPair>
        </ActionsFooter>
      }
    >
      <div>
        <Progress>
          {/* aria-live: screen readers announce the new position after each move. */}
          <Counter aria-live="polite">
            {index + 1} / {total}
          </Counter>
          {saved && <Hint>Saved in this queue as {DECISION_LABELS[saved]}</Hint>}
        </Progress>
        <Track aria-hidden="true">
          <Fill $percent={((index + 1) / total) * 100} />
        </Track>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* key: a new id remounts the detail, so the previous form's data is never shown.
          showReviewPanel={false}: the footer buttons are the review actions here. */}
      <SubmissionDetail key={currentId} id={currentId} showReviewPanel={false} />
    </Modal>
  )
}

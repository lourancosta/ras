import { CheckCircle2, Flag } from 'lucide-react'
import { STATUS_LABELS, type ReviewDecision } from '../../status'
import { DecisionButton } from './DecisionButtons.styles'

type DecisionButtonsProps = {
  selected: ReviewDecision | undefined // the saved decision; undefined = none yet (pending)
  saving: ReviewDecision | null // the one being saved right now
  onChoose: (decision: ReviewDecision) => void
}

// The Flag / Review pair, shared by the detail page's review panel and the review queue.
// Label: the action (Flag / Review) until chosen, then the result (Flagged / Reviewed).
// Returns the two buttons without a wrapper, so each parent lays them out its own way.
export function DecisionButtons({ selected, saving, onChoose }: DecisionButtonsProps) {
  const busy = saving !== null

  // Clicking the solid one does nothing: it's already saved as that.
  function choose(decision: ReviewDecision) {
    if (decision !== selected) onChoose(decision)
  }

  return (
    <>
      {/* aria-pressed: screen readers say which one is chosen (the solid one). */}
      <DecisionButton
        type="button"
        $tone="danger"
        $selected={selected === 'flagged'}
        aria-pressed={selected === 'flagged'}
        onClick={() => choose('flagged')}
        disabled={busy}
      >
        <Flag size={18} aria-hidden="true" />
        {saving === 'flagged' ? 'Saving…' : selected === 'flagged' ? STATUS_LABELS.flagged : 'Flag'}
      </DecisionButton>
      <DecisionButton
        type="button"
        $tone="brand"
        $selected={selected === 'reviewed'}
        aria-pressed={selected === 'reviewed'}
        onClick={() => choose('reviewed')}
        disabled={busy}
      >
        <CheckCircle2 size={18} aria-hidden="true" />
        {saving === 'reviewed' ? 'Saving…' : selected === 'reviewed' ? STATUS_LABELS.reviewed : 'Review'}
      </DecisionButton>
    </>
  )
}

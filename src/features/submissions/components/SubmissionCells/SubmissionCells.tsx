import { AlertTriangle, Camera, CheckCircle2 } from 'lucide-react'
import { countIssues, type ChecklistAnswers } from '../../checklist'
import { IconText, Issue, Ok } from './SubmissionCells.styles'

// Small pieces shown in both submission lists (table cells and phone cards).

// "✓ All checks OK" in green, or "⚠ N issues" in red (N = items answered "No").
// Icon + text, so colour is never the only signal.
export function ChecklistResult({ answers }: { answers: ChecklistAnswers }) {
  const issues = countIssues(answers)
  return issues === 0 ? (
    <Ok>
      <CheckCircle2 size={16} aria-hidden="true" /> All checks OK
    </Ok>
  ) : (
    <Issue>
      <AlertTriangle size={16} aria-hidden="true" /> {issues} issue{issues > 1 ? 's' : ''}
    </Issue>
  )
}

// "📷 2". Lists only render it when there are photos (see photoCountOf), so a card
// leaves it out instead of showing an empty gap.
export function PhotoCount({ count }: { count: number }) {
  return (
    <IconText aria-label={`${count} photo${count === 1 ? '' : 's'}`}>
      <Camera size={16} aria-hidden="true" /> {count}
    </IconText>
  )
}

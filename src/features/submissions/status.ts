// Submission review statuses: the one place for their order, labels and URL parsing.
// Used by the status badge, both filter dropdowns, the dashboard tiles and the review buttons.
import type { Enums } from '../../lib/database.types'

export type Status = Enums<'submission_status'>

// A review decision: every status except 'submitted' (pending).
export type ReviewDecision = Exclude<Status, 'submitted'>

// In lifecycle order: submitted → reviewed / flagged.
export const STATUSES: Status[] = ['submitted', 'reviewed', 'flagged']

export const STATUS_LABELS: Record<Status, string> = {
  submitted: 'Pending review',
  reviewed: 'Reviewed',
  flagged: 'Flagged',
}

// URL value -> status. Unknown values (a typo, an old link) give undefined, so they're
// ignored instead of being sent to the database.
export function parseStatus(value: string | null): Status | undefined {
  return STATUSES.find((status) => status === value)
}

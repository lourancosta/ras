import type { Enums } from '../../lib/database.types'
import { Badge } from './StatusBadge.styles'

type Status = Enums<'submission_status'>

const LABELS: Record<Status, string> = {
  submitted: 'Pending review',
  reviewed: 'Reviewed',
  flagged: 'Flagged',
}

// Review status of a form, as a small coloured pill.
export function StatusBadge({ status }: { status: Status }) {
  return <Badge $status={status}>{LABELS[status]}</Badge>
}

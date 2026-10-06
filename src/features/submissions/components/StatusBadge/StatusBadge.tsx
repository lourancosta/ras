import { STATUS_LABELS, type Status } from '../../status'
import { Badge } from './StatusBadge.styles'

// Review status of a form, as a small coloured pill.
export function StatusBadge({ status }: { status: Status }) {
  return <Badge $status={status}>{STATUS_LABELS[status]}</Badge>
}

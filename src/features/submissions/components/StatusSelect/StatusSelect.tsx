import { Select } from '../../../../components/ui'
import { STATUS_LABELS, STATUSES, type Status } from '../../status'

type StatusSelectProps = {
  value: Status | undefined // undefined = "All statuses"
  onChange: (value: string) => void // '' for "All statuses"
}

// The "Status" filter dropdown (All Submissions, My submissions). No styles of its own,
// so a single file.
export function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <Select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">All statuses</option>
      {STATUSES.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </Select>
  )
}

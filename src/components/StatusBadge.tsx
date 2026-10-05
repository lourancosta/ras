import styled, { css } from 'styled-components'
import type { Enums } from '../lib/database.types'

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

const Badge = styled.span<{ $status: Status }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;

  ${({ theme, $status }) => {
    if ($status === 'reviewed') {
      return css`
        background: ${theme.colors.successBg};
        color: ${theme.colors.success};
      `
    }
    if ($status === 'flagged') {
      return css`
        background: ${theme.colors.dangerBg};
        color: ${theme.colors.danger};
      `
    }
    return css`
      background: ${theme.colors.bg};
      color: ${theme.colors.muted};
      border: 1px solid ${theme.colors.border};
    `
  }}
`

import styled, { css } from 'styled-components'
import type { Status } from '../../status'

export const Badge = styled.span<{ $status: Status }>`
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

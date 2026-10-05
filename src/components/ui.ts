// Small shared building blocks so forms look the same everywhere.
import styled, { css } from 'styled-components'

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 24px;
`

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
`

// Shared by Input, Select and Textarea.
const fieldStyles = css`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 400;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 1px;
  }
`

export const Input = styled.input`
  ${fieldStyles}
`

export const Select = styled.select`
  ${fieldStyles}
`

export const Textarea = styled.textarea`
  ${fieldStyles}
  min-height: 100px;
  resize: vertical;
`

// Small grey helper text under a title or field.
export const Hint = styled.span`
  font-size: 0.85rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.muted};
`

// Also used as a link: <Button as={Link} to="/">, hence the flex/text-decoration rules.
export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  text-decoration: none;
  border: none;
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.brand};
  color: ${({ theme }) => theme.colors.brandText};
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`

// role="alert" makes screen readers announce the message when it appears.
export const ErrorMessage = styled.p.attrs({ role: 'alert' })`
  margin: 0;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
`

// role="status" is announced politely by screen readers (no interruption).
export const SuccessMessage = styled.p.attrs({ role: 'status' })`
  margin: 0;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.successBg};
  color: ${({ theme }) => theme.colors.success};
`

export const PageTitle = styled.h1`
  margin: 0 0 16px;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.brand};
`

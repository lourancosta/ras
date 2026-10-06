// Small shared building blocks so forms look the same everywhere.
import { Link } from 'react-router'
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
  gap: 8px; /* space between an icon and the text */
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

// Outlined version of Button, for the less important action (Cancel, "Submit another").
export const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.brand};
  border: 1px solid ${({ theme }) => theme.colors.brand};
`

// Small rounded label, e.g. Active / Inactive in the settings tables.
export const Pill = styled.span<{ $tone: 'success' | 'muted' }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ theme, $tone }) => ($tone === 'success' ? theme.colors.successBg : theme.colors.bg)};
  color: ${({ theme, $tone }) => ($tone === 'success' ? theme.colors.success : theme.colors.muted)};
  border: 1px solid ${({ theme, $tone }) => ($tone === 'success' ? 'transparent' : theme.colors.border)};
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

// "← Back to ..." link at the top of a page.
export const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.brand};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

// ---------- Dashboard panels (admin and framer dashboards) ----------

// Two columns on wide screens, one on phones.
export const PanelGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

export const Panel = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  min-width: 0; /* lets the chart shrink with the card */
`

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.brand};
`

// Green line with a check icon, e.g. "Everyone has submitted today."
export const GoodNews = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
`

// ---------- Filters (All Submissions, My submissions) ----------

// The filter dropdowns: as many columns as fit (at least 140px each), stretched to fill.
export const FilterCard = styled(Card)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  padding: 16px;
`

// "N forms" on the left, "Clear filters" on the right.
export const ResultBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
`

export const ClearFiltersButton = styled.button`
  padding: 4px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.brand};
  font-weight: 600;
  cursor: pointer;
`

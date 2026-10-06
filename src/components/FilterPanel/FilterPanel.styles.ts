import styled from 'styled-components'
import { Card } from '../ui'

// Phones: one card holding the header (the toggle) and, below it, the fields.
// overflow: hidden keeps the header's hover/focus background inside the rounded corners.
export const PanelCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`

// The panel's header row, which is also the show / hide button: same background as the
// card, full width, title on the left and the chevron on the right.
export const PanelHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.brand};
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: -2px; /* inside the card, so overflow: hidden doesn't clip it */
  }
`

export const HeaderLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`

// Turns the chevron upside down while the filters are open.
export const Chevron = styled.span<{ $open: boolean }>`
  display: inline-flex;
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  transition: transform 0.2s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

// The fields under the header, one per row, with a line separating them from the header.
export const PanelBody = styled.div`
  display: grid;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  /* display: grid would otherwise override the hidden attribute. */
  &[hidden] {
    display: none;
  }
`

import styled from 'styled-components'
import { Card } from '../../../components/ui'

// On wide screens the page is exactly as tall as the window (minus the page
// padding): title and filters stay in place and only the table rows scroll.
// On phones the page scrolls normally (a fixed-height box would leave few rows visible).
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    height: calc(100vh - 2 * ${({ theme }) => theme.pagePaddingDesktop});
    height: calc(100dvh - 2 * ${({ theme }) => theme.pagePaddingDesktop}); /* dvh: correct on tablets with toolbars */
  }
`

export const Filters = styled(Card)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  padding: 16px;
`

export const ResultBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
`

export const ClearButton = styled.button`
  padding: 4px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.brand};
  font-weight: 600;
  cursor: pointer;
`

// flex: 1 = take the height left under the filters. min-height: 0 lets it shrink
// below its content's height (flex items don't by default), so the inside can scroll.
export const TableCard = styled(Card)`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
`

// The scrolling area: rows scroll up/down, wide tables scroll sideways.
export const TableScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  /* Header row stays visible while the rows scroll under it. */
  th {
    position: sticky;
    top: 0;
    z-index: 1;
    /* A sticky cell loses its collapsed border, so the line is drawn as a shadow. */
    border-bottom: none;
    box-shadow: inset 0 -1px 0 ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`

export const ClickableRow = styled.tr`
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.bg};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: -2px;
  }
`

export const IconText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`

export const Ok = styled(IconText)`
  color: ${({ theme }) => theme.colors.success};
`

export const Issue = styled(IconText)`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 600;
`

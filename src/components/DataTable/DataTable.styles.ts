import styled from 'styled-components'
import { Card } from '../ui'

// flex: 1 = in a fixed-height page (All Submissions on wide screens) take the height
// left under the filters. min-height: 0 lets it shrink below its content's height
// (flex items don't by default), so the inside can scroll. In a normal page these
// two do nothing and the table is as tall as its rows.
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

export const EmptyMessage = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`

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

// ---------- Phone: cards instead of a table ----------

export const CardList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

// One row as a card. A <button> when the row opens something (big tap target, works
// with the keyboard), otherwise a plain <div>.
export const RowCard = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  color: inherit;
  font: inherit;
  text-align: left;

  &:is(button) {
    cursor: pointer;
  }

  &:is(button):hover,
  &:is(button):focus-visible {
    border-color: ${({ theme }) => theme.colors.brand};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`

export const CardMain = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

// Title on the left, badge on the right.
export const CardTop = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-weight: 700;
`

export const CardDetails = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
  overflow-wrap: anywhere; /* long emails wrap instead of widening the card */

  & > span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
`

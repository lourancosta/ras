import { Link } from 'react-router'
import styled from 'styled-components'
import { Card } from '../../../components/ui'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`

export const TileLink = styled(Link)<{ $tone?: 'success' | 'danger' }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme, $tone }) => ($tone ? theme.colors[$tone] : theme.colors.brand)};
  text-decoration: none;

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.brand};
  }
`

export const TileValue = styled.span`
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.1;
`

export const TileLabel = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`

// Two columns on wide screens, one on phones.
export const Grid = styled.div`
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

export const Good = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
`

export const NameList = styled.ul`
  margin: 0;
  padding-left: 20px;

  a {
    color: ${({ theme }) => theme.colors.text};
  }
`

export const SiteGroup = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`

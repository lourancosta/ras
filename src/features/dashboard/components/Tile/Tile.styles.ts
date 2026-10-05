import { Link } from 'react-router'
import styled from 'styled-components'

// Row of tiles: as many columns as fit (at least 180px each), stretched to fill.
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

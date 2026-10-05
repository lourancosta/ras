import { Link } from 'react-router'
import styled from 'styled-components'
import { Card } from '../../../components/ui'

export const Container = styled.div`
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Reminder = styled(Card)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-left: 4px solid ${({ theme }) => theme.colors.accent};
  font-weight: 600;
`

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

// The whole card is the link (big tap target on phones).
export const Row = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  color: inherit;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.brand};
  }
`

export const RowMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const RowTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const RowInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
`

export const Ok = styled.span`
  color: ${({ theme }) => theme.colors.success};
`

export const Issue = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 600;
`

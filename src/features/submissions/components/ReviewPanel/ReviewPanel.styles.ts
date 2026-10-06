import styled from 'styled-components'
import { Card } from '../../../../components/ui'

export const Panel = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-left: 4px solid ${({ theme }) => theme.colors.accent};
`

export const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.brand};
`

// Phones: text, then the buttons below. Wide screens: text on the left, buttons beside it.
export const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`

// Title + explanation, stacked.
export const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

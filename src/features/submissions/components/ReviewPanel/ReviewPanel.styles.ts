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

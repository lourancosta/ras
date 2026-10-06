import styled from 'styled-components'
import { Card } from '../../../components/ui'

// "You haven't submitted today's safety form yet" banner.
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

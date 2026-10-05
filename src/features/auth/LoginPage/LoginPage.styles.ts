import styled from 'styled-components'
import { Card } from '../../../components/ui'

export const Page = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

export const LoginCard = styled(Card)`
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 4px solid ${({ theme }) => theme.colors.accent};
`

export const Title = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.brand};
`

export const Subtitle = styled.p`
  margin: -8px 0 0;
  color: ${({ theme }) => theme.colors.muted};
`

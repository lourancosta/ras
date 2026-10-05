import styled from 'styled-components'
import { Button, Card } from '../../../components/ui'

export const Container = styled.div`
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Section = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`

export const SectionTitle = styled.h2`
  margin: 0 0 -8px;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.brand};
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

export const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.brand};
  border: 1px solid ${({ theme }) => theme.colors.brand};
`

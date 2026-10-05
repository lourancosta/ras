import { Link } from 'react-router'
import styled from 'styled-components'

export const Container = styled.div`
  max-width: 640px;
`

export const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.brand};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

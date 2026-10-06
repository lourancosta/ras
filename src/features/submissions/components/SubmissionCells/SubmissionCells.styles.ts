import styled from 'styled-components'

export const IconText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`

export const Ok = styled(IconText)`
  color: ${({ theme }) => theme.colors.success};
`

export const Issue = styled(IconText)`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 600;
`

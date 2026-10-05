import styled from 'styled-components'

export const Image = styled.img`
  height: 32px;
  display: block;
`

export const TextLogo = styled.span`
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.accent};
`

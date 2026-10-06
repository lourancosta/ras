import styled from 'styled-components'

// On wide screens the page is exactly as tall as the window (minus the page
// padding): title and filters stay in place and only the table rows scroll.
// On phones the page scrolls normally (a fixed-height box would leave few rows visible).
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    height: calc(100vh - 2 * ${({ theme }) => theme.pagePaddingDesktop});
    height: calc(100dvh - 2 * ${({ theme }) => theme.pagePaddingDesktop}); /* dvh: correct on tablets with toolbars */
  }
`

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

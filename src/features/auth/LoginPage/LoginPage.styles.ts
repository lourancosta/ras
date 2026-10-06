import styled from 'styled-components'
import { Card } from '../../../components/ui'

// Phones: one column, the brand panel (logo + short pitch) above the form.
// Wide screens: two columns filling the window, brand panel left, form right.
export const Page = styled.main`
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`

// Left column: white, so the green logo stands out, with an amber line on its edge
// (on top on phones, on the right on wide screens) separating it from the form side.
export const BrandPanel = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px 24px 24px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 4px solid ${({ theme }) => theme.colors.accent};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: 32px;
    padding: 48px;
    border-bottom: none;
    border-right: 4px solid ${({ theme }) => theme.colors.accent};
  }
`

export const FullLogo = styled.img`
  display: block;
  width: 100%;
  max-width: 120px; /* phones: small, so the form is still near the top */
  height: auto;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    max-width: 220px;
  }
`

export const Pitch = styled.div`
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    text-align: left;
  }
`

export const Headline = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.colors.brand};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.5rem;
  }
`

// What the app does, one line per role. Hidden on phones to keep the form close.
export const Features = styled.ul`
  display: none;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`

export const Feature = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.4;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: ${({ theme }) => theme.colors.brand};
  }
`

// Right column: the sign-in card, centred on the page background.
export const FormSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 32px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 48px;
  }
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

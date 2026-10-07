import styled from 'styled-components'
import { Card } from '../../../../components/ui'

export const Section = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`

export const SectionTitle = styled.h3`
  margin: 0 0 -8px;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.brand};
`

// Footer: submit on the right; after a successful submit, Close + "Submit another form".
export const FooterActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
`

// Footer with the submit button. Phones: centred, 80% wide (easy to hit with a thumb).
// Wide screens: natural width, on the right.
export const SubmitFooter = styled.div`
  display: flex;
  justify-content: center;

  & > button {
    width: 80%;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    justify-content: flex-end;

    & > button {
      width: auto;
    }
  }
`

import styled from 'styled-components'
import { Button } from '../../../../components/ui'

// "3 / 8" on the left, what was already saved for this form on the right.
export const Progress = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const Counter = styled.span`
  font-weight: 700;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.brand};
`

// Thin bar under the counter: how far through the queue you are.
export const Track = styled.div`
  height: 4px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;
`

export const Fill = styled.div<{ $percent: number }>`
  width: ${({ $percent }) => $percent}%;
  height: 100%;
  background: ${({ theme }) => theme.colors.brand};
  transition: width 0.2s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

// Summary footer: "Back to the queue" and "Close queue", wrapping on narrow screens.
export const FooterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
`

// Queue footer: two pairs of buttons. Wide screens: one row, save buttons (Flag / Reviewed)
// on the left, Previous / Next on the right. Phones: two rows, save buttons on top.
export const ActionsFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    justify-content: space-between;
  }
`

// One pair of buttons. Phones: side by side, 45% of the width each.
export const ButtonPair = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;

  & > * {
    flex: 0 0 45%;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    & > * {
      flex: 0 0 auto; /* natural width on wide screens */
    }
  }
`

// Flag / Reviewed. Not chosen yet: a light, see-through tint of its colour with coloured text.
// Chosen (saved for this form): the full colour with white text, like a normal Button.
// color-mix() blends the colour with transparent, so 15% = mostly see-through.
export const DecisionButton = styled(Button)<{ $tone: 'danger' | 'brand'; $selected: boolean }>`
  background: ${({ theme, $tone, $selected }) =>
    $selected ? theme.colors[$tone] : `color-mix(in srgb, ${theme.colors[$tone]} 15%, transparent)`};
  color: ${({ theme, $tone, $selected }) => ($selected ? theme.colors.brandText : theme.colors[$tone])};
`

// End of the queue: the totals.
export const Summary = styled.ul`
  margin: 0;
  padding-left: 20px;
  line-height: 1.8;
`

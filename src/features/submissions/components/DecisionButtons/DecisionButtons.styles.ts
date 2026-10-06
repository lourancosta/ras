import styled from 'styled-components'
import { Button } from '../../../../components/ui'

// Flag / Review. Not chosen: a light, see-through tint of its colour with coloured text.
// Chosen (the form's saved status): the full colour with white text, like a normal Button.
// color-mix() blends the colour with transparent, so 15% = mostly see-through.
export const DecisionButton = styled(Button)<{ $tone: 'danger' | 'brand'; $selected: boolean }>`
  background: ${({ theme, $tone, $selected }) =>
    $selected ? theme.colors[$tone] : `color-mix(in srgb, ${theme.colors[$tone]} 15%, transparent)`};
  color: ${({ theme, $tone, $selected }) => ($selected ? theme.colors.brandText : theme.colors[$tone])};
`

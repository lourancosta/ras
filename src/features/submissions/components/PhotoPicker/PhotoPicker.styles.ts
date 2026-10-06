import styled from 'styled-components'
import { buttonSize } from '../../../../components/ui'
import { MAX_PHOTOS } from '../../photos'

// One column per allowed photo (5), so a full set always fits in one row, on any screen.
// minmax(0, 1fr): equal columns that may shrink below the image's natural size.
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${MAX_PHOTOS}, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
`

export const Thumb = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radius};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  padding: 4px;
  border: none;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
`

export const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const AddLabel = styled.label<{ $disabled: boolean }>`
  position: relative; /* keeps the hidden input inside the label */
  display: inline-flex;
  align-items: center;
  gap: 8px;
  ${buttonSize}
  border: 1px dashed ${({ theme }) => theme.colors.brand};
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme }) => theme.colors.brand};
  font-weight: 600;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  /* Keyboard users tab to the hidden input; show the focus on the label. */
  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`

// Visually hidden but still focusable and usable (display: none would break keyboard access).
export const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
`

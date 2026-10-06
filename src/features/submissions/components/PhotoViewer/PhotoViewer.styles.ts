import styled from 'styled-components'

// The native <dialog>, stretched over the whole screen in a dark colour.
export const Dialog = styled.dialog`
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: none;
  background: ${({ theme }) => theme.colors.viewerBg};
  color: ${({ theme }) => theme.colors.viewerText};

  /* Only while open: display: flex here would otherwise show a closed dialog. */
  &[open] {
    display: flex;
    flex-direction: column;
  }

  &::backdrop {
    background: ${({ theme }) => theme.colors.viewerBg};
  }
`

// "2 / 5" on the left, ✕ on the right.
export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
`

export const Counter = styled.span`
  font-weight: 600;
`

// The area for the photo: takes all the space left; min-height: 0 lets it shrink so a
// tall photo is scaled down instead of overflowing.
export const Stage = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px 16px;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain; /* whole photo visible, never cropped */
  }
`

// Round, see-through icon buttons (✕, previous, next), readable on top of any photo.
export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.viewerControl};
  color: ${({ theme }) => theme.colors.viewerText};
  cursor: pointer;

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`

// Previous / Next: on the left and right edges, vertically centred over the photo.
export const SideButton = styled(IconButton)<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => $side}: 16px;
  transform: translateY(-50%);
`

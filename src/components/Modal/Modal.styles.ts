import styled from 'styled-components'

// The native <dialog>. Padding lives on the inner Content, so a click that lands on the
// <dialog> element itself can only be a click on the backdrop (see Modal.tsx).
export const Dialog = styled.dialog`
  width: calc(100% - 32px);
  max-width: 520px;
  max-height: calc(100dvh - 32px);
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &::backdrop {
    background: ${({ theme }) => theme.colors.overlay};
  }
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.colors.brand};
`

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${({ theme }) => theme.radius};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.bg};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
  }
`

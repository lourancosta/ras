import styled, { css } from 'styled-components'

export type ModalSize = 'small' | 'medium'

// The native <dialog>. It has no padding of its own, so a click that lands on the <dialog>
// element itself can only be a click on the backdrop (see Modal.tsx).
// Header and footer stay put; only the body in between scrolls.
// - small (default): forms, 520px wide.
// - medium: 760px wide on wide screens and the whole screen on phones (e.g. the review
//   queue, which shows a full form with photos).
export const Dialog = styled.dialog<{ $size: ModalSize }>`
  width: calc(100% - 32px);
  max-width: ${({ $size }) => ($size === 'medium' ? '760px' : '520px')};
  max-height: calc(100dvh - 32px);
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  /* Only while open: display: flex here would otherwise show a closed dialog. */
  &[open] {
    display: flex;
    flex-direction: column;
  }

  &::backdrop {
    background: ${({ theme }) => theme.colors.overlay};
  }

  ${({ $size, theme }) =>
    $size === 'medium' &&
    css`
      @media (max-width: calc(${theme.breakpoints.md} - 1px)) {
        width: 100%;
        max-width: none;
        height: 100dvh;
        max-height: none;
        border-radius: 0;
      }
    `}
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

export const Body = styled.div`
  flex: 1;
  min-height: 0; /* lets it shrink so it can scroll inside the dialog */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`

export const Footer = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
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

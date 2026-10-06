import styled from 'styled-components'

export const Row = styled.label<{ $disabled: boolean }>`
  display: grid;
  grid-template-columns: 1fr auto 32px;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 4px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  &:last-child {
    border-bottom: none;
  }
`

// appearance: none removes the default checkbox so we can draw a switch:
// the input is the track and ::before is the sliding knob.
export const Switch = styled.input`
  appearance: none;
  position: relative;
  width: 44px;
  height: 24px;
  margin: 0;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: background 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.surface};
    transition: transform 0.2s ease;
  }

  &:checked {
    background: ${({ theme }) => theme.colors.brand};
  }

  &:checked::before {
    transform: translateX(20px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
  }
`

// "$" prefix = transient prop: used for styling only, not passed to the DOM.
export const Answer = styled.span<{ $checked: boolean }>`
  font-weight: 600;
  color: ${({ theme, $checked }) => ($checked ? theme.colors.success : theme.colors.danger)};
`

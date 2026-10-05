import styled from 'styled-components'

type ToggleProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

// A Yes/No switch. Under the hood it's a real checkbox (role="switch"), so it
// works with keyboard and screen readers. The whole row is a <label>, which
// gives a big tap target on phones.
export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <Row>
      <span>{label}</span>
      <Switch
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Answer $checked={checked}>{checked ? 'Yes' : 'No'}</Answer>
    </Row>
  )
}

const Row = styled.label`
  display: grid;
  grid-template-columns: 1fr auto 32px;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 4px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
`

// appearance: none removes the default checkbox so we can draw a switch:
// the input is the track and ::before is the sliding knob.
const Switch = styled.input`
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
`

// "$" prefix = transient prop: used for styling only, not passed to the DOM.
const Answer = styled.span<{ $checked: boolean }>`
  font-weight: 600;
  color: ${({ theme, $checked }) => ($checked ? theme.colors.success : theme.colors.danger)};
`

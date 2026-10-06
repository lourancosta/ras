import { Row, Switch, Answer } from './Toggle.styles'

type ToggleProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean // shown but can't be changed (e.g. your own account)
}

// A Yes/No switch. Under the hood it's a real checkbox (role="switch"), so it
// works with keyboard and screen readers. The whole row is a <label>, which
// gives a big tap target on phones.
export function Toggle({ label, checked, onChange, disabled = false }: ToggleProps) {
  return (
    <Row $disabled={disabled}>
      <span>{label}</span>
      <Switch
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Answer $checked={checked}>{checked ? 'Yes' : 'No'}</Answer>
    </Row>
  )
}

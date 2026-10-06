import { Button, SecondaryButton } from '../ui'
import { Actions } from './FormActions.styles'

type FormActionsProps = {
  submitLabel: string // e.g. "Add site", "Save changes"
  saving: boolean // true while the request runs: both buttons disabled, submit shows "Saving…"
  onCancel: () => void
  disabled?: boolean // extra reason to block submit, e.g. nothing changed yet
}

// Footer of a form in a modal (SiteForm, WorkerForm): Cancel and the submit button.
// The submit button is type="submit", so it submits the surrounding <form> (and Enter does too).
export function FormActions({ submitLabel, saving, onCancel, disabled = false }: FormActionsProps) {
  return (
    <Actions>
      <SecondaryButton type="button" onClick={onCancel} disabled={saving}>
        Cancel
      </SecondaryButton>
      <Button type="submit" disabled={saving || disabled}>
        {saving ? 'Saving…' : submitLabel}
      </Button>
    </Actions>
  )
}

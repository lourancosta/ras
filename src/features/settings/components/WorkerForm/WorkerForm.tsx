import { useState, type FormEvent } from 'react'
import { Toggle } from '../../../../components/Toggle/Toggle'
import { FormActions } from '../../../../components/FormActions/FormActions'
import { ErrorMessage, Field, Form, Hint, Input, SecondaryButton, Select } from '../../../../components/ui'
import { generatePassword, PASSWORD_MIN_LENGTH } from '../../password'
import { ROLE_LABELS } from '../../roles'
import { createWorker, updateWorker, type Role, type Worker, type WorkerChanges } from '../../workers'
import { PasswordRow } from './WorkerForm.styles'

// Same rules as the manage-worker Edge Function, checked here first for quick feedback.
const NAME_MAX_LENGTH = 120
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ROLES: Role[] = ['framer', 'admin']

const ROLE_HINTS: Record<Role, string> = {
  framer: 'Fills in daily safety forms; sees only their own.',
  admin: 'Sees and reviews every form, manages sites and workers.',
}

type WorkerFormProps = {
  worker?: Worker // given = edit this account; missing = create a new one
  isSelf: boolean // the signed-in admin's own account: role and status locked
  onSaved: (worker: Worker) => void
  onCancel: () => void
}

// Create or edit an account: name, email, role, status (edit only) and password
// (required on create, optional "new password" on edit). Shown inside a Modal; it
// starts from the account's current values (or empty) every time it opens.
export function WorkerForm({ worker, isSelf, onSaved, onCancel }: WorkerFormProps) {
  const isEdit = worker !== undefined
  const [fullName, setFullName] = useState(worker?.full_name ?? '')
  const [email, setEmail] = useState(worker?.email ?? '')
  const [role, setRole] = useState<Role>(worker?.role ?? 'framer')
  const [isActive, setIsActive] = useState(worker?.is_active ?? true)
  const [password, setPassword] = useState('') // edit: empty = keep the current password
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const name = fullName.trim()
  const cleanEmail = email.trim().toLowerCase()

  // Edit: only what actually changed is sent (and Save stays disabled until something did).
  const changes: WorkerChanges = {}
  if (isEdit) {
    if (name !== worker.full_name) changes.full_name = name
    if (cleanEmail !== (worker.email ?? '')) changes.email = cleanEmail
    if (role !== worker.role) changes.role = role
    if (isActive !== worker.is_active) changes.is_active = isActive
    if (password) changes.password = password
  }
  const hasChanges = !isEdit || Object.keys(changes).length > 0

  // Returns the first problem with the form, or null if it can be sent.
  function validate(): string | null {
    if (!name) return "Enter the worker's name."
    if (!EMAIL_PATTERN.test(cleanEmail)) return 'Enter a valid email address.'
    // Create: a password is required. Edit: only checked if a new one was typed.
    if ((!isEdit || password) && password.length < PASSWORD_MIN_LENGTH) {
      return `The password needs at least ${PASSWORD_MIN_LENGTH} characters.`
    }
    return null
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }

    setSaving(true)
    setError(null)
    try {
      const saved = isEdit
        ? await updateWorker(worker.id, changes)
        : await createWorker({ full_name: name, email: cleanEmail, password, role })
      onSaved(saved)
    } catch (err) {
      console.error('Saving worker failed:', err)
      setError((err as Error).message)
      setSaving(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Field>
        Full name
        <Input
          required
          maxLength={NAME_MAX_LENGTH}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Sam Patel"
          autoComplete="off"
          data-autofocus // the Modal focuses this field when it opens
        />
      </Field>

      <Field>
        Email (used to sign in)
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. sam.patel@example.com"
          autoComplete="off"
        />
      </Field>

      <Field>
        Role
        <Select value={role} onChange={(e) => setRole(e.target.value as Role)} disabled={isSelf}>
          {ROLES.map((option) => (
            <option key={option} value={option}>
              {ROLE_LABELS[option]}
            </option>
          ))}
        </Select>
        <Hint>{isSelf ? "You can't change your own role." : ROLE_HINTS[role]}</Hint>
      </Field>

      {isEdit && (
        <div>
          <Toggle label="Active" checked={isActive} onChange={setIsActive} disabled={isSelf} />
          <Hint>
            {isSelf
              ? "You can't deactivate your own account."
              : isActive
                ? 'Can sign in and use the app.'
                : "Can't sign in or submit forms. Their past forms are kept."}
          </Hint>
        </div>
      )}

      <Field as="div">
        <label htmlFor="worker-password">{isEdit ? 'New password (optional)' : 'Temporary password'}</label>
        <PasswordRow>
          {/* type="text" on purpose: the admin has to read it to pass it on. */}
          <Input
            id="worker-password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? 'Leave empty to keep the current password' : undefined}
            autoComplete="new-password"
            spellCheck={false}
          />
          <SecondaryButton type="button" onClick={() => setPassword(generatePassword())}>
            Generate
          </SecondaryButton>
        </PasswordRow>
        <Hint>
          At least {PASSWORD_MIN_LENGTH} characters.{' '}
          {isEdit ? 'Give the new password to the worker.' : 'Give it to the worker with their email.'}
        </Hint>
      </Field>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <FormActions
        submitLabel={isEdit ? 'Save changes' : 'Create worker'}
        saving={saving}
        onCancel={onCancel}
        disabled={!hasChanges} // editing: nothing changed yet
      />
    </Form>
  )
}

import { useState, type FormEvent } from 'react'
import type { PostgrestError } from '@supabase/supabase-js'
import { Toggle } from '../../../../components/Toggle/Toggle'
import { FormActions } from '../../../../components/FormActions/FormActions'
import { ErrorMessage, Field, Form, Hint, Input } from '../../../../components/ui'
import { createSite, updateSite, type Site } from '../../sites'

const NAME_MAX_LENGTH = 120
const ADDRESS_MAX_LENGTH = 200

type SiteFormProps = {
  site?: Site // given = edit this site; missing = create a new one
  existingNames: string[] // every site's name, to catch duplicates before asking the database
  onSaved: (site: Site) => void
  onCancel: () => void
}

// Create or edit a job site: name (required, unique), address (optional) and, when
// editing, whether it's active. Shown inside a Modal; it starts from the site's current
// values (or empty) every time it opens, because the Modal is rendered only while open.
export function SiteForm({ site, existingNames, onSaved, onCancel }: SiteFormProps) {
  const isEdit = site !== undefined
  const [name, setName] = useState(site?.name ?? '')
  const [address, setAddress] = useState(site?.address ?? '')
  const [isActive, setIsActive] = useState(site?.is_active ?? true) // new sites start active
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Enter the site name.')
      return
    }
    // Case-insensitive: "Maple Grove" and "maple grove" would confuse framers picking a site.
    // When editing, the site's own current name doesn't count as a duplicate.
    // The database's unique rule is the final check (see siteErrorMessage).
    const isDuplicate = existingNames.some(
      (existing) =>
        existing.toLowerCase() === trimmedName.toLowerCase() &&
        existing.toLowerCase() !== site?.name.toLowerCase(),
    )
    if (isDuplicate) {
      setError('A site with this name already exists.')
      return
    }

    setSaving(true)
    setError(null)
    const fields = { name: trimmedName, address: address.trim() || null }
    try {
      const saved = isEdit
        ? await updateSite(site.id, { ...fields, is_active: isActive })
        : await createSite(fields)
      onSaved(saved)
    } catch (err) {
      console.error('Saving site failed:', err)
      setError(siteErrorMessage(err as PostgrestError))
      setSaving(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Field>
        Name
        <Input
          required
          maxLength={NAME_MAX_LENGTH}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Maple Grove Townhomes"
          data-autofocus // the Modal focuses this field when it opens
        />
      </Field>

      <Field>
        Address (optional)
        <Input
          maxLength={ADDRESS_MAX_LENGTH}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. 1234 Maple St, Surrey, BC"
        />
      </Field>

      {isEdit ? (
        <div>
          <Toggle label="Active" checked={isActive} onChange={setIsActive} />
          <Hint>
            {isActive
              ? 'Framers can pick this site on new safety forms.'
              : 'Hidden from new safety forms. Forms already submitted for it are kept.'}
          </Hint>
        </div>
      ) : (
        <Hint>New sites are active: framers can pick them on the safety form right away.</Hint>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <FormActions submitLabel={isEdit ? 'Save changes' : 'Add site'} saving={saving} onCancel={onCancel} />
    </Form>
  )
}

// Turns a database error into a message the admin can act on.
function siteErrorMessage(error: PostgrestError): string {
  if (error.code === '23505') return 'A site with this name already exists.' // unique (name)
  if (error.code === '42501') return "You don't have permission to change sites."
  return 'Could not save the site. Please check your connection and try again.'
}

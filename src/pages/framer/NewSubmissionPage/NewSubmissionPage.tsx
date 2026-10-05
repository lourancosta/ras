import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import type { PostgrestError } from '@supabase/supabase-js'
import { useAuth } from '../../../auth/auth-context'
import { PhotoPicker } from '../../../components/PhotoPicker/PhotoPicker'
import { Toggle } from '../../../components/Toggle/Toggle'
import {
  Button,
  ErrorMessage,
  Field,
  Hint,
  Input,
  PageTitle,
  Select,
  SuccessMessage,
  Textarea,
} from '../../../components/ui'
import { checklistGroups, emptyChecklist, type ChecklistAnswers } from '../../../lib/checklist'
import type { Tables } from '../../../lib/database.types'
import { formatDate, todayInVancouver } from '../../../lib/dates'
import {
  MAX_PHOTOS,
  preparePhotos,
  uploadSubmissionPhotos,
  type SelectedPhoto,
} from '../../../lib/photos'
import { supabase } from '../../../lib/supabase'
import {
  Container,
  Form,
  Section,
  SectionTitle,
  Actions,
  SecondaryButton,
} from './NewSubmissionPage.styles'

const NOTES_MAX_LENGTH = 2000 // same limit as the DB check constraint

type Site = Pick<Tables<'sites'>, 'id' | 'name'>

// Shown after a successful submit.
type SubmittedInfo = {
  siteName: string
  workDate: string
  photosUploaded: number
  photosFailed: number
}

// What the submit button is doing right now (null = idle).
type SubmitStep = 'saving' | 'uploading' | null

export function NewSubmissionPage() {
  const { profile } = useAuth()
  const today = todayInVancouver()

  // Active sites for the dropdown (null while loading).
  const [sites, setSites] = useState<Site[] | null>(null)
  const [sitesError, setSitesError] = useState<string | null>(null)

  // Form fields.
  const [siteId, setSiteId] = useState('')
  const [workDate, setWorkDate] = useState(today)
  const [checklist, setChecklist] = useState<ChecklistAnswers>(emptyChecklist)
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<SelectedPhoto[]>([])

  // Photo picking state (compression takes a moment on phones).
  const [preparingPhotos, setPreparingPhotos] = useState(false)
  const [photoErrors, setPhotoErrors] = useState<string[]>([])

  // Submit state.
  const [submitStep, setSubmitStep] = useState<SubmitStep>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<SubmittedInfo | null>(null)

  // Load active sites once. Inactive sites are hidden here, and the database
  // rejects them too (RLS insert policy).
  useEffect(() => {
    supabase
      .from('sites')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .then(({ data, error }) => {
        if (error) setSitesError('Could not load job sites. Please refresh the page.')
        else setSites(data)
      })
  }, [])

  // Free the thumbnails' memory if the user leaves the page with photos picked.
  // A ref (not `photos`) so the cleanup sees the latest list without re-running.
  const photosRef = useRef(photos)
  useEffect(() => {
    photosRef.current = photos
  }, [photos])
  useEffect(() => {
    return () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
  }, [])

  async function handleAddPhotos(files: File[]) {
    if (files.length === 0) return
    setPhotoErrors([])
    setPreparingPhotos(true)
    const result = await preparePhotos(files, photos.length)
    setPreparingPhotos(false)
    // Function form: add to the latest list, in case it changed while compressing.
    setPhotos((current) => [...current, ...result.photos])
    setPhotoErrors(result.errors)
  }

  function handleRemovePhoto(id: string) {
    const photo = photos.find((p) => p.id === id)
    if (photo) URL.revokeObjectURL(photo.previewUrl) // free the thumbnail's memory
    setPhotos(photos.filter((p) => p.id !== id))
    setPhotoErrors([])
  }

  // Returns an error message, or null if the form is valid.
  // The browser also checks `required`/`max`, but we don't rely on that alone.
  function validate(): string | null {
    if (!siteId) return 'Please select a job site.'
    if (!workDate) return 'Please select a date.'
    // 'YYYY-MM-DD' strings compare correctly as text.
    if (workDate > today) return "The date can't be in the future."
    if (notes.length > NOTES_MAX_LENGTH) return `Notes can be at most ${NOTES_MAX_LENGTH} characters.`
    if (photos.length > MAX_PHOTOS) return `Up to ${MAX_PHOTOS} photos per form.`
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    if (!profile) return // can't happen inside RequireRole, but keeps TypeScript happy

    // 1. Save the form and get its id back (needed for the photo paths).
    setSubmitStep('saving')
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert({
        user_id: profile.id,
        site_id: siteId,
        work_date: workDate,
        ...checklist, // the 8 boolean columns
        notes: notes.trim() || null,
        // status, reviewed_by and reviewed_at use the DB defaults.
      })
      .select('id')
      .single()

    if (error) {
      setSubmitStep(null)
      console.error('Submit failed:', error)
      setError(submitErrorMessage(error))
      return
    }

    // 2. Upload the photos. The form is already saved at this point: if some
    //    photos fail, we still report success and say which part failed.
    setSubmitStep('uploading')
    const photosFailed = await uploadSubmissionPhotos(profile.id, submission.id, photos)
    setSubmitStep(null)

    // 3. Success: remember what was sent for the message, then reset the form.
    const siteName = sites?.find((s) => s.id === siteId)?.name ?? 'the site'
    setSubmitted({
      siteName,
      workDate,
      photosUploaded: photos.length - photosFailed,
      photosFailed,
    })
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
    setSiteId('')
    setWorkDate(today)
    setChecklist(emptyChecklist)
    setNotes('')
    setPhotos([])
    setPhotoErrors([])
  }

  const busy = submitStep !== null || preparingPhotos

  if (submitted) {
    return (
      <Container>
        <PageTitle>New safety form</PageTitle>
        <SuccessMessage>
          Safety form submitted for <strong>{submitted.siteName}</strong> on{' '}
          {formatDate(submitted.workDate)}
          {submitted.photosUploaded > 0 && ` with ${submitted.photosUploaded} photo(s)`}.
        </SuccessMessage>
        {submitted.photosFailed > 0 && (
          <ErrorMessage>
            {submitted.photosFailed} photo(s) could not be uploaded. The form itself was saved.
          </ErrorMessage>
        )}
        <Actions>
          <Button as={Link} to="/">
            View my forms
          </Button>
          <SecondaryButton type="button" onClick={() => setSubmitted(null)}>
            Submit another form
          </SecondaryButton>
        </Actions>
      </Container>
    )
  }

  return (
    <Container>
      <PageTitle>New safety form</PageTitle>

      <Form onSubmit={handleSubmit} noValidate>
        <Section>
          {/* Worker name comes from the signed-in user, not from a form field. */}
          <Field as="div">
            Worker
            <Hint>{profile?.full_name}</Hint>
          </Field>

          <Field>
            Job site
            {sitesError ? (
              <ErrorMessage>{sitesError}</ErrorMessage>
            ) : (
              <Select
                required
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                disabled={!sites}
              >
                <option value="">{sites ? 'Select a site…' : 'Loading sites…'}</option>
                {sites?.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field>
            Date
            <Input
              type="date"
              required
              max={today}
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
            />
          </Field>
        </Section>

        {checklistGroups.map((group) => (
          <Section key={group.title}>
            <SectionTitle>{group.title}</SectionTitle>
            <Hint>Turn on each item that is in place. Anything left on "No" is reported as not in place.</Hint>
            <div>
              {group.items.map((item) => (
                <Toggle
                  key={item.key}
                  label={item.label}
                  checked={checklist[item.key]}
                  // Copy the object and change one key (state must not be mutated).
                  onChange={(checked) => setChecklist({ ...checklist, [item.key]: checked })}
                />
              ))}
            </div>
          </Section>
        ))}

        <Section>
          <Field>
            Notes (optional)
            <Textarea
              maxLength={NOTES_MAX_LENGTH}
              placeholder="Hazards, missing equipment, anything the supervisor should know"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Hint>
              {notes.length}/{NOTES_MAX_LENGTH}
            </Hint>
          </Field>
        </Section>

        <Section>
          <SectionTitle>Photos (optional)</SectionTitle>
          <Hint>
            Site conditions, PPE, hazards. Up to {MAX_PHOTOS} photos, JPEG, PNG or WebP, max 5 MB each.
          </Hint>
          <PhotoPicker
            photos={photos}
            onAdd={handleAddPhotos}
            onRemove={handleRemovePhoto}
            disabled={busy}
          />
          {preparingPhotos && <Hint>Preparing photos…</Hint>}
          {photoErrors.map((message) => (
            <ErrorMessage key={message}>{message}</ErrorMessage>
          ))}
        </Section>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button type="submit" disabled={busy || !sites}>
          {submitStep === 'saving'
            ? 'Saving form…'
            : submitStep === 'uploading'
              ? 'Uploading photos…'
              : 'Submit safety form'}
        </Button>
      </Form>
    </Container>
  )
}

// Turns a database error into a message the framer can act on.
// Codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
function submitErrorMessage(error: PostgrestError): string {
  if (error.code === '23505') {
    // unique_violation on (user_id, site_id, work_date)
    return 'You already submitted a form for this site on this date.'
  }
  if (error.code === '42501') {
    // insufficient_privilege: the RLS insert policy rejected the row
    return 'This form could not be saved. The site may no longer be active, or the date is in the future.'
  }
  return 'Could not submit the form. Check your connection and try again.'
}

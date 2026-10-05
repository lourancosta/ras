import type { ChangeEvent } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'
import { ALLOWED_PHOTO_TYPES, MAX_PHOTOS, type SelectedPhoto } from '../../photos'
import { Grid, Thumb, RemoveButton, Buttons, AddLabel, HiddenInput } from './PhotoPicker.styles'

type PhotoPickerProps = {
  photos: SelectedPhoto[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  disabled: boolean
}

// Thumbnails of the picked photos + two ways to add more.
// The real <input type="file"> elements are hidden; their <label>s look like buttons.
export function PhotoPicker({ photos, onAdd, onRemove, disabled }: PhotoPickerProps) {
  const full = photos.length >= MAX_PHOTOS

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onAdd(Array.from(event.target.files ?? []))
    // Clear the input so picking the same file again still fires onChange.
    event.target.value = ''
  }

  return (
    <div>
      {photos.length > 0 && (
        <Grid>
          {photos.map((photo) => (
            <Thumb key={photo.id}>
              <img src={photo.previewUrl} alt={photo.file.name} />
              <RemoveButton
                type="button"
                onClick={() => onRemove(photo.id)}
                disabled={disabled}
                aria-label={`Remove ${photo.file.name}`}
              >
                <X size={16} aria-hidden="true" />
              </RemoveButton>
            </Thumb>
          ))}
        </Grid>
      )}

      {!full && (
        <Buttons>
          {/* capture="environment" opens the back camera on phones (ignored on desktop). */}
          <AddLabel $disabled={disabled}>
            <Camera size={20} aria-hidden="true" />
            Take photo
            <HiddenInput
              type="file"
              accept={ALLOWED_PHOTO_TYPES.join(',')}
              capture="environment"
              onChange={handleChange}
              disabled={disabled}
            />
          </AddLabel>
          <AddLabel $disabled={disabled}>
            <ImagePlus size={20} aria-hidden="true" />
            Choose photos
            <HiddenInput
              type="file"
              accept={ALLOWED_PHOTO_TYPES.join(',')}
              multiple
              onChange={handleChange}
              disabled={disabled}
            />
          </AddLabel>
        </Buttons>
      )}
    </div>
  )
}

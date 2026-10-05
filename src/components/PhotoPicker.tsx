import type { ChangeEvent } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'
import styled from 'styled-components'
import { ALLOWED_PHOTO_TYPES, MAX_PHOTOS, type SelectedPhoto } from '../lib/photos'

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
`

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radius};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  padding: 4px;
  border: none;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
`

const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const AddLabel = styled.label<{ $disabled: boolean }>`
  position: relative; /* keeps the hidden input inside the label */
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px dashed ${({ theme }) => theme.colors.brand};
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme }) => theme.colors.brand};
  font-weight: 600;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  /* Keyboard users tab to the hidden input; show the focus on the label. */
  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`

// Visually hidden but still focusable and usable (display: none would break keyboard access).
const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
`

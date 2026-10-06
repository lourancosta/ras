import { useState, type KeyboardEvent } from 'react'
import { useDialog } from '../../lib/useDialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Counter, Dialog, IconButton, SideButton, Stage, TopBar } from './PhotoViewer.styles'

type PhotoViewerProps = {
  photos: { id: string; url: string }[]
  startIndex: number // the photo that was tapped
  onClose: () => void
}

// Full-screen dark viewer for a form's photos, with Previous / Next.
// Render it only while open (like Modal): {viewing !== null && <PhotoViewer ... />}.
// Native <dialog> + showModal() via useDialog: focus kept inside, Escape closes, and it
// can open on top of another dialog (the review queue modal).
// Keyboard: ← / → change photo.
export function PhotoViewer({ photos, startIndex, onClose }: PhotoViewerProps) {
  const dialog = useDialog(onClose)
  const [index, setIndex] = useState(startIndex)
  const total = photos.length
  const photo = photos[index]
  const isFirst = index === 0
  const isLast = index === total - 1

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' && !isFirst) setIndex(index - 1)
    if (event.key === 'ArrowRight' && !isLast) setIndex(index + 1)
  }

  return (
    <Dialog {...dialog} aria-label={`Photo ${index + 1} of ${total}`} onKeyDown={handleKeyDown}>
      <TopBar>
        {/* aria-live: screen readers announce the new position after Previous / Next. */}
        <Counter aria-live="polite">
          {index + 1} / {total}
        </Counter>
        <IconButton type="button" onClick={onClose} aria-label="Close photo">
          <X size={22} aria-hidden="true" />
        </IconButton>
      </TopBar>

      <Stage>
        <img src={photo.url} alt={`Photo ${index + 1} of ${total}`} />

        {/* Only when there is more than one photo. */}
        {total > 1 && (
          <>
            <SideButton
              type="button"
              $side="left"
              onClick={() => setIndex(index - 1)}
              disabled={isFirst}
              aria-label="Previous photo"
            >
              <ChevronLeft size={26} aria-hidden="true" />
            </SideButton>
            <SideButton
              type="button"
              $side="right"
              onClick={() => setIndex(index + 1)}
              disabled={isLast}
              aria-label="Next photo"
            >
              <ChevronRight size={26} aria-hidden="true" />
            </SideButton>
          </>
        )}
      </Stage>
    </Dialog>
  )
}

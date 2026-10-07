import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useDialog } from '../../lib/useDialog'
import { X } from 'lucide-react'
import { Body, CloseButton, Dialog, Footer, Header, Title, type ModalSize } from './Modal.styles'

type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
  size?: ModalSize // 'small' (default) or 'medium' (wider; full screen on phones)
  footer?: ReactNode // actions that stay visible at the bottom while the body scrolls
  scrollKey?: string | number // when it changes, the body scrolls back to the top (e.g. next form)
  tone?: 'default' | 'danger' // 'danger' = red title, for a question about losing data
}

// A dialog over the page. Render it only while it should be open:
//   {editing && <Modal title="Edit site" onClose={() => setEditing(null)}>...</Modal>}
// Native <dialog> + showModal() via useDialog (focus, Escape, backdrop, autofocus).
// Closing (✕, Escape, click outside) calls onClose; the parent then stops rendering it.
export function Modal({
  title,
  onClose,
  children,
  size = 'small',
  footer,
  scrollKey,
  tone = 'default',
}: ModalProps) {
  const dialog = useDialog(onClose)
  const bodyRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  // New content (e.g. the next form in the review queue): start reading from the top.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [scrollKey])

  return (
    <Dialog
      {...dialog}
      $size={size}
      aria-labelledby={titleId}
      // A click on the <dialog> itself (not on its content) is a click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <Header>
        <Title id={titleId} $danger={tone === 'danger'}>
          {title}
        </Title>
        <CloseButton type="button" onClick={onClose} aria-label="Close">
          <X size={20} aria-hidden="true" />
        </CloseButton>
      </Header>
      <Body ref={bodyRef}>{children}</Body>
      {footer && <Footer>{footer}</Footer>}
    </Dialog>
  )
}

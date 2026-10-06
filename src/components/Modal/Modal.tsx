import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Body, CloseButton, Dialog, Footer, Header, Title, type ModalSize } from './Modal.styles'

type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
  size?: ModalSize // 'small' (default) or 'medium' (wider; full screen on phones)
  footer?: ReactNode // actions that stay visible at the bottom while the body scrolls
  scrollKey?: string | number // when it changes, the body scrolls back to the top (e.g. next form)
}

// A dialog over the page. Render it only while it should be open:
//   {editing && <Modal title="Edit site" onClose={() => setEditing(null)}>...</Modal>}
// Built on the native <dialog> + showModal(), which gives for free: focus kept inside,
// Escape to close, a backdrop, the page behind not clickable, and screen readers
// announcing a dialog. Closing (✕, Escape, click outside) calls onClose; the parent
// then stops rendering it.
export function Modal({ title, onClose, children, size = 'small', footer, scrollKey }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  // Open as a modal when it appears, close when it goes away. (Not a setState, just
  // calls on the DOM element, so this is a fine use of an effect.)
  // showModal() focuses the first focusable element (the ✕ button), so we then move
  // focus to the field marked with data-autofocus, if the content has one.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    return () => dialog.close()
  }, [])

  // New content (e.g. the next form in the review queue): start reading from the top.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [scrollKey])

  return (
    <Dialog
      ref={dialogRef}
      $size={size}
      aria-labelledby={titleId}
      // Escape: let the parent decide (it unmounts us) instead of the browser closing it.
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // A click on the <dialog> itself (not on its content) is a click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <Header>
        <Title id={titleId}>{title}</Title>
        <CloseButton type="button" onClick={onClose} aria-label="Close">
          <X size={20} aria-hidden="true" />
        </CloseButton>
      </Header>
      <Body ref={bodyRef}>{children}</Body>
      {footer && <Footer>{footer}</Footer>}
    </Dialog>
  )
}

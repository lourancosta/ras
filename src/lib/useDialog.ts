import { useEffect, useRef, type SyntheticEvent } from 'react'

// Shared by Modal and PhotoViewer: turns a native <dialog> into a modal while the
// component is on screen. Render the component only while it should be open; closing
// (✕, Escape, click outside) calls onClose, and the parent stops rendering it.
//
//   const dialog = useDialog(onClose)
//   return <Dialog {...dialog}>...</Dialog>
//
// showModal() gives for free: focus kept inside, Escape, a backdrop, the page behind not
// clickable, and screen readers announcing a dialog. A dialog can open over another one
// (e.g. a photo over the review queue); Escape closes only the top one.
export function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null)

  // Open as a modal when it appears, close when it goes away. (DOM calls, not a setState,
  // so this is a fine use of an effect.) showModal() focuses the first focusable element
  // (usually ✕), so we then move focus to the field marked data-autofocus, if any.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    return () => dialog.close()
  }, [])

  // Escape: let the parent decide (it unmounts the dialog) instead of the browser closing it.
  // The target check matters when a dialog is open inside another one (a photo over the
  // review queue): the browser only cancels the top dialog, but React passes the event up
  // through its component tree, so the outer dialog's handler runs too. Without the check,
  // one Escape would close both.
  function onCancel(event: SyntheticEvent) {
    if (event.target !== event.currentTarget) return // another (inner) dialog's Escape
    event.preventDefault()
    onClose()
  }

  return { ref, onCancel }
}

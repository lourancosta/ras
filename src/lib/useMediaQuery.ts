import { useSyncExternalStore } from 'react'

// True while the CSS media query matches, e.g. useMediaQuery('(min-width: 768px)').
// Updates when the window is resized or a phone is rotated.
// useSyncExternalStore is React's way to read a value that lives outside React (here the
// browser's matchMedia) and re-render when it changes, without an effect + setState.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

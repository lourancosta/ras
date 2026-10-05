import { useState } from 'react'
import { Image, TextLogo } from './Logo.styles'

// Shows /public/ras-logo.webp; if the file is missing or fails to load,
// falls back to the "RAS" text so the header never shows a broken image.
export function Logo() {
  const [imageFailed, setImageFailed] = useState(false)

  if (imageFailed) return <TextLogo>RAS</TextLogo>

  return <Image src="/ras-logo.webp" alt="RAS" onError={() => setImageFailed(true)} />
}

import { useState } from 'react'
import { Image, TextLogo } from './Logo.styles'

// Shows /public/logo-white.svg (white, made for the green side menu); if the file is
// missing or fails to load, falls back to the app name so the header never shows a broken image.
export function Logo() {
  const [imageFailed, setImageFailed] = useState(false)

  if (imageFailed) return <TextLogo>SiteCheck</TextLogo>

  return <Image src="/logo-white.svg" alt="SiteCheck" onError={() => setImageFailed(true)} />
}

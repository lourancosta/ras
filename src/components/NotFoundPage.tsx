import { Link } from 'react-router'
import { FullPageMessage } from './FullPageMessage/FullPageMessage'
import { Button, PageTitle } from './ui'

// Shown for any URL that isn't a page for this user (a typo, an old link, or another
// role's page: routes are registered per role, see App.tsx).
export function NotFoundPage() {
  return (
    <FullPageMessage>
      {/* The full green logo: the menu's logo is white, made for the green side menu. */}
      <img src="/ras-full-logo.webp" alt="RAS Framing & Formwork" width={140} />
      <PageTitle as="h1">Page not found</PageTitle>
      <p>This page doesn't exist, or your account can't open it.</p>
      {/* "/" sends each user to their own home page (see App.tsx). */}
      <Button as={Link} to="/">
        Go to my home page
      </Button>
    </FullPageMessage>
  )
}

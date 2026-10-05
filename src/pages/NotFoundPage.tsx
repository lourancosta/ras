import { Link } from 'react-router'
import { FullPageMessage } from '../components/FullPageMessage/FullPageMessage'

export function NotFoundPage() {
  return (
    <FullPageMessage>
      <h1>Page not found</h1>
      {/* "/" sends each user to their own home page (see App.tsx). */}
      <Link to="/">Go to home page</Link>
    </FullPageMessage>
  )
}

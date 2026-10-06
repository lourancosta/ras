import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { Camera, ClipboardCheck, LayoutDashboard } from 'lucide-react'
import { homePathFor } from '../../../routes'
import { useAuth } from '../auth-context'
import { Button, ErrorMessage, Field, Input } from '../../../components/ui'
import {
  Page,
  BrandPanel,
  FullLogo,
  Pitch,
  Headline,
  Features,
  Feature,
  FormSide,
  LoginCard,
  Title,
  Subtitle,
} from './LoginPage.styles'

export function LoginPage() {
  const { session, profile, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const error = await signIn(email, password)

    setSubmitting(false)
    if (error) {
      console.error('Sign-in failed:', error) // full details for debugging
      // Don't reveal whether the email exists; keep the message generic.
      setError(
        error.code === 'invalid_credentials'
          ? 'Email or password is incorrect.'
          : error.code === 'user_banned' // deactivated in Settings > Workers
            ? 'This account is inactive. Please contact an admin.'
            : 'Could not sign in. Check your connection and try again.',
      )
    }
    // On success there's nothing to do here: AuthProvider hears the new
    // session through onAuthStateChange and the app re-renders.
  }

  // Already signed in (or just signed in): go to this user's home page.
  // If the profile failed to load, "/" lets RequireAuth show that error.
  if (session && !loading) {
    return <Navigate to={homePathFor(profile?.role) ?? '/'} replace />
  }

  return (
    <Page>
      {/* Left (top on phones): what this app is. */}
      <BrandPanel>
        <FullLogo src="/ras-full-logo.webp" alt="RAS Framing & Formwork" />
        <Pitch>
          <Headline>Daily site safety, in one place.</Headline>
          <Features>
            <Feature>
              <ClipboardCheck size={20} aria-hidden="true" />
              <span>A quick checklist: PPE, fall protection, ladders, tools and hazards.</span>
            </Feature>
            <Feature>
              <Camera size={20} aria-hidden="true" />
              <span>Photos of site conditions attached to each form.</span>
            </Feature>
            <Feature>
              <LayoutDashboard size={20} aria-hidden="true" />
              <span>A dashboard of today's forms, with flags for anything that needs follow-up.</span>
            </Feature>
          </Features>
        </Pitch>
      </BrandPanel>

      {/* Right (below on phones): the sign-in form. */}
      <FormSide>
        <LoginCard as="form" onSubmit={handleSubmit}>
          <Title>Welcome back</Title>
          <Subtitle>Sign in to continue</Subtitle>

          <Field>
            Email
            <Input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field>
            Password
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </LoginCard>
      </FormSide>
    </Page>
  )
}

import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { homePathFor } from '../../../routes'
import { useAuth } from '../auth-context'
import { supabase } from '../../../lib/supabase'
import { Button, ErrorMessage, Field, Input } from '../../../components/ui'
import { Page, LoginCard, Title, Subtitle } from './LoginPage.styles'

export function LoginPage() {
  const { session, profile, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setSubmitting(false)
    if (error) {
      console.error('Sign-in failed:', error) // full details for debugging
      // Don't reveal whether the email exists; keep the message generic.
      setError(
        error.code === 'invalid_credentials'
          ? 'Email or password is incorrect.'
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
      <LoginCard as="form" onSubmit={handleSubmit}>
        <Title>RAS Site Safety Forms</Title>
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
    </Page>
  )
}

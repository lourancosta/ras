import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import styled from 'styled-components'
import { homePathFor, useAuth } from '../auth/auth-context'
import { supabase } from '../lib/supabase'
import { Button, Card, ErrorMessage, Field, Input } from '../components/ui'

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

  // Already signed in (or just signed in): go to this role's home page.
  // If the profile failed to load, "/" lets RequireRole show that error.
  if (session && !loading) {
    return <Navigate to={profile ? homePathFor(profile.role) : '/'} replace />
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

const Page = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 4px solid ${({ theme }) => theme.colors.accent};
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.brand};
`

const Subtitle = styled.p`
  margin: -8px 0 0;
  color: ${({ theme }) => theme.colors.muted};
`

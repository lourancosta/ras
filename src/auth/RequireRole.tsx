import { Navigate, Outlet } from 'react-router'
import type { Enums } from '../lib/database.types'
import { FullPageMessage } from '../components/FullPageMessage'
import { Button } from '../components/ui'
import { homePathFor, useAuth } from './auth-context'

// Route guard used as a parent route: renders the child routes (<Outlet />)
// only for a signed-in user with the given role.
// This is UX only. Real protection is Row Level Security in the database:
// even if someone bypasses this, Supabase won't return data they can't access.
export function RequireRole({ role }: { role: Enums<'user_role'> }) {
  const { session, profile, loading, profileError, signOut } = useAuth()

  if (loading) return <FullPageMessage>Loading…</FullPageMessage>

  if (!session) return <Navigate to="/login" replace />

  if (profileError || !profile) {
    return (
      <FullPageMessage>
        <p>{profileError ?? 'Your account has no profile. Please contact an admin.'}</p>
        <Button onClick={signOut}>Sign out</Button>
      </FullPageMessage>
    )
  }

  // Signed in but wrong role (e.g. an admin opening "/"): send them to their own home.
  if (profile.role !== role) return <Navigate to={homePathFor(profile.role)} replace />

  return <Outlet />
}

import { Navigate, Outlet } from 'react-router'
import { FullPageMessage } from '../../components/FullPageMessage/FullPageMessage'
import { Button } from '../../components/ui'
import { useAuth } from './auth-context'

// Route guard used as a parent route: renders the child routes (<Outlet />) only
// once we know who is signed in and have their profile (name + role).
// Which routes exist depends on the role (see App.tsx), so no role check here.
// This is UX only. Real protection is Row Level Security in the database:
// even if someone bypasses this, Supabase won't return data they can't access.
export function RequireAuth() {
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

  // Deactivated by an admin (Settings > Workers). The database also blocks new forms
  // and photos for inactive users (0004_workers.sql); this just explains why.
  if (!profile.is_active) {
    return (
      <FullPageMessage>
        <p>Your account is inactive. Please contact an admin.</p>
        <Button onClick={signOut}>Sign out</Button>
      </FullPageMessage>
    )
  }

  return <Outlet />
}

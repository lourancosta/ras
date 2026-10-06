import { createContext, useContext } from 'react'
import type { AuthError, Session } from '@supabase/supabase-js'
import type { Tables } from '../../lib/database.types'

export type Profile = Tables<'profiles'>

export type AuthState = {
  session: Session | null
  profile: Profile | null
  // True until we know whether someone is signed in (and have their profile).
  loading: boolean
  // Set if the user is signed in but their profile couldn't be loaded.
  profileError: string | null
  // Returns the error (null = signed in), so the login page can pick the message.
  signIn: (email: string, password: string) => Promise<AuthError | null>
  signOut: () => Promise<void>
}

// Kept in its own file (not AuthProvider.tsx) so Vite fast refresh keeps working:
// files that export React components should only export components.
export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>')
  return auth
}

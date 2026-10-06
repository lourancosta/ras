import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { AuthContext, type AuthState, type Profile } from './auth-context'

// Result of loading one user's profile. We remember which user it belongs to,
// so a stale profile is never shown after signing out or switching accounts.
type ProfileResult = {
  userId: string
  profile: Profile | null
  error: string | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // undefined = we haven't heard from Supabase yet; null = signed out.
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(null)

  // 1. Track the session. onAuthStateChange fires right away with the stored
  //    session (INITIAL_SESSION), then on every sign in / sign out / token refresh.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // 2. Load the profile (name + role) whenever the signed-in user changes.
  //    Done in a separate effect because Supabase advises against awaiting
  //    other Supabase calls inside the onAuthStateChange callback.
  const userId = session?.user.id
  useEffect(() => {
    if (!userId) return
    let cancelled = false // ignore the response if the user changed meanwhile

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        setProfileResult({
          userId,
          profile: data,
          error: error ? 'Could not load your profile. Please try again or contact an admin.' : null,
        })
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  // Derived values (no extra state needed).
  const currentResult = userId && profileResult?.userId === userId ? profileResult : null
  const loading = session === undefined || (!!userId && !currentResult)

  const value: AuthState = {
    session: session ?? null,
    profile: currentResult?.profile ?? null,
    profileError: currentResult?.error ?? null,
    loading,
    // On success there's nothing else to do: onAuthStateChange (above) gets the new session.
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      return error
    },
    signOut: async () => {
      await supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

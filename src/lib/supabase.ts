import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Public values only. The publishable key is safe in the browser because
// Row Level Security decides what each signed-in user can read or write.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY (see .env.example)')
}

// Safety net: the secret key bypasses RLS and must never reach the browser
// (Supabase also rejects it from browsers, so sign-in would fail anyway).
if (key.startsWith('sb_secret_')) {
  throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY is a secret key. Use the publishable key (sb_publishable_...).')
}

// One client for the whole app; it also stores and refreshes the auth session.
export const supabase = createClient<Database>(url, key)

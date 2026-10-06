// Queries for Settings > Workers.
// Reading: admins read every profile (RLS, 0002). Writing (create / edit name, email,
// role, status, password) goes through the `manage-worker` Edge Function
// (supabase/functions/manage-worker): email and password live in Supabase Auth, and
// changing them needs the secret key, which only the server has.
import { FunctionsHttpError } from '@supabase/supabase-js'
import type { Enums, Tables } from '../../lib/database.types'
import { supabase } from '../../lib/supabase'

export type Worker = Tables<'profiles'>
export type Role = Enums<'user_role'>

// Everyone with an account (framers and admins), A to Z.
export async function fetchWorkers(): Promise<Worker[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('full_name')
  if (error) throw error
  return data
}

export type NewWorker = { full_name: string; email: string; password: string; role: Role }

// Creates the login + profile. Returns the new profile.
export function createWorker(input: NewWorker): Promise<Worker> {
  return callManageWorker({ action: 'create', ...input })
}

// Only the fields given change; `password` sets a new one.
export type WorkerChanges = Partial<{
  full_name: string
  email: string
  role: Role
  is_active: boolean
  password: string
}>

export function updateWorker(id: string, changes: WorkerChanges): Promise<Worker> {
  return callManageWorker({ action: 'update', id, ...changes })
}

// Calls the Edge Function. invoke() sends the signed-in user's token automatically;
// the function checks it belongs to an active admin.
// Throws an Error whose message can be shown to the admin.
async function callManageWorker(body: Record<string, unknown>): Promise<Worker> {
  const { data, error } = await supabase.functions.invoke<{ worker: Worker }>('manage-worker', { body })

  if (error) {
    // The function answered with an error status: its JSON body says why ({ error }).
    if (error instanceof FunctionsHttpError) {
      const errorBody = await error.context.json().catch(() => null)
      throw new Error(errorBody?.error ?? 'Could not save the worker. Please try again.')
    }
    // Couldn't reach the function at all (offline, or not deployed yet).
    throw new Error('Could not reach the server. Please check your connection and try again.')
  }
  if (!data) throw new Error('Could not save the worker. Please try again.')
  return data.worker
}

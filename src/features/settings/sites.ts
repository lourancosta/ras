// Queries for Settings > Job sites. Row Level Security: every signed-in user can read
// sites, only admins can add or change them ("sites: admins manage" in 0002).
import type { Tables } from '../../lib/database.types'
import { supabase } from '../../lib/supabase'

export type Site = Tables<'sites'>

// Every site, active and inactive, A to Z.
export async function fetchSites(): Promise<Site[]> {
  const { data, error } = await supabase.from('sites').select('*').order('name')
  if (error) throw error
  return data
}

// Adds a site and returns the saved row (with its id). New sites start active
// (column default). `.select().single()` returns the inserted row, and turns
// "0 rows" (blocked by RLS) into an error instead of a silent no-op.
export async function createSite(site: { name: string; address: string | null }): Promise<Site> {
  const { data, error } = await supabase.from('sites').insert(site).select().single()
  if (error) throw error
  return data
}

// Changes a site's name, address and/or active flag; returns the saved row.
// Forms keep pointing at the site by id, so a rename shows on old forms too.
// Deactivating hides it from new forms (RLS also rejects new forms on inactive sites).
export async function updateSite(
  id: string,
  changes: { name: string; address: string | null; is_active: boolean },
): Promise<Site> {
  const { data, error } = await supabase.from('sites').update(changes).eq('id', id).select().single()
  if (error) throw error
  return data
}

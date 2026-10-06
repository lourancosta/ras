// Queries for reading submissions. Row Level Security decides which rows come back:
// framers only get their own, admins get everyone's.
import type { ReviewDecision, Status } from './status'
import { checklistKeys, type ChecklistAnswers, type ChecklistKey } from './checklist'
import { PHOTO_BUCKET } from './photos'
import { supabase } from '../../lib/supabase'

// Signed photo URLs work for 1 hour, then the page must be reloaded.
// The bucket is private, so this is the only way to show a photo.
const SIGNED_URL_SECONDS = 60 * 60

// Number of photos from a `submission_photos(count)` join, which comes back as [{ count: n }].
export function photoCountOf(photos: { count: number }[]): number {
  return photos[0]?.count ?? 0
}

// What the new form sends (the framer's own id comes from their profile).
export type NewSubmission = {
  userId: string
  siteId: string
  workDate: string // 'YYYY-MM-DD'
  checklist: ChecklistAnswers
  notes: string
}

// Saves a new safety form and returns its id (needed for the photo paths).
// Throws the PostgrestError, so the page can turn its code into a clear message
// (23505 = already submitted for this site and date, 42501 = rejected by RLS).
export async function createSubmission(input: NewSubmission): Promise<string> {
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      user_id: input.userId,
      site_id: input.siteId,
      work_date: input.workDate,
      ...input.checklist, // the 8 boolean columns
      notes: input.notes.trim() || null,
      // status, reviewed_by and reviewed_at use the DB defaults.
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

// Max rows in "My submissions"; filters narrow it down.
export const MY_ROW_LIMIT = 100

// "My submissions" filters, as the query needs them (dates already resolved).
export type MySubmissionQuery = {
  siteId?: string
  status?: Status
  from?: string // 'YYYY-MM-DD', inclusive
  to?: string // 'YYYY-MM-DD', inclusive
  issue?: 'any' | ChecklistKey // 'any' = at least one "No"; a key = that item "No"
}

// The signed-in framer's submissions, filtered, newest first. Filtering happens in the
// database (not in the browser), so it finds older forms too, beyond the row limit.
export async function fetchMySubmissions(userId: string, filters: MySubmissionQuery = {}) {
  let query = supabase
    .from('submissions')
    // `site:sites(name)` follows the site_id foreign key (a join) and names the result "site".
    // `submission_photos(count)` returns only the number of photos, not the rows.
    .select('*, site:sites(name), submission_photos(count)')
    // RLS already limits framers to their own rows; the filter makes the intent explicit.
    .eq('user_id', userId)

  // Each filter is only added when it has a value.
  if (filters.siteId) query = query.eq('site_id', filters.siteId)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.from) query = query.gte('work_date', filters.from)
  if (filters.to) query = query.lte('work_date', filters.to)
  if (filters.issue === 'any') {
    // OR across the 8 columns: "ppe_hard_hat.eq.false,ppe_vest.eq.false,..."
    query = query.or(checklistKeys.map((key) => `${key}.eq.false`).join(','))
  } else if (filters.issue) {
    query = query.eq(filters.issue, false)
  }

  const { data, error } = await query
    .order('work_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(MY_ROW_LIMIT)

  if (error) throw error
  return data
}

export type MySubmission = Awaited<ReturnType<typeof fetchMySubmissions>>[number]

// Has this framer submitted a form dated today? For the daily reminder, which must not
// depend on the list's filters. Count only, no rows.
export async function fetchSubmittedToday(userId: string, today: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('work_date', today)
  if (error) throw error
  return (count ?? 0) > 0
}

// Active sites, for the new form's dropdown. Inactive sites are hidden here, and the
// database rejects them too (RLS insert policy).
export async function fetchActiveSites() {
  const { data, error } = await supabase.from('sites').select('id, name').eq('is_active', true).order('name')
  if (error) throw error
  return data
}

// Sites for the "Site" filter: all of them, inactive too (old forms are still history).
export async function fetchSiteOptions() {
  const { data, error } = await supabase.from('sites').select('id, name, is_active').order('name')
  if (error) throw error
  return data
}

// One submission with site, worker name and photos (with signed URLs).
// Returns null if it doesn't exist or the user isn't allowed to see it
// (RLS makes both cases look the same: no row).
export async function fetchSubmissionDetail(id: string) {
  const { data: submission, error } = await supabase
    .from('submissions')
    // submissions has two foreign keys to profiles (user_id and reviewed_by),
    // so `!submissions_..._fkey` says which one to follow for the worker / reviewer.
    // Framers get reviewer = null: RLS only lets them read their own profile.
    .select(
      '*, site:sites(name), worker:profiles!submissions_user_id_fkey(full_name), reviewer:profiles!submissions_reviewed_by_fkey(full_name), submission_photos(id, storage_path, created_at)',
    )
    .eq('id', id)
    .maybeSingle() // 0 rows -> null instead of an error

  // 22P02 = invalid text for a uuid (e.g. /submissions/abc): treat as "not found".
  if (error?.code === '22P02') return null
  if (error) throw error
  if (!submission) return null

  const photoRows = [...submission.submission_photos].sort((a, b) => a.created_at.localeCompare(b.created_at))

  // One request signs all paths. Each signed URL is a temporary link to a private file.
  let photos: { id: string; url: string }[] = []
  if (photoRows.length > 0) {
    const { data: signed, error: signError } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(
      photoRows.map((photo) => photo.storage_path),
      SIGNED_URL_SECONDS,
    )
    if (signError) throw signError

    // Results come back in the same order as the paths.
    photos = photoRows.flatMap((photo, index) => {
      const url = signed[index]?.signedUrl
      return url ? [{ id: photo.id, url }] : []
    })
  }

  return { submission, photos }
}

export type SubmissionDetailData = NonNullable<Awaited<ReturnType<typeof fetchSubmissionDetail>>>

// ---------- Admin ----------

// Filters for the admin table. Empty / undefined = no filter.
export type SubmissionFilters = {
  siteId?: string
  workerId?: string
  status?: Status
  from?: string // 'YYYY-MM-DD', inclusive
  to?: string // 'YYYY-MM-DD', inclusive
}

// Max rows in the admin table. Filters narrow it down; a counter tells the
// admin when the limit is reached.
export const ADMIN_ROW_LIMIT = 200

// All submissions (RLS: admins see everyone's), filtered, newest first.
export async function fetchSubmissions(filters: SubmissionFilters) {
  let query = supabase
    .from('submissions')
    .select(
      '*, site:sites(name), worker:profiles!submissions_user_id_fkey(full_name), submission_photos(count)',
    )

  // Each filter is only added when it has a value.
  if (filters.siteId) query = query.eq('site_id', filters.siteId)
  if (filters.workerId) query = query.eq('user_id', filters.workerId)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.from) query = query.gte('work_date', filters.from)
  if (filters.to) query = query.lte('work_date', filters.to)

  const { data, error } = await query
    .order('work_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(ADMIN_ROW_LIMIT)

  if (error) throw error
  return data
}

export type AdminSubmission = Awaited<ReturnType<typeof fetchSubmissions>>[number]

// Options for the filter dropdowns: every site and every framer, inactive ones too
// (their old forms are still history).
export async function fetchFilterOptions() {
  const [sites, workers] = await Promise.all([
    supabase.from('sites').select('id, name, is_active').order('name'),
    supabase.from('profiles').select('id, full_name, is_active').eq('role', 'framer').order('full_name'),
  ])
  if (sites.error) throw sites.error
  if (workers.error) throw workers.error
  return { sites: sites.data, workers: workers.data }
}

export type FilterOptions = Awaited<ReturnType<typeof fetchFilterOptions>>

// Admin review: set the status and record who reviewed it and when.
// The database allows admins to update only these three columns (column-level
// grant in 0002/0003), and RLS rejects the update for anyone who isn't an admin.
export async function reviewSubmission(
  id: string,
  status: ReviewDecision,
  reviewerId: string,
) {
  const { data, error } = await supabase
    .from('submissions')
    .update({ status, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    // Return the saved values. If RLS blocked the update, 0 rows come back and
    // .single() turns that into an error instead of a silent "success".
    .select('status, reviewed_by, reviewed_at')
    .single()

  if (error) throw error
  return data
}

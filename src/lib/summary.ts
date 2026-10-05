// Data for the admin summary page: today's status and the last 14 days.
// Loaded with a few small queries, then counted in the browser (the data is small).
import { addDays } from './dates'
import { supabase } from './supabase'

export const SUMMARY_DAYS = 14

export async function fetchSummary(today: string) {
  const since = addDays(today, -(SUMMARY_DAYS - 1)) // 14 days including today

  const [framers, sites, recent, pending, flagged] = await Promise.all([
    supabase.from('profiles').select('id, full_name').eq('role', 'framer').order('full_name'),
    supabase.from('sites').select('id, name, is_active').order('name'),
    supabase
      .from('submissions')
      .select('id, user_id, site_id, work_date, status')
      .gte('work_date', since)
      .lte('work_date', today),
    // head: true = only the count, no rows.
    supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'flagged'),
  ])

  for (const result of [framers, sites, recent, pending, flagged]) {
    if (result.error) throw result.error
  }

  const framerList = framers.data ?? []
  const siteList = sites.data ?? []
  const recentList = recent.data ?? []
  const nameById = new Map(framerList.map((f) => [f.id, f.full_name]))

  // ---- Today ----
  const todays = recentList.filter((s) => s.work_date === today)
  const submittedTodayIds = new Set(todays.map((s) => s.user_id))
  // Assumption: every framer is expected to submit every working day.
  const notSubmittedToday = framerList.filter((f) => !submittedTodayIds.has(f.id))

  // Who submitted today, grouped by site (a framer on two sites appears under both).
  const todayBySite = siteList
    .map((site) => ({
      site: site.name,
      workers: todays
        .filter((s) => s.site_id === site.id)
        .map((s) => nameById.get(s.user_id) ?? 'Unknown')
        .sort(),
    }))
    .filter((group) => group.workers.length > 0)

  // ---- Last 14 days ----
  // Forms per site: active sites always listed (0 is information too);
  // inactive sites only if they had forms in the period.
  const perSite = siteList
    .map((site) => ({
      name: site.name,
      forms: recentList.filter((s) => s.site_id === site.id).length,
      isActive: site.is_active,
    }))
    .filter((row) => row.isActive || row.forms > 0)
    .sort((a, b) => b.forms - a.forms)

  // Forms per day, including days with 0 forms (e.g. Sundays) so gaps are visible.
  const perDay = Array.from({ length: SUMMARY_DAYS }, (_, i) => {
    const date = addDays(since, i)
    return { date, forms: recentList.filter((s) => s.work_date === date).length }
  })

  return {
    framerCount: framerList.length,
    submittedTodayCount: submittedTodayIds.size,
    notSubmittedToday,
    todayBySite,
    pendingCount: pending.count ?? 0,
    flaggedCount: flagged.count ?? 0,
    perSite,
    perDay,
  }
}

export type Summary = Awaited<ReturnType<typeof fetchSummary>>

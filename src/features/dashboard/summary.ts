// Data for the dashboards: today's status and the last 14 days.
// Loaded with a few small queries, then counted in the browser (the data is small).
import { checklistGroups, countIssues } from '../submissions/checklist'
import { RECENT_DAYS } from '../submissions/myFilters'
import { addDays } from '../../lib/dates'
import { supabase } from '../../lib/supabase'

// Same window as the "Last 14 days" filter on My submissions, so dashboard links match.
export const SUMMARY_DAYS = RECENT_DAYS

export async function fetchSummary(today: string) {
  const since = addDays(today, -(SUMMARY_DAYS - 1)) // 14 days including today

  const [framers, sites, recent, pending, flagged] = await Promise.all([
    supabase.from('profiles').select('id, full_name, is_active').eq('role', 'framer').order('full_name'),
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
  // Inactive framers aren't expected to submit (but their forms still count below).
  const activeFramers = framerList.filter((f) => f.is_active)
  const notSubmittedToday = activeFramers.filter((f) => !submittedTodayIds.has(f.id))

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
      count: recentList.filter((s) => s.site_id === site.id).length,
      isActive: site.is_active,
    }))
    .filter((row) => row.isActive || row.count > 0)
    .sort((a, b) => b.count - a.count)

  // Forms per day, including days with 0 forms (e.g. Sundays) so gaps are visible.
  const perDay = Array.from({ length: SUMMARY_DAYS }, (_, i) => {
    const date = addDays(since, i)
    return { date, forms: recentList.filter((s) => s.work_date === date).length }
  })

  return {
    framerCount: activeFramers.length,
    // Active framers only, to match framerCount ("3 / 6 workers submitted today").
    submittedTodayCount: activeFramers.length - notSubmittedToday.length,
    notSubmittedToday,
    todayBySite,
    pendingCount: pending.count ?? 0,
    flaggedCount: flagged.count ?? 0,
    perSite,
    perDay,
  }
}

export type Summary = Awaited<ReturnType<typeof fetchSummary>>

// ---------- Framer: "my" dashboard ----------

// The signed-in framer's own numbers. Row Level Security only returns their rows;
// the user_id filters make the intent explicit (same as fetchMySubmissions).
export async function fetchMySummary(userId: string, today: string) {
  const since = addDays(today, -(SUMMARY_DAYS - 1)) // 14 days including today

  const [recent, flagged] = await Promise.all([
    supabase
      .from('submissions')
      .select('*') // the checklist answers are needed to count issues
      .eq('user_id', userId)
      .gte('work_date', since)
      .lte('work_date', today),
    // All time, not only 14 days: a flagged form still needs attention. Count only.
    supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'flagged'),
  ])

  if (recent.error) throw recent.error
  if (flagged.error) throw flagged.error
  const recentList = recent.data ?? []

  // Forms per day, including days with 0 forms so missed days are visible.
  const perDay = Array.from({ length: SUMMARY_DAYS }, (_, i) => {
    const date = addDays(since, i)
    return { date, forms: recentList.filter((s) => s.work_date === date).length }
  })

  // How often each checklist item was answered "No", most frequent first.
  // All 8 items are listed: 0 is information too ("never an issue").
  const perItem = checklistGroups
    .flatMap((group) => group.items)
    .map((item) => ({
      id: item.key, // so a click on the bar can filter My submissions by this item
      name: item.label,
      count: recentList.filter((s) => !s[item.key]).length,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    submittedToday: recentList.some((s) => s.work_date === today),
    formsCount: recentList.length,
    issuesCount: recentList.reduce((total, s) => total + countIssues(s), 0),
    flaggedCount: flagged.count ?? 0,
    perDay,
    perItem,
  }
}

export type MySummary = Awaited<ReturnType<typeof fetchMySummary>>

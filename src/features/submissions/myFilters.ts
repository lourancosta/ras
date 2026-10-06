// Filters for "My submissions", kept in the URL:
//   /my-submissions?site=<id>&status=flagged&period=week&issue=any
// One place for the rules, used by the page (to read them) and by the framer's
// dashboard (to build links), so a dashboard click always lands on matching filters.
import { addDays, startOfMonth, startOfWeek } from '../../lib/dates'
import { checklistKeys, type ChecklistKey } from './checklist'
import { parseStatus, type Status } from './status'

// "Last 14 days" matches the framer dashboard's tiles and charts (summary.ts uses this too).
export const RECENT_DAYS = 14

export type DatePreset = 'today' | 'week' | 'month' | 'recent'
export const DATE_PRESETS: DatePreset[] = ['today', 'week', 'month', 'recent']
export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Today',
  week: 'This week',
  month: 'This month',
  recent: `Last ${RECENT_DAYS} days`,
}

// 'any' = at least one checklist item answered "No"; a key = that item answered "No".
export type IssueFilter = 'any' | ChecklistKey

export type MyFilters = {
  siteId?: string
  status?: Status
  period?: DatePreset // a preset range ending today...
  date?: string // ...or one exact day 'YYYY-MM-DD' (from a dashboard chart bar)
  issue?: IssueFilter
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// URL -> filters. Unknown values (a typo, an old link) are ignored, never sent to the DB.
export function parseMyFilters(params: URLSearchParams): MyFilters {
  const status = params.get('status')
  const period = params.get('period')
  const date = params.get('date')
  const issue = params.get('issue')
  return {
    siteId: params.get('site') || undefined,
    status: parseStatus(status),
    period: DATE_PRESETS.find((p) => p === period),
    date: date && DATE_PATTERN.test(date) ? date : undefined,
    issue: issue === 'any' ? 'any' : checklistKeys.find((key) => key === issue),
  }
}

// Filters -> link to the page, e.g. mySubmissionsLink({ status: 'flagged' }).
export function mySubmissionsLink(filters: MyFilters): string {
  const params = new URLSearchParams()
  if (filters.siteId) params.set('site', filters.siteId)
  if (filters.status) params.set('status', filters.status)
  if (filters.period) params.set('period', filters.period)
  if (filters.date) params.set('date', filters.date)
  if (filters.issue) params.set('issue', filters.issue)
  const query = params.toString()
  return query ? `/my-submissions?${query}` : '/my-submissions'
}

// The work_date range the date filter means, inclusive. Every range ends today:
// forms can't be dated in the future (RLS), so "this week" = Monday to today.
export function dateRangeFor(filters: MyFilters, today: string): { from?: string; to?: string } {
  if (filters.date) return { from: filters.date, to: filters.date }
  switch (filters.period) {
    case 'today':
      return { from: today, to: today }
    case 'week':
      return { from: startOfWeek(today), to: today }
    case 'month':
      return { from: startOfMonth(today), to: today }
    case 'recent':
      return { from: addDays(today, -(RECENT_DAYS - 1)), to: today } // 14 days including today
    default:
      return {}
  }
}

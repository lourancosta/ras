// All "today" logic uses Vancouver time, the same rule the database uses
// (0002_security.sql: work_date <= today in America/Vancouver).
const TIME_ZONE = 'America/Vancouver'

// Today as 'YYYY-MM-DD' (the format of <input type="date"> and Postgres `date`).
// The en-CA locale formats dates as YYYY-MM-DD.
export function todayInVancouver(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date())
}

// 'YYYY-MM-DD' -> e.g. "Mon, Oct 5, 2026".
// Built from parts (not new Date('2026-10-05'), which is parsed as UTC
// and can show the previous day in Vancouver).
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Timestamp (e.g. created_at) -> e.g. "Oct 5, 2026, 7:42 a.m." in Vancouver time.
export function formatDateTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString('en-CA', {
    timeZone: TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// 'YYYY-MM-DD' plus/minus whole days, e.g. addDays('2026-10-05', -13) = '2026-09-22'.
// Done in UTC so daylight-saving changes can't shift the result.
export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

// 'YYYY-MM-DD' -> short axis label, e.g. "Oct 5".
export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

// Monday of the week that contains `isoDate` (weeks start on Monday, as on a work schedule).
// getUTCDay(): 0 = Sunday ... 6 = Saturday, so Sunday goes back 6 days.
export function startOfWeek(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return addDays(isoDate, weekday === 0 ? -6 : 1 - weekday)
}

// First day of the month that contains `isoDate`, e.g. '2026-10-05' -> '2026-10-01'.
export function startOfMonth(isoDate: string): string {
  return `${isoDate.slice(0, 8)}01`
}

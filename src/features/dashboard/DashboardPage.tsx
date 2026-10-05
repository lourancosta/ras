import { lazy, Suspense } from 'react'
import { Hint } from '../../components/ui'
import { can } from '../../lib/permissions'
import { useAuth } from '../auth/auth-context'

// Each dashboard is loaded only when opened: the charts library (Recharts) is
// large, and a framer on phone data who only fills in forms never downloads it.
// Vite puts each one in a separate file.
const OverviewDashboard = lazy(() =>
  import('./OverviewDashboard/OverviewDashboard').then((module) => ({
    default: module.OverviewDashboard,
  })),
)
const PersonalDashboard = lazy(() =>
  import('./PersonalDashboard/PersonalDashboard').then((module) => ({
    default: module.PersonalDashboard,
  })),
)

// /dashboard: one URL for everyone. Who sees what is decided by permission:
// everyone's numbers (Overview) or only your own (Personal).
export function DashboardPage() {
  const { profile } = useAuth()

  return (
    // Shown while the dashboard's file downloads (usually a split second).
    <Suspense fallback={<Hint>Loading…</Hint>}>
      {can(profile?.role, 'dashboard.viewAll') ? <OverviewDashboard /> : <PersonalDashboard />}
    </Suspense>
  )
}

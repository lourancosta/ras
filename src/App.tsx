import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { homePathFor, useAuth } from './auth/auth-context'
import { RequireAuth } from './auth/RequireAuth'
import { AppLayout } from './components/AppLayout/AppLayout'
import { Hint } from './components/ui'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SubmissionDetailPage } from './pages/SubmissionDetailPage/SubmissionDetailPage'
import { SubmissionsPage } from './pages/admin/SubmissionsPage/SubmissionsPage'
import { MySubmissionsPage } from './pages/framer/MySubmissionsPage/MySubmissionsPage'
import { NewSubmissionPage } from './pages/framer/NewSubmissionPage/NewSubmissionPage'

// Dashboards are loaded only when opened: the charts library (Recharts) is large,
// and a framer on phone data who only fills in forms never downloads it.
// Vite puts each one in a separate file.
const DashboardPage = lazy(() =>
  import('./pages/admin/DashboardPage/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const MyDashboardPage = lazy(() =>
  import('./pages/framer/MyDashboardPage/MyDashboardPage').then((module) => ({
    default: module.MyDashboardPage,
  })),
)

// Route tree. The signed-in user's role decides which routes exist at all:
// an admin has no /my-submissions, a framer has no /submissions (they get the 404 page).
// Parent routes without a path only wrap their children: RequireAuth waits for the
// session + profile, AppLayout adds the side menu around the page.
export default function App() {
  const { profile } = useAuth()
  // undefined while loading or signed out: then RequireAuth shows "Loading…" or
  // redirects to /login, so no role routes are needed yet.
  const role = profile?.role

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        {/* "/" isn't a page: it sends each user to their own home. */}
        {role && <Route index element={<Navigate to={homePathFor(role)} replace />} />}

        <Route element={<AppLayout />}>
          {role === 'admin' && (
            <>
              <Route
                path="dashboard"
                element={
                  // Shown while the page's file downloads (usually a split second).
                  <Suspense fallback={<Hint>Loading…</Hint>}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route path="submissions" element={<SubmissionsPage />} />
              <Route
                path="submissions/:id"
                element={
                  <SubmissionDetailPage backTo="/submissions" backLabel="Back to all submissions" canReview />
                }
              />
            </>
          )}

          {role === 'framer' && (
            <>
              {/* Same URL as the admin's dashboard, but only this framer's data. */}
              <Route
                path="dashboard"
                element={
                  <Suspense fallback={<Hint>Loading…</Hint>}>
                    <MyDashboardPage />
                  </Suspense>
                }
              />
              <Route path="my-submissions" element={<MySubmissionsPage />} />
              {/* "new" is a fixed segment, so React Router ranks it above ":id". */}
              <Route path="my-submissions/new" element={<NewSubmissionPage />} />
              <Route
                path="my-submissions/:id"
                element={<SubmissionDetailPage backTo="/my-submissions" backLabel="Back to my submissions" />}
              />
            </>
          )}
        </Route>

        {/* Inside RequireAuth: while the profile loads this shows "Loading…" instead of
            flashing "Page not found", and signed-out users go to /login. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

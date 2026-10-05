import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { RequireRole } from './auth/RequireRole'
import { AppLayout } from './components/AppLayout'
import { Hint } from './components/ui'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SubmissionDetailPage } from './pages/SubmissionDetailPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { MySubmissionsPage } from './pages/framer/MySubmissionsPage'
import { NewSubmissionPage } from './pages/framer/NewSubmissionPage'

// Loaded only when an admin opens it: the charts library (Recharts) is large and
// framers on phone data never need it. Vite puts it in a separate file.
const SummaryPage = lazy(() =>
  import('./pages/admin/SummaryPage').then((module) => ({ default: module.SummaryPage })),
)

// Route tree. Parent routes without a path only wrap their children:
// RequireRole checks the role, AppLayout adds the header around the page.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireRole role="framer" />}>
        <Route element={<AppLayout />}>
          <Route index element={<MySubmissionsPage />} />
          <Route path="new" element={<NewSubmissionPage />} />
          <Route
            path="forms/:id"
            element={<SubmissionDetailPage backTo="/" backLabel="Back to my forms" />}
          />
        </Route>
      </Route>

      <Route element={<RequireRole role="admin" />}>
        <Route element={<AppLayout />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route
            path="admin/summary"
            element={
              // Shown while the page's file downloads (usually a split second).
              <Suspense fallback={<Hint>Loading…</Hint>}>
                <SummaryPage />
              </Suspense>
            }
          />
          <Route
            path="admin/forms/:id"
            element={<SubmissionDetailPage backTo="/admin" backLabel="Back to dashboard" canReview />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './components/AppLayout/AppLayout'
import { NotFoundPage } from './components/NotFoundPage'
import { useAuth } from './features/auth/auth-context'
import { LoginPage } from './features/auth/LoginPage/LoginPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { homePathFor, routesFor } from './routes'

// Route tree. The pages themselves are listed in routes.tsx; only the ones the
// signed-in user has permission for are registered here, so e.g. a framer opening
// /submissions gets the 404 page. Parent routes without a path only wrap their
// children: RequireAuth waits for the session + profile, AppLayout adds the side menu.
export default function App() {
  const { profile } = useAuth()
  // undefined while loading or signed out: then no pages are allowed yet and
  // RequireAuth shows "Loading…" or redirects to /login.
  const role = profile?.role
  const home = homePathFor(role)

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        {/* "/" isn't a page: it sends each user to their own home. */}
        {home && <Route index element={<Navigate to={home} replace />} />}

        <Route element={<AppLayout />}>
          {routesFor(role).map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Inside RequireAuth: while the profile loads this shows "Loading…" instead of
            flashing "Page not found", and signed-out users go to /login. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

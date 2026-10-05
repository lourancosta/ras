import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ClipboardList, LayoutDashboard } from 'lucide-react'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { AllSubmissionsPage } from './features/submissions/AllSubmissionsPage/AllSubmissionsPage'
import { MySubmissionsPage } from './features/submissions/MySubmissionsPage/MySubmissionsPage'
import { NewSubmissionPage } from './features/submissions/NewSubmissionPage/NewSubmissionPage'
import { SubmissionDetailPage } from './features/submissions/SubmissionDetailPage/SubmissionDetailPage'
import { can, type Permission, type Role } from './lib/permissions'

type AppRoute = {
  path: string
  element: ReactNode
  permissions: Permission[] // the user needs at least one of these
  menu?: { label: string; icon: LucideIcon } // shown in the side menu if set
}

// Every page of the signed-in app, in one place. This table drives:
// - the routes App.tsx registers (only the ones the user may open),
// - the side menu (entries with `menu`, in this order),
// - the home page after login (see homePathFor).
// Adding a page = adding one entry here. (/login and the 404 page aren't in the
// table: they're the same for everyone, signed in or not.)
const appRoutes: AppRoute[] = [
  {
    // One URL for everyone; DashboardPage shows everyone's or only your own numbers.
    path: '/dashboard',
    element: <DashboardPage />,
    permissions: ['dashboard.viewAll', 'dashboard.viewOwn'],
    menu: { label: 'Dashboard', icon: LayoutDashboard },
  },
  {
    // NavLink matches by prefix, so the menu item stays highlighted on /submissions/:id.
    path: '/submissions',
    element: <AllSubmissionsPage />,
    permissions: ['submissions.viewAll'],
    menu: { label: 'All Submissions', icon: ClipboardList },
  },
  {
    path: '/submissions/:id',
    element: <SubmissionDetailPage backTo="/submissions" backLabel="Back to all submissions" />,
    permissions: ['submissions.viewAll'],
  },
  {
    // Highlighted on /my-submissions/new and /my-submissions/:id too (prefix match).
    // New form is a button on this page, not a menu item.
    path: '/my-submissions',
    element: <MySubmissionsPage />,
    permissions: ['submissions.viewOwn'],
    menu: { label: 'My submissions', icon: ClipboardList },
  },
  {
    // "new" is a fixed segment, so React Router ranks it above "/my-submissions/:id".
    path: '/my-submissions/new',
    element: <NewSubmissionPage />,
    permissions: ['submissions.create'],
  },
  {
    path: '/my-submissions/:id',
    element: <SubmissionDetailPage backTo="/my-submissions" backLabel="Back to my submissions" />,
    permissions: ['submissions.viewOwn'],
  },
]

// The pages this role may open. Empty while the profile loads (role undefined).
export function routesFor(role: Role | undefined): AppRoute[] {
  return appRoutes.filter((route) => route.permissions.some((permission) => can(role, permission)))
}

// Where each user lands after signing in: the first page in this list they may open.
// "My submissions" comes first because filling in the daily form is a framer's main job;
// users who can't (admins) land on the Dashboard.
const HOME_PRIORITY = ['/my-submissions', '/dashboard']

export function homePathFor(role: Role | undefined): string | undefined {
  const paths = routesFor(role).map((route) => route.path)
  return HOME_PRIORITY.find((path) => paths.includes(path)) ?? paths[0]
}

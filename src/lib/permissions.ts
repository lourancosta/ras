import type { Enums } from './database.types'

// What a user may do in the app. Pages and components check a permission,
// never a role name, so adding a role (e.g. "supervisor") means adding one entry
// to `permissionsByRole` below, not hunting for `role === 'admin'` in the code.
//
// This is UX only (which pages and buttons appear). The real rules are in the
// database (Row Level Security in 0002_security.sql), which still uses is_admin().
// If a permission is given to a new role here, RLS must allow the same, or the
// page will show but the data won't load / the save will fail.
export type Permission =
  | 'dashboard.viewAll' // dashboard with everyone's numbers
  | 'dashboard.viewOwn' // dashboard with only my numbers
  | 'submissions.viewAll' // the "All Submissions" table and any form's detail
  | 'submissions.viewOwn' // "My submissions" and my forms' detail
  | 'submissions.create' // fill in a new safety form
  | 'submissions.review' // mark a form reviewed / flagged

export type Role = Enums<'user_role'>

const permissionsByRole: Record<Role, Permission[]> = {
  admin: ['dashboard.viewAll', 'submissions.viewAll', 'submissions.review'],
  framer: ['dashboard.viewOwn', 'submissions.viewOwn', 'submissions.create'],
}

// `role` may be undefined while the profile loads or when signed out: then nothing is allowed.
export function can(role: Role | undefined, permission: Permission): boolean {
  return role ? permissionsByRole[role].includes(permission) : false
}

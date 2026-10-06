import type { Enums } from '../../lib/database.types'

// How each role is shown in the app.
export const ROLE_LABELS: Record<Enums<'user_role'>, string> = {
  admin: 'Admin',
  framer: 'Framer',
}

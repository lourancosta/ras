import type { LucideIcon } from 'lucide-react'
import { ClipboardList, LayoutDashboard, LogOut } from 'lucide-react'
import { Outlet } from 'react-router'
import { useAuth } from '../../auth/auth-context'
import type { Enums } from '../../lib/database.types'
import { Logo } from '../Logo/Logo'
import {
  Layout,
  Sidebar,
  LogoWrapper,
  Menu,
  MenuLink,
  MenuButton,
  Footer,
  UserName,
  Main,
} from './AppLayout.styles'

type MenuItem = {
  to: string
  label: string
  icon: LucideIcon
}

// Menu options per role. Adding a page = adding one line here.
const menuByRole: Record<Enums<'user_role'>, MenuItem[]> = {
  framer: [
    // Only this framer's own numbers (the admin's Dashboard shows everyone).
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // NavLink matches by prefix, so this stays highlighted on /my-submissions/new and
    // /my-submissions/:id too. New form is a button on that page, not a menu item.
    { to: '/my-submissions', label: 'My submissions', icon: ClipboardList },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // Prefix match: stays highlighted on a form's detail page (/submissions/:id).
    { to: '/submissions', label: 'All Submissions', icon: ClipboardList },
  ],
}

// Shell for every signed-in page: side menu (logo, role options, user, sign out) + page content.
// On phones the side menu becomes a bar at the top of the page.
export function AppLayout() {
  const { profile, signOut } = useAuth()
  const items = profile ? menuByRole[profile.role] : []

  return (
    <Layout>
      <Sidebar>
        <LogoWrapper>
          <Logo />
        </LogoWrapper>

        <Menu>
          {items.map(({ to, label, icon: Icon }) => (
            <MenuLink key={to} to={to}>
              <Icon size={20} aria-hidden="true" />
              {label}
            </MenuLink>
          ))}
        </Menu>

        <Footer>
          <UserName>{profile?.full_name}</UserName>
          <MenuButton onClick={signOut}>
            <LogOut size={20} aria-hidden="true" />
            Sign out
          </MenuButton>
        </Footer>
      </Sidebar>

      <Main>
        <Outlet />
      </Main>
    </Layout>
  )
}

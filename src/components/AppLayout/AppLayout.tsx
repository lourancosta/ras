import type { LucideIcon } from 'lucide-react'
import { BarChart3, ClipboardList, FilePlus, LayoutDashboard, LogOut } from 'lucide-react'
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
  end?: boolean // match the path exactly (needed for "/", which prefixes every path)
}

// Menu options per role. Adding a page = adding one line here.
const menuByRole: Record<Enums<'user_role'>, MenuItem[]> = {
  framer: [
    { to: '/', label: 'My forms', icon: ClipboardList, end: true },
    { to: '/new', label: 'New form', icon: FilePlus },
  ],
  admin: [
    // `end`: otherwise "/admin" would also be active on "/admin/summary".
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/summary', label: 'Summary', icon: BarChart3 },
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
          {items.map(({ to, label, icon: Icon, end }) => (
            <MenuLink key={to} to={to} end={end}>
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

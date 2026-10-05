import { LogOut } from 'lucide-react'
import { Outlet } from 'react-router'
import { useAuth } from '../../features/auth/auth-context'
import { routesFor } from '../../routes'
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

// Shell for every signed-in page: side menu (logo, pages, user, sign out) + page content.
// The menu lists the pages from routes.tsx that have a `menu` entry and that this user may open.
// On phones the side menu becomes a bar at the top of the page.
export function AppLayout() {
  const { profile, signOut } = useAuth()
  // Only entries with a `menu` become items (flatMap: [] skips the others).
  const items = routesFor(profile?.role).flatMap((route) =>
    route.menu ? [{ to: route.path, ...route.menu }] : [],
  )

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

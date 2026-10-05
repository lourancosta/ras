import type { LucideIcon } from 'lucide-react'
import { BarChart3, ClipboardList, FilePlus, LayoutDashboard, LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import styled, { css } from 'styled-components'
import { useAuth } from '../auth/auth-context'
import type { Enums } from '../lib/database.types'
import { Logo } from './Logo'

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

const Layout = styled.div`
  min-height: 100vh;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: grid;
    grid-template-columns: ${({ theme }) => theme.sidebarWidth} 1fr;
  }
`

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.brand};
  color: ${({ theme }) => theme.colors.brandText};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    /* Stays in view while the page content scrolls. */
    position: sticky;
    top: 0;
    height: 100vh;
    padding: 24px 16px;
  }
`

const LogoWrapper = styled.div`
  padding: 0 12px;
`

const Menu = styled.nav`
  display: flex;
  flex-wrap: wrap; /* phones: options side by side */
  gap: 4px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
  }
`

// Shared look for menu links and the sign-out button. `css` (not a plain string)
// so these styles can read the theme too.
const menuItemStyles = css`
  position: relative; /* anchor for the ::after underline */
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: none;
  border-radius: ${({ theme }) => theme.radius};
  background: transparent;
  color: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;

  /* Hover underline: a 2px line drawn with ::after instead of a real border,
     so it can animate (slide in from the left) and doesn't bend around the
     rounded corners. Hidden with scaleX(0) until hover; transform-origin
     makes it grow from its left edge. */
  &::after {
    content: '';
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.brandText};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.2s ease;
  }

  &:hover::after,
  &:focus-visible::after {
    transform: scaleX(1);
  }

  &:focus-visible {
    outline: none; /* the underline is the focus indicator */
  }

  /* Respect users who turned off animations in their OS settings. */
  @media (prefers-reduced-motion: reduce) {
    &::after {
      transition: none;
    }
  }
`

// NavLink adds the "active" class to the link for the current page.
const MenuLink = styled(NavLink)`
  ${menuItemStyles}

  &.active {
    background: ${({ theme }) => theme.colors.brandTint};
  }
`

const MenuButton = styled.button`
  ${menuItemStyles}
`

// Pushed to the bottom of the sidebar on desktop.
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-top: auto;
    flex-direction: column;
    align-items: stretch;
  }
`

const UserName = styled.span`
  padding: 0 12px;
  font-size: 0.9rem;
  opacity: 0.85;
`

// No max-width: pages use all the space next to the menu and resize with the window.
// Pages that read better narrow (the framer forms) set their own max-width.
const Main = styled.main`
  min-width: 0; /* lets wide content (the admin table) scroll inside instead of overflowing */
  padding: 24px 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.pagePaddingDesktop};
  }
`

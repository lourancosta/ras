import { useEffect, useState } from 'react'
import { ChevronDown, LogOut, Menu as MenuIcon, X } from 'lucide-react'
import { Outlet, useLocation } from 'react-router'
import { useAuth } from '../../features/auth/auth-context'
import { menuFor, type MenuGroupEntry } from '../../routes'
import { Logo } from '../Logo/Logo'
import {
  Layout,
  Sidebar,
  TopRow,
  LogoWrapper,
  MenuToggle,
  MenuPanel,
  Menu,
  MenuLink,
  MenuButton,
  GroupButton,
  GroupChevron,
  SubMenu,
  Footer,
  UserName,
  Backdrop,
  Main,
} from './AppLayout.styles'

// Shell for every signed-in page: side menu (logo, pages, user, sign out) + page content.
// The menu lists the pages from routes.tsx that have a `menu` entry and that this user may open.
// On phones the side menu becomes a top bar: logo on the left, a hamburger button on the
// right that opens a panel with the same content (pages, user, sign out).
export function AppLayout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  // Links and groups (e.g. Settings) this user may open, from the route table.
  const menu = menuFor(profile?.role)

  // Phone menu. We remember the page it was opened on, and it counts as open only while
  // we're still on that page: any navigation (a menu link, the browser's Back button)
  // closes it, with no effect needed (derived state, see the lint rule in CLAUDE.md).
  const [openOnPath, setOpenOnPath] = useState<string | null>(null)
  const menuOpen = openOnPath === location.pathname
  const closeMenu = () => setOpenOnPath(null)
  const toggleMenu = () => setOpenOnPath(menuOpen ? null : location.pathname)

  // Escape closes the open menu (keyboard users).
  useEffect(() => {
    if (!menuOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenOnPath(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <Layout>
      <Sidebar>
        <TopRow>
          <LogoWrapper>
            <Logo />
          </LogoWrapper>

          {/* Phones only (hidden on wide screens by its styles). */}
          <MenuToggle
            type="button"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="app-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={24} aria-hidden="true" /> : <MenuIcon size={24} aria-hidden="true" />}
          </MenuToggle>
        </TopRow>

        {/* Phones: hidden until the hamburger opens it. Wide screens: always shown. */}
        <MenuPanel id="app-menu" $open={menuOpen}>
          <Menu>
            {menu.map((entry) =>
              entry.kind === 'group' ? (
                <MenuGroup key={entry.label} group={entry} onNavigate={closeMenu} />
              ) : (
                // closeMenu: also closes when tapping the page you're already on.
                <MenuLink key={entry.to} to={entry.to} onClick={closeMenu}>
                  <entry.icon size={20} aria-hidden="true" />
                  {entry.label}
                </MenuLink>
              ),
            )}
          </Menu>

          <Footer>
            <UserName>{profile?.full_name}</UserName>
            <MenuButton onClick={signOut}>
              <LogOut size={20} aria-hidden="true" />
              Sign out
            </MenuButton>
          </Footer>
        </MenuPanel>
      </Sidebar>

      {/* Dims the page behind the open phone menu; tapping it closes the menu. */}
      {menuOpen && <Backdrop onClick={closeMenu} aria-hidden="true" />}

      <Main>
        <Outlet />
      </Main>
    </Layout>
  )
}

// A menu header (e.g. Settings) that opens to show its pages, indented below it.
// Open while you're on one of its pages; the header button can still close / reopen it.
function MenuGroup({ group, onNavigate }: { group: MenuGroupEntry; onNavigate: () => void }) {
  const { pathname } = useLocation()
  const containsCurrentPage = group.items.some((item) => pathname.startsWith(item.to))
  // null = the user hasn't clicked the header: follow the current page (derived, no effect).
  const [userOpen, setUserOpen] = useState<boolean | null>(null)
  const open = userOpen ?? containsCurrentPage
  const listId = `menu-group-${group.label.toLowerCase()}`

  return (
    <>
      <GroupButton
        type="button"
        onClick={() => setUserOpen(!open)}
        aria-expanded={open}
        aria-controls={listId}
        // Closed while on one of its pages: tint the header so you still see where you are.
        $active={!open && containsCurrentPage}
      >
        <group.icon size={20} aria-hidden="true" />
        {group.label}
        <GroupChevron $open={open}>
          <ChevronDown size={18} aria-hidden="true" />
        </GroupChevron>
      </GroupButton>

      {/* Always rendered (hidden when closed) so aria-controls points at a real element. */}
      <SubMenu id={listId} hidden={!open}>
        {group.items.map((item) => (
          <MenuLink key={item.to} to={item.to} onClick={onNavigate}>
            <item.icon size={18} aria-hidden="true" />
            {item.label}
          </MenuLink>
        ))}
      </SubMenu>
    </>
  )
}

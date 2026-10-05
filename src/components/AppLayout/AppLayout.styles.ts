import { NavLink } from 'react-router'
import styled, { css } from 'styled-components'

export const Layout = styled.div`
  min-height: 100vh;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: grid;
    grid-template-columns: ${({ theme }) => theme.sidebarWidth} 1fr;
  }
`

// Phones: a top bar that stays in view while the page scrolls (z-index keeps it, and
// the open menu panel, above the page and the backdrop).
// Wide screens: a full-height column on the left.
export const Sidebar = styled.aside`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.brand};
  color: ${({ theme }) => theme.colors.brandText};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 100vh;
    gap: 16px;
    padding: 24px 16px;
  }
`

// Logo on the left, hamburger on the right (phones).
export const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const LogoWrapper = styled.div`
  padding: 0 12px;
`

// Hamburger / close button. 44px: a comfortable tap target on phones.
export const MenuToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: ${({ theme }) => theme.radius};
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none; /* the side menu is always visible on wide screens */
  }
`

// Everything below the logo: pages, user name, sign out.
// Phones: a panel that drops down under the top bar, over the page, only when open.
// Wide screens: always shown, fills the rest of the side menu (so the footer can sit at the bottom).
export const MenuPanel = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? 'flex' : 'none')};
  flex-direction: column;
  gap: 16px;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  padding: 8px 16px 16px;
  background: ${({ theme }) => theme.colors.brand};
  border-top: 1px solid ${({ theme }) => theme.colors.brandTint};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    position: static;
    flex: 1;
    padding: 0;
    border-top: none;
  }
`

export const Menu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;
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
export const MenuLink = styled(NavLink)`
  ${menuItemStyles}

  &.active {
    background: ${({ theme }) => theme.colors.brandTint};
  }
`

export const MenuButton = styled.button`
  ${menuItemStyles}
`

// Phones: user name and sign out on one row, under a divider.
// Wide screens: pushed to the bottom of the side menu.
export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.brandTint};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-top: auto;
    flex-direction: column;
    align-items: stretch;
    padding-top: 0;
    border-top: none;
  }
`

export const UserName = styled.span`
  padding: 0 12px;
  font-size: 0.9rem;
  opacity: 0.85;
`

// Dims the page behind the open phone menu (below the top bar: z-index 10 > 5).
export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 5;
  background: ${({ theme }) => theme.colors.overlay};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`

// No max-width: pages use all the space next to the menu and resize with the window.
// Pages that read better narrow (the framer forms) set their own max-width.
export const Main = styled.main`
  min-width: 0; /* lets wide content (the admin table) scroll inside instead of overflowing */
  padding: 24px 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.pagePaddingDesktop};
  }
`

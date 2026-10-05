import { NavLink } from 'react-router'
import styled, { css } from 'styled-components'

export const Layout = styled.div`
  min-height: 100vh;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: grid;
    grid-template-columns: ${({ theme }) => theme.sidebarWidth} 1fr;
  }
`

export const Sidebar = styled.aside`
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

export const LogoWrapper = styled.div`
  padding: 0 12px;
`

export const Menu = styled.nav`
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
export const MenuLink = styled(NavLink)`
  ${menuItemStyles}

  &.active {
    background: ${({ theme }) => theme.colors.brandTint};
  }
`

export const MenuButton = styled.button`
  ${menuItemStyles}
`

// Pushed to the bottom of the sidebar on desktop.
export const Footer = styled.div`
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

export const UserName = styled.span`
  padding: 0 12px;
  font-size: 0.9rem;
  opacity: 0.85;
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

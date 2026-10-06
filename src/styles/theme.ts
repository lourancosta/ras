// Design tokens shared by every styled component (via ThemeProvider).
// TODO: confirm the accent colour with the official RAS branding.
export const theme = {
  colors: {
    brand: '#035339', // RAS green: side menu, primary buttons, titles
    brandText: '#ffffff',
    brandTint: 'rgba(255, 255, 255, 0.12)', // highlight on top of brand (active menu item)
    accent: '#f59e0b', // safety amber: highlights, focus rings
    bg: '#f5f6f8',
    surface: '#ffffff',
    text: '#1f2933',
    muted: '#6b7280',
    border: '#d9dde3',
    success: '#15803d',
    successBg: '#e7f4ec',
    danger: '#b91c1c',
    dangerBg: '#fdecec',
    overlay: 'rgba(0, 0, 0, 0.35)', // dims the page behind the open phone menu
    viewerBg: 'rgba(0, 0, 0, 0.94)', // full-screen photo viewer
    viewerText: '#ffffff',
    viewerControl: 'rgba(255, 255, 255, 0.16)', // round buttons on top of the photo
  },
  radius: '8px',
  sidebarWidth: '232px',
  // Space around the page content (AppLayout <Main>) on wide screens.
  // The admin submissions page uses it to size itself to exactly the window height.
  pagePaddingDesktop: '32px',
  font: "system-ui, 'Segoe UI', Roboto, sans-serif",
  // Mobile first: framers mostly use phones on site.
  breakpoints: {
    md: '768px',
  },
}

export type AppTheme = typeof theme

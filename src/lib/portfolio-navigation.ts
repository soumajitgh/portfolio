export const portfolioNavigation = [
  { href: '/', label: 'Home' },
  { href: '/technical', label: 'Technical' },
  { href: '/creative', label: 'Creative' },
  { href: '/blogs', label: 'Writing' },
  { href: '/resume', label: 'Resume' },
  { href: '/contact', label: 'Contact' },
] as const

export function isPortfolioRouteActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  if (href === '/technical')
    return /^\/(technical|projects|work|contributions)(\/|$)/.test(pathname)
  return pathname === href || pathname.startsWith(`${href}/`)
}

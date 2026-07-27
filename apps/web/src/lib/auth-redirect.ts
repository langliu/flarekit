const FALLBACK_REDIRECT = '/dashboard'
const SAFE_REDIRECT_ORIGIN = 'https://flarekit.local'
const AUTH_ENTRY_PATHS = new Set(['/login', '/register'])

export function getSafeAuthRedirect(redirect?: string) {
  if (!redirect) {
    return FALLBACK_REDIRECT
  }

  try {
    const destination = new URL(redirect, SAFE_REDIRECT_ORIGIN)

    if (destination.origin !== SAFE_REDIRECT_ORIGIN || AUTH_ENTRY_PATHS.has(destination.pathname)) {
      return FALLBACK_REDIRECT
    }

    return `${destination.pathname}${destination.search}${destination.hash}`
  } catch {
    return FALLBACK_REDIRECT
  }
}

const useSecureCookies = process.env.NODE_ENV !== 'dev'

function buildAuthCookie(name: string, value: string): string {
  const parts = [`${name}=${value}`, 'HttpOnly', 'Path=/', 'SameSite=Strict']
  if (useSecureCookies) {
    parts.push('Secure')
  }
  return parts.join('; ')
}

export function buildTokenCookie(token: string): string {
  return buildAuthCookie('token', token)
}

export function buildRefreshTokenCookie(refreshToken: string): string {
  return buildAuthCookie('refreshToken', refreshToken)
}

export function buildDeletedAuthCookie(name: 'token' | 'refreshToken'): string {
  const parts = [`${name}=deleted`, 'expires=Thu, 01 Jan 1970 00:00:00 GMT', 'Path=/', 'SameSite=Strict']
  if (useSecureCookies) {
    parts.push('Secure')
  }
  return parts.join('; ')
}

import { HttpError } from '@hatsuportal/contracts'
import { RefreshTokenError } from 'application/errors/RefreshTokenError'

// HttpClient already retried once after a token refresh, so a 401 or a failed
// refresh here means the session is gone — not a transient preferences outage.
export const isAuthFailure = (error: unknown): boolean => {
  if (error instanceof RefreshTokenError) {
    return true
  }
  return error instanceof HttpError && error.status === 401
}

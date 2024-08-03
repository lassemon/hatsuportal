import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { useAuthServiceContext } from 'infrastructure/hooks/useAuthServiceContext'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { userPreferencesAtom } from 'ui/entities/user/state/userPreferencesAtom'
import { sessionExpiredAtom } from 'ui/shared/state/sessionExpiredAtom'
import { clearStoryClientState } from 'ui/entities/story/model/clearStoryClientState'

export function useLogout() {
  const { authService, sessionExpiredNotifier } = useAuthServiceContext()
  const setAuthState = useSetAtom(authAtom)
  const setUserPreferences = useSetAtom(userPreferencesAtom)
  const setSessionExpired = useSetAtom(sessionExpiredAtom)

  const clearClientAuthState = useCallback(() => {
    clearStoryClientState()
    setAuthState({ loggedIn: false, user: undefined })
    setUserPreferences(null)
    setSessionExpired(false)
    sessionExpiredNotifier.reset()
  }, [setAuthState, setUserPreferences, setSessionExpired, sessionExpiredNotifier])

  const logout = useCallback(async () => {
    clearClientAuthState()
    return authService.logout()
  }, [authService, clearClientAuthState])

  return { logout, clearClientAuthState }
}

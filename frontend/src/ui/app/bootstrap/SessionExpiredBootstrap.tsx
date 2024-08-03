import React, { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { userPreferencesAtom } from 'ui/entities/user/state/userPreferencesAtom'
import { sessionExpiredAtom } from 'ui/shared/state/sessionExpiredAtom'
import { useAuthServiceContext } from 'infrastructure/hooks/useAuthServiceContext'
import { clearStoryClientState } from 'ui/entities/story/model/clearStoryClientState'

const SessionExpiredBootstrap: React.FC = ({ children }) => {
  const { sessionExpiredNotifier } = useAuthServiceContext()
  const setAuthState = useSetAtom(authAtom)
  const setUserPreferences = useSetAtom(userPreferencesAtom)
  const setSessionExpired = useSetAtom(sessionExpiredAtom)

  useEffect(() => {
    sessionExpiredNotifier.setListener(() => {
      clearStoryClientState()
      setAuthState((prev) => {
        if (prev.loggedIn) {
          setSessionExpired(true)
        }
        return { loggedIn: false, user: undefined }
      })
      setUserPreferences(null)
    })

    return () => {
      sessionExpiredNotifier.clearListener()
    }
  }, [sessionExpiredNotifier, setAuthState, setUserPreferences, setSessionExpired])

  return <>{children}</>
}

export default SessionExpiredBootstrap

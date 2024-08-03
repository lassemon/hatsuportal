import React, { useEffect, useState } from 'react'
import { useSetAtom } from 'jotai'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { useStorageServiceContext } from 'infrastructure/hooks/useStorageServiceContext'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { usePreferenceSetters, fetchAndStorePreferences } from 'ui/entities/user/state/storePreferences'
import { errorAtom } from 'ui/shared/state/errorAtom'
import { isAuthFailure } from 'infrastructure/services/auth/isAuthFailure'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'

interface PreferencesBootstrapProps {
  children: React.ReactNode
}

const PreferencesBootstrap: React.FC<PreferencesBootstrapProps> = ({ children }) => {
  const { localStorageAuthService } = useStorageServiceContext()
  const entityServiceContext = useEntityServiceContext()
  const setAuthState = useSetAtom(authAtom)
  const setters = usePreferenceSetters()
  const setError = useSetAtom(errorAtom)
  const [isBootstrapComplete, setIsBootstrapComplete] = useState(false)

  // One-shot cold-load gate: read auth from localStorage (not authAtom — it hydrates
  // from a Promise and can look like a guest on first read), fetch prefs for logged-in
  // users, then allow Theme/children to mount. Empty deps: must not re-run when
  // authAtom updates later (login/logout handle prefs separately).
  useEffect(() => {
    let isMounted = true

    async function runPreferencesBootstrap() {
      try {
        const stored = await localStorageAuthService.findById('authState')
        const isLoggedIn = stored?.loggedIn === true

        if (!isLoggedIn) {
          return
        }

        await fetchAndStorePreferences(entityServiceContext.preferencesService, setters)
      } catch (error) {
        if (isAuthFailure(error)) {
          setAuthState({ loggedIn: false, user: undefined })
          setters.setUserPreferences(null)
          void localStorageAuthService.store({ loggedIn: false, user: undefined }, 'authState')
        } else if (error instanceof Error) {
          setError(error)
        } else {
          setError(new Error('Failed to load preferences'))
        }
      } finally {
        if (isMounted) {
          setIsBootstrapComplete(true)
        }
      }
    }

    void runPreferencesBootstrap()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot bootstrap on mount
  }, [])

  if (!isBootstrapComplete) {
    return <LoadingSkeleton skeletonProps={{ height: '4em' }} />
  }

  return <>{children}</>
}

export default PreferencesBootstrap

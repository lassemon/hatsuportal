import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'
import { applySelectedTheme, usePreferenceSetters } from 'ui/entities/user/state/storePreferences'
import { userPreferencesAtom } from 'ui/entities/user/state/userPreferencesAtom'
import { errorAtom } from 'ui/shared/state/errorAtom'
import { successAtom } from 'ui/shared/state/successAtom'

export function useApplyThemePreference() {
  const entityServiceContext = useEntityServiceContext()
  const setters = usePreferenceSetters()
  const [preferences] = useAtom(userPreferencesAtom)
  const [errorState, setError] = useAtom(errorAtom)
  const setSuccess = useSetAtom(successAtom)
  const [applyingThemeId, setApplyingThemeId] = useState<string | null>(null)
  const controllersRef = useRef<AbortController[]>([])

  const activeThemeId = preferences?.selectedTheme.id ?? null

  useEffect(() => {
    return () => {
      controllersRef.current.forEach((controller) => controller.abort())
    }
  }, [])

  const applyTheme = async (theme: ThemeViewModel) => {
    if (!preferences) return
    if (theme.id === activeThemeId) return
    if (errorState) setError(null)

    const controller = new AbortController()
    controllersRef.current.push(controller)
    setApplyingThemeId(theme.id)

    try {
      await applySelectedTheme(theme.id, entityServiceContext.preferencesService, setters, {
        signal: controller.signal
      })
      setSuccess({ message: `Theme "${theme.name}" is now your active theme.` })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setError(error instanceof Error ? error : new Error('Failed to apply theme'))
    } finally {
      setApplyingThemeId(null)
    }
  }

  return {
    activeThemeId,
    applyingThemeId,
    onUseTheme: preferences ? applyTheme : undefined
  }
}
